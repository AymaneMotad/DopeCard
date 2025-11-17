const passkit = require('passkit-generator');
const axios = require('axios');
import * as fs from 'fs';
import * as path from 'path';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';
import { mapCardTypeToStoreCardFields, type CardData } from '@/modules/pass-generation/card-type-mappers';


const serviceAccount = {
    type: process.env.SERVICE_ACCOUNT_TYPE,
    project_id: process.env.SERVICE_ACCOUNT_PROJECT_ID,
    private_key_id: process.env.SERVICE_ACCOUNT_PRIVATE_KEY_ID,
    private_key: process.env.SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email: process.env.SERVICE_ACCOUNT_CLIENT_EMAIL,
    client_id: process.env.SERVICE_ACCOUNT_CLIENT_ID,
    auth_uri: process.env.SERVICE_ACCOUNT_AUTH_URI,
    token_uri: process.env.SERVICE_ACCOUNT_TOKEN_URI,
    auth_provider_x509_cert_url: process.env.SERVICE_ACCOUNT_AUTH_PROVIDER_X509_CERT_URL,
    client_x509_cert_url: process.env.SERVICE_ACCOUNT_CLIENT_X509_CERT_URL,
    universe_domain: process.env.SERVICE_ACCOUNT_UNIVERSE_DOMAIN
};


//console.log('service account is', serviceAccount)

/**
 * Validates that a buffer contains valid image data by checking magic bytes
 * PNG: 89 50 4E 47 0D 0A 1A 0A
 * JPEG: FF D8 FF
 */
function validateImageBuffer(buffer: Buffer, assetName: string): void {
    if (buffer.length < 8) {
        throw new Error(`Asset ${assetName}: Buffer too small to be a valid image (${buffer.length} bytes)`);
    }

    // Check for PNG signature
    const isPNG = buffer[0] === 0x89 && 
                  buffer[1] === 0x50 && 
                  buffer[2] === 0x4E && 
                  buffer[3] === 0x47 &&
                  buffer[4] === 0x0D && 
                  buffer[5] === 0x0A && 
                  buffer[6] === 0x1A && 
                  buffer[7] === 0x0A;

    // Check for JPEG signature
    const isJPEG = buffer[0] === 0xFF && 
                   buffer[1] === 0xD8 && 
                   buffer[2] === 0xFF;

    if (!isPNG && !isJPEG) {
        const firstBytes = Array.from(buffer.slice(0, 8))
            .map(b => `0x${b.toString(16).padStart(2, '0')}`)
            .join(' ');
        throw new Error(
            `Asset ${assetName}: Invalid image format. Expected PNG or JPEG. ` +
            `First 8 bytes: ${firstBytes}`
        );
    }

    console.log(`Asset ${assetName}: Valid ${isPNG ? 'PNG' : 'JPEG'} image (${buffer.length} bytes)`);
}

export async function generatePass(
    userId: string, 
    stampCount: number = 0,
    cardType: string = 'stamp',
    cardData?: CardData
) {
    console.log('Starting to initiate the pass creation');
    console.log('Card type:', cardType);

    const certUrl = 'https://utfs.io/f/v9dcWxyyBXm21Gwze4c7l6M8cWvkzGsuYqT9a1SpxhnLOrB4';
    const wwdrUrl = 'https://utfs.io/f/v9dcWxyyBXm2uRC4Dg3rFvDKcpQeTOCk1SUmysgVLA7R8fME';
    const privateKeyUrl = 'https://utfs.io/f/v9dcWxyyBXm2HnAiB7kqANS5hgWbHv3yTOp0w7KoRPaLVBCx';

    let p12Buffer, wwdrBuffer, privateKey;

    try {
        // Fetch certificates using axios
        console.log('Fetching certificates...');
        const [certResponse, wwdrResponse, privateKeyResponse] = await Promise.all([
            axios.get(certUrl, { responseType: 'arraybuffer' }),
            axios.get(wwdrUrl, { responseType: 'arraybuffer' }),
            axios.get(privateKeyUrl, { responseType: 'text' }),
        ]);

        // Validate responses
        if (certResponse.status !== 200 || wwdrResponse.status !== 200 || privateKeyResponse.status !== 200) {
            throw new Error('Failed to fetch one or more certificates');
        }

        p12Buffer = Buffer.from(certResponse.data);
        wwdrBuffer = Buffer.from(wwdrResponse.data);
        privateKey = privateKeyResponse.data;

        // Validate buffers
        if (p12Buffer.length === 0 || wwdrBuffer.length === 0 || !privateKey) {
            throw new Error('One or more buffers are empty');
        }
        
        console.log('Certificates fetched and validated successfully.');

        // Fetch all assets - use template assets if provided, otherwise use defaults
        const assetUrls = {
            artwork: cardData?.strip || 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
            artwork2x: cardData?.strip || 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
            artwork3x: cardData?.strip || 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
            icon: cardData?.icon || 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
            icon2x: cardData?.icon || 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
            logo: cardData?.logo || 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
            logo2x: cardData?.logo || 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
            secondaryLogo: cardData?.logo || 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
            secondaryLogo2x: cardData?.logo || 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71'
        };

        console.log('Fetching assets...');
        
        // Fetch all assets concurrently with detailed error handling
        const assetNames = Object.keys(assetUrls);
        const assetUrlArray = Object.values(assetUrls);
        
        const responses = await Promise.all(
            assetUrlArray.map(async (url, index) => {
                const assetName = assetNames[index];
                try {
                    console.log(`Fetching asset: ${assetName} from ${url}`);
                    const response = await axios.get(url, { 
                        responseType: 'arraybuffer',
                        validateStatus: (status) => status === 200 // Only accept 200 status
                    });
                    
                    // Validate HTTP status
                    if (response.status !== 200) {
                        throw new Error(`HTTP ${response.status} for ${assetName}`);
                    }
                    
                    // Validate Content-Type header
                    const contentType = response.headers['content-type'] || '';
                    if (!contentType.startsWith('image/')) {
                        console.warn(`Warning: ${assetName} has non-image Content-Type: ${contentType}`);
                    }
                    
                    console.log(`Asset ${assetName}: Status ${response.status}, Content-Type: ${contentType}, Size: ${response.data.byteLength} bytes`);
                    
                    return { assetName, data: response.data, status: response.status, contentType };
                } catch (error: any) {
                    const errorMsg = error.response 
                        ? `HTTP ${error.response.status} ${error.response.statusText}`
                        : error.message;
                    throw new Error(`Failed to fetch asset ${assetName} from ${url}: ${errorMsg}`);
                }
            })
        );

        // Create buffers for each asset and validate them
        const [
            artworkBuffer,
            artwork2xBuffer,
            artwork3xBuffer,
            iconBuffer,
            icon2xBuffer,
            logoBuffer,
            logo2xBuffer,
            secondaryLogoBuffer,
            secondaryLogo2xBuffer
        ] = responses.map((response, index) => {
            const assetName = assetNames[index];
            const buffer = Buffer.from(response.data);
            
            // Validate buffer is not empty
            if (buffer.length === 0) {
                throw new Error(`Asset ${assetName}: Buffer is empty`);
            }
            
            // Validate image format
            validateImageBuffer(buffer, assetName);
            
            return buffer;
        });

        // Log buffer sizes summary
        console.log('All assets fetched and validated successfully. Buffer sizes:', {
            artworkBuffer: artworkBuffer.length,
            artwork2xBuffer: artwork2xBuffer.length,
            artwork3xBuffer: artwork3xBuffer.length,
            iconBuffer: iconBuffer.length,
            icon2xBuffer: icon2xBuffer.length,
            logoBuffer: logoBuffer.length,
            logo2xBuffer: logo2xBuffer.length,
            secondaryLogoBuffer: secondaryLogoBuffer.length,
            secondaryLogo2xBuffer: secondaryLogo2xBuffer.length
        });

        // Prepare card data with defaults for backward compatibility
        const cardDataWithDefaults: CardData = {
            stampCount,
            stampThreshold: 10,
            ...cardData
        };

        // Generate storeCard field structure based on card type
        const storeCardFields = mapCardTypeToStoreCardFields(cardType, cardDataWithDefaults);

        // Get base URL for web service
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
            ? `https://${process.env.VERCEL_URL}` 
            : 'http://localhost:3000';

        // Create storeCard pass JSON
        // Using storeCard pass type for all card types
        const passJson: any = {
            formatVersion: 1,
            serialNumber: `COFFEE${userId}`,
            passTypeIdentifier: 'pass.com.dopecard.passmaker',
            teamIdentifier: 'DTWNQT4JQL',
            // webServiceURL commented out for debugging - Apple Wallet may reject HTTP URLs
            // webServiceURL: `${baseUrl}/api/passes/v1`,
            // authenticationToken: process.env.PASS_AUTH_TOKEN || 'default-token-change-in-production',
            description: cardData?.cardTitle || 'Loyalty Card',
            organizationName: cardData?.businessName || 'Brew Rewards',
            logoText: cardData?.businessName || 'Brew Rewards',
            backgroundColor: cardData?.backgroundColor || 'rgb(89, 52, 28)',
            foregroundColor: cardData?.textColor || 'rgb(255, 255, 255)',
            labelColor: cardData?.textColor || 'rgb(255, 255, 255)',
            // Using storeCard pass type
            storeCard: {
                headerFields: storeCardFields.headerFields,
                primaryFields: storeCardFields.primaryFields,
                secondaryFields: storeCardFields.secondaryFields || [],
                auxiliaryFields: storeCardFields.auxiliaryFields || [],
                backFields: storeCardFields.backFields || []
            },
            barcode: {
                message: userId, // Using userId directly
                format: 'PKBarcodeFormatQR',
                messageEncoding: 'iso-8859-1'
            }
        };

        // Validate pass.json structure for storeCard pass type
        console.log('Validating pass.json structure...');
        if (!passJson.serialNumber || !passJson.passTypeIdentifier || !passJson.teamIdentifier) {
            throw new Error('Pass JSON missing required fields: serialNumber, passTypeIdentifier, or teamIdentifier');
        }
        if (!passJson.storeCard) {
            throw new Error('Pass JSON missing required storeCard structure');
        }
        if (!passJson.barcode || !passJson.barcode.message || !passJson.barcode.format) {
            throw new Error('Pass JSON missing required barcode fields');
        }
        console.log('Pass.json structure validated successfully.');
        console.log('Pass type: storeCard');
        console.log('Pass serial number:', passJson.serialNumber);
        console.log('Pass type identifier:', passJson.passTypeIdentifier);
        console.log('Pass team identifier:', passJson.teamIdentifier);
        console.log('Barcode message:', passJson.barcode.message);
        console.log('Barcode format:', passJson.barcode.format);
        
        // Log full pass.json for debugging
        const passJsonStr = JSON.stringify(passJson, null, 2);
        console.log('Pass.json content:', passJsonStr);

        // Create a new PKPass instance with all assets for storeCard
        // Including strip images for visual appeal
        console.log('Creating PKPass instance...');
        const pass = new passkit.PKPass({
            "pass.json": Buffer.from(JSON.stringify(passJson)),
            "logo.png": logoBuffer,
            "logo@2x.png": logo2xBuffer,
            "icon.png": iconBuffer,
            "icon@2x.png": icon2xBuffer,
            "strip.png": artworkBuffer,
            "strip@2x.png": artwork2xBuffer,
            "strip@3x.png": artwork3xBuffer,
            "thumbnail.png": secondaryLogoBuffer,
            "thumbnail@2x.png": secondaryLogo2xBuffer,
        }, {
            wwdr: wwdrBuffer,
            signerCert: p12Buffer,
            signerKey: privateKey,
            signerKeyPassphrase: 'sugoi'
        });

        console.log("PKPass instance created successfully.");

        // Set barcode using setBarcodes() method for proper visibility
        // This ensures the QR code is properly rendered in Apple Wallet
        console.log('Setting barcode...');
        try {
            pass.setBarcodes({
                message: userId,
                format: 'PKBarcodeFormatQR',
                messageEncoding: 'iso-8859-1',
                altText: 'Scan to redeem'
            });
            console.log('Barcode set successfully.');
        } catch (error: any) {
            // If barcode already exists in pass.json, that's fine - it will still work
            console.warn('Warning: Error setting barcode (may already exist):', error.message);
        }
        
        // Localize content (matching old working version) - this is optional
        console.log('Setting pass localization...');
        try {
            pass.localize("en", { 
                description: cardData?.cardTitle || 'Loyalty Card' 
            });
            console.log('Pass localized successfully.');
        } catch (error: any) {
            // Log warning but don't fail - localization is optional
            console.warn('Warning: Error setting localization:', error.message);
        }

        // Generate the .pkpass file
        console.log('Generating pkpass buffer...');
        const buffer = await pass.getAsBuffer();

        // Validate the generated buffer
        if (!buffer || buffer.length === 0) {
            throw new Error('Generated pkpass buffer is empty');
        }

        // Validate it's a valid ZIP file (pkpass is a ZIP archive)
        if (buffer.length < 2 || buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
            const firstBytes = Array.from(buffer.slice(0, 4))
                .map(b => `0x${b.toString(16).padStart(2, '0')}`)
                .join(' ');
            throw new Error(
                `Generated pkpass buffer does not start with ZIP signature (PK). ` +
                `First 4 bytes: ${firstBytes}. Expected: 0x50 0x4B`
            );
        }

        console.log('Pass generated successfully!');
        console.log('Pass generation buffer size:', buffer.length, 'bytes');
        console.log('Buffer starts with ZIP signature (PK):', buffer[0] === 0x50 && buffer[1] === 0x4B);

        return buffer;

    } catch (error) {
        console.error('Error generating pass:', error);
        throw new Error(`Pass generation failed: ${error.message}`);
    }
}


// Google Wallet pass generation logic
class DemoLoyalty {
    credentials = serviceAccount;
    client : any;
    issuerId = '3388000000022823734';
    classSuffix = 'COFFEE_LOYALTY';    
    objectSuffix = 'DEMO_OBJECT';

    constructor() {
          this.auth();
      }

    auth() {
        const auth = new google.auth.GoogleAuth({
          credentials: this.credentials,
          scopes: ['https://www.googleapis.com/auth/wallet_object.issuer'],
        });
  
      
        this.client = google.walletobjects({
          version: 'v1',
          auth: auth,
        });
      }

      async createClass() {
          let response;
          
        // Check if the class exists
        try {
            response = await this.client.loyaltyclass.get({
                resourceId: `${this.issuerId}.${this.classSuffix}`
            });

            console.log(`Class ${this.issuerId}.${this.classSuffix} already exists!`);

            return `${this.issuerId}.${this.classSuffix}`;
        } catch (err: any) {
            if (err.response && err.response.status !== 404) {
                // Something else went wrong...
                console.log(err);
                return `${this.issuerId}.${this.classSuffix}`;
            }
        }
    
          // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyclass
          let newClass = {
            'id': `${this.issuerId}.${this.classSuffix}`,
            'issuerName': 'Brew Rewards',
            'reviewStatus': 'UNDER_REVIEW',
            'programName': 'Brew Rewards Program',
            'programLogo': {
              'sourceUri': {
                'uri': 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D'
              },
              'contentDescription': {
                'defaultValue': {
                  'language': 'en-US',
                  'value': 'Brew Rewards Logo'
                }
              }
            }
          };
    
          response = await this.client.loyaltyclass.insert({
            requestBody: newClass
          });
    
          console.log('Class insert response');
          console.log(response);
    
          return `${this.issuerId}.${this.classSuffix}`;
        }

        async createObject(userId: string, stampCount: number = 0, cardType: string = 'stamp', cardData?: CardData) {
          let response;

          // Check if the object exists
          try {
            response = await this.client.loyaltyobject.get({
                resourceId: `${this.issuerId}.${this.objectSuffix}`
            });
    
              console.log(`Object ${this.issuerId}.${this.objectSuffix} already exists!`);
    
            return `${this.issuerId}.${this.objectSuffix}`;
          } catch (err: any) {
            if (err.response && err.response.status !== 404) {
                // Something else went wrong...
                console.log(err);
                return `${this.issuerId}.${this.objectSuffix}`;
              }
          }

          // Generate text modules based on card type
          const textModules = this.generateTextModules(cardType, stampCount, cardData);
          const businessName = cardData?.businessName || 'Brew Rewards';
          
          // Use template assets if provided, otherwise use defaults
          const heroImageUrl = cardData?.strip || 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB';
          const logoUrl = cardData?.logo || 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D';
    
           // See link below for more information on required properties
          // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyobject
          let newObject: any = {
              'id': `${this.issuerId}.${this.objectSuffix}`,
              'classId': `${this.issuerId}.${this.classSuffix}`,
              'state': 'ACTIVE',
               'heroImage': {
                'sourceUri': {
                  'uri': heroImageUrl
                },
                'contentDescription': {
                  'defaultValue': {
                    'language': 'en-US',
                    'value': 'Hero image description'
                  }
                }
              },
              'textModulesData': textModules,
              'linksModuleData': {
                'uris': [
                  {
                    'uri': 'https://dopecard.com/locations',
                    'description': 'Visit our locations',
                    'id': 'LINK_MODULE_URI_ID'
                  },
                  {
                    'uri': 'tel:555-555-5555',
                    'description': 'Call us',
                    'id': 'LINK_MODULE_TEL_ID'
                  }
                ]
              },
              'imageModulesData': [
                {
                  'mainImage': {
                    'sourceUri': {
                      'uri': logoUrl
                    },
                    'contentDescription': {
                      'defaultValue': {
                        'language': 'en-US',
                        'value': `${businessName} Logo`
                      }
                    }
                  },
                  'id': 'IMAGE_MODULE_ID'
                }
              ],
              'barcode': {
                'type': 'QR_CODE',
                'value': `USER${userId}`
              },
              'locations': [
                {
                  'latitude': 37.6189722,
                  'longitude': -122.3748889,
                }
              ],
              'accountId': userId,
              'accountName': cardData?.cardTitle || 'Member',
          };

          // Add card-type-specific fields
          if (cardType === 'stamp' || cardType === 'multipass') {
            newObject.loyaltyPoints = {
              'label': cardType === 'multipass' ? 'Visits' : 'Stamps',
              'balance': {
                'int': stampCount
              }
            };
          } else if (cardType === 'points' || cardType === 'reward') {
            const pointsBalance = cardData?.pointsBalance || stampCount;
            newObject.loyaltyPoints = {
              'label': 'Points',
              'balance': {
                'int': pointsBalance
              }
            };
          } else if (cardType === 'gift' || cardType === 'certificate') {
            const balance = cardData?.balance || 0;
            newObject.accountBalance = {
              'label': 'Balance',
              'balance': {
                'micros': Math.round(balance * 1000000) // Convert to micros
              }
            };
          }
    
            response = await this.client.loyaltyobject.insert({
              requestBody: newObject
            });
      
          console.log('Object insert response');
          console.log(response);
    
          return `${this.issuerId}.${this.objectSuffix}`;
        }

        generateTextModules(cardType: string, stampCount: number, cardData?: CardData): any[] {
          const businessName = cardData?.businessName || 'Brew Rewards';
          const modules: any[] = [];

          switch (cardType) {
            case 'stamp':
              const threshold = cardData?.stampThreshold || 10;
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `You have ${stampCount} stamps! ${stampCount >= threshold ? 'You have a free reward!' : `Keep collecting - ${threshold - stampCount} more to go!`}`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'points':
            case 'reward':
              const pointsBalance = cardData?.pointsBalance || stampCount;
              const nextThreshold = cardData?.nextRewardThreshold || 100;
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `You have ${pointsBalance} points! ${pointsBalance >= nextThreshold ? 'Reward available!' : `${nextThreshold - pointsBalance} more points needed.`}`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'discount':
              const discountPercentage = cardData?.discountPercentage || 0;
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `Your current discount: ${discountPercentage}%`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'cashback':
            case 'cash_back':
              const cashbackPercentage = cardData?.cashbackPercentage || 0;
              const cashbackEarned = cardData?.cashbackEarned || 0;
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `Cashback: ${cashbackPercentage}% | Earned: £${cashbackEarned.toFixed(2)}`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'membership':
              const expirationDate = cardData?.expirationDate || 'N/A';
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `Valid until: ${expirationDate}`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'coupon':
              const offerDescription = cardData?.offerDescription || 'Special Offer';
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': offerDescription,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'gift':
            case 'certificate':
              const balance = cardData?.balance || 0;
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `Gift Card Balance: £${balance}`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            case 'multipass':
              const visitsLeft = stampCount;
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `Visits remaining: ${visitsLeft}`,
                'id': 'TEXT_MODULE_MAIN'
              });
              break;
            default:
              modules.push({
                'header': `Welcome to ${businessName}!`,
                'body': `You have ${stampCount} stamps! ${stampCount >= 10 ? 'You have a free reward!' : 'Keep collecting!'}`,
                'id': 'TEXT_MODULE_MAIN'
              });
          }

          return modules;
        }

       /**
       * Generate a signed JWT that creates a new pass class and object.
       *
       * When the user opens the "Add to Google Wallet" URL and saves the pass to
       * their wallet, the pass class and object defined in the JWT are
       * created. This allows you to create multiple pass classes and objects in
       * one API call when the user saves the pass to their wallet.
       *
       * @param {string} issuerId The issuer ID being used for this request.
       * @param {string} classSuffix Developer-defined unique ID for the pass class.
       * @param {string} objectSuffix Developer-defined unique ID for the pass object.
       *
       * @returns {string} An "Add to Google Wallet" link.
       */
      createJwtNewObjects(userId: string, stampCount: number = 0, cardType: string = 'stamp', cardData?: CardData) {
        const businessName = cardData?.businessName || 'Brew Rewards';
        const textModules = this.generateTextModules(cardType, stampCount, cardData);

        // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyclass
        let newClass = {
          'id': `${this.issuerId}.${this.classSuffix}`,
          'issuerName': businessName,
          'reviewStatus': 'UNDER_REVIEW',
          'programName': `${businessName} Program`,
          'programLogo': {
            'sourceUri': {
                'uri': 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D'
            },
            'contentDescription': {
              'defaultValue': {
                'language': 'en-US',
                'value': `${businessName} Logo`
              }
            }
          }
        };
    
        // See link below for more information on required properties
        // https://developers.google.com/wallet/retail/loyalty-cards/rest/v1/loyaltyobject
        let newObject: any = {
            'id': `${this.issuerId}.${this.objectSuffix}`,
            'classId': `${this.issuerId}.${this.classSuffix}`,
            'state': 'ACTIVE',
             'heroImage': {
                'sourceUri': {
                  'uri': 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB'
                },
                'contentDescription': {
                  'defaultValue': {
                    'language': 'en-US',
                    'value': 'Hero image description'
                  }
                }
              },
              'textModulesData': textModules,
              'linksModuleData': {
                'uris': [
                  {
                    'uri': 'https://dopecard.com/locations',
                    'description': 'Visit our locations',
                    'id': 'LINK_MODULE_URI_ID'
                  },
                  {
                    'uri': 'tel:555-555-5555',
                    'description': 'Call us',
                    'id': 'LINK_MODULE_TEL_ID'
                  }
                ]
              },
              'imageModulesData': [
                {
                  'mainImage': {
                    'sourceUri': {
                      'uri': 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D'
                    },
                    'contentDescription': {
                      'defaultValue': {
                        'language': 'en-US',
                        'value': `${businessName} Logo`
                      }
                    }
                  },
                  'id': 'IMAGE_MODULE_ID'
                }
              ],
              'barcode': {
                'type': 'QR_CODE',
                'value': `USER${userId}`
              },
              'locations': [
                {
                  'latitude': 37.6189722,
                  'longitude': -122.3748889,
                }
              ],
              'accountId': userId,
              'accountName': cardData?.cardTitle || 'Member',
        };

        // Add card-type-specific fields
        if (cardType === 'stamp' || cardType === 'multipass') {
          newObject.loyaltyPoints = {
            'label': cardType === 'multipass' ? 'Visits' : 'Stamps',
            'balance': {
              'int': stampCount
            }
          };
        } else if (cardType === 'points' || cardType === 'reward') {
          const pointsBalance = cardData?.pointsBalance || stampCount;
          newObject.loyaltyPoints = {
            'label': 'Points',
            'balance': {
              'int': pointsBalance
            }
          };
        } else if (cardType === 'gift' || cardType === 'certificate') {
          const balance = cardData?.balance || 0;
          newObject.accountBalance = {
            'label': 'Balance',
            'balance': {
              'micros': Math.round(balance * 1000000) // Convert to micros
            }
          };
        }
        
        // Create the JWT claims
        let claims = {
          iss: this.credentials.client_email,
          aud: 'google',
          origins: ['www.example.com'],
          typ: 'savetowallet',
          payload: {
            // The listed classes and objects will be created
            loyaltyClasses: [newClass],
            loyaltyObjects: [newObject]
          }
        };
    
        // The service account credentials are used to sign the JWT
        let token = jwt.sign(claims, this.credentials.private_key, { algorithm: 'RS256' });
    
        console.log('Add to Google Wallet link');
        console.log(`https://pay.google.com/gp/v/save/${token}`);
    
        return `https://pay.google.com/gp/v/save/${token}`;
      }
}

// Google Pass function
export async function generateGooglePass(
    userId: string, 
    stampCount: number = 0,
    cardType: string = 'stamp',
    cardData?: CardData
) {
    try {
        const demo = new DemoLoyalty();
        await demo.createClass();
        await demo.createObject(userId, stampCount, cardType, cardData);
        const jwtLink = demo.createJwtNewObjects(userId, stampCount, cardType, cardData);

        const buffer = Buffer.from(jwtLink, 'utf-8');
        console.log('Google pass generated as buffer:', buffer.length);
        return buffer;

    } catch (error: any) {
        console.error('Error generating Google Wallet pass:', error);
        throw new Error(`Google Wallet pass generation failed: ${error.message}`);
    }
}

