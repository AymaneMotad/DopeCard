/**
 * Enhanced Template-based Pass Generation
 * 
 * These functions generate passes using templates while reusing the existing
 * certificate and asset fetching logic. They create passes with template-specific
 * colors, assets, and styling.
 */

const passkit = require('passkit-generator');
const axios = require('axios');
import { PassTemplate, getTemplate } from './templates';
import { google } from 'googleapis';
import jwt from 'jsonwebtoken';

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

export interface TemplatePassConfig {
  userId: string;
  stampCount?: number;
  templateId: string;
  // Card information
  cardTitle?: string;
  businessName?: string;
  description?: string;
  organizationName?: string;
  // Optional overrides
  customColors?: {
    backgroundColor?: string;
    foregroundColor?: string;
    labelColor?: string;
  };
  customAssets?: {
    icon?: string;
    icon2x?: string;
    logo?: string;
    logo2x?: string;
    strip?: string;
    strip2x?: string;
    strip3x?: string;
    thumbnail?: string;
    thumbnail2x?: string;
  };
}

/**
 * Generate iOS pass using a template
 * This function uses the template configuration but reuses certificate fetching logic
 */
export async function generateTemplatePass(config: TemplatePassConfig): Promise<Buffer> {
  const template = getTemplate(config.templateId);
  
  if (!template) {
    throw new Error(`Template with ID "${config.templateId}" not found`);
  }

  console.log(`Generating pass with template: ${template.name}`);

  // Certificate URLs (reused from original implementation)
  const certUrl = 'https://utfs.io/f/v9dcWxyyBXm21Gwze4c7l6M8cWvkzGsuYqT9a1SpxhnLOrB4';
  const wwdrUrl = 'https://utfs.io/f/v9dcWxyyBXm2uRC4Dg3rFvDKcpQeTOCk1SUmysgVLA7R8fME';
  const privateKeyUrl = 'https://utfs.io/f/v9dcWxyyBXm2HnAiB7kqANS5hgWbHv3yTOp0w7KoRPaLVBCx';

  let p12Buffer, wwdrBuffer, privateKey;

  try {
    // Fetch certificates (reused from original)
    console.log('Fetching certificates...');
    const [certResponse, wwdrResponse, privateKeyResponse] = await Promise.all([
      axios.get(certUrl, { responseType: 'arraybuffer' }),
      axios.get(wwdrUrl, { responseType: 'arraybuffer' }),
      axios.get(privateKeyUrl, { responseType: 'text' }),
    ]);

    if (certResponse.status !== 200 || wwdrResponse.status !== 200 || privateKeyResponse.status !== 200) {
      throw new Error('Failed to fetch one or more certificates');
    }

    p12Buffer = Buffer.from(certResponse.data);
    wwdrBuffer = Buffer.from(wwdrResponse.data);
    privateKey = privateKeyResponse.data;

    if (p12Buffer.length === 0 || wwdrBuffer.length === 0 || !privateKey) {
      throw new Error('One or more buffers are empty');
    }

    console.log('Certificates fetched successfully.');

    // Use template assets or custom overrides
    const assetUrls = {
      artwork: config.customAssets?.strip || template.ios.assets.strip || 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      artwork2x: config.customAssets?.strip2x || template.ios.assets.strip2x || 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
      artwork3x: config.customAssets?.strip3x || template.ios.assets.strip3x || 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
      icon: config.customAssets?.icon || template.ios.assets.icon || 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
      icon2x: config.customAssets?.icon2x || template.ios.assets.icon2x || 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
      logo: config.customAssets?.logo || template.ios.assets.logo || 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      logo2x: config.customAssets?.logo2x || template.ios.assets.logo2x || 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
      secondaryLogo: config.customAssets?.thumbnail || template.ios.assets.thumbnail || 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      secondaryLogo2x: config.customAssets?.thumbnail2x || template.ios.assets.thumbnail2x || 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71'
    };

    console.log('Fetching assets...');
    const responses = await Promise.all(
      Object.values(assetUrls).map(url => axios.get(url, { responseType: 'arraybuffer' }))
    );

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
    ] = responses.map(response => Buffer.from(response.data));

    // Use template colors or custom overrides
    const backgroundColor = config.customColors?.backgroundColor || template.ios.backgroundColor;
    const foregroundColor = config.customColors?.foregroundColor || template.ios.foregroundColor;
    const labelColor = config.customColors?.labelColor || template.ios.labelColor;

    // Get base URL for web service
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';

    const stampCount = config.stampCount || 0;
    const cardTitle = config.cardTitle || template.ios.logoText || 'Loyalty Card';
    const businessName = config.businessName || template.ios.logoText || 'Rewards';
    const organizationName = config.organizationName || businessName;

    // Create the pass JSON with template colors
    const passJson = {
      formatVersion: 1,
      serialNumber: `COFFEE${config.userId}`,
      passTypeIdentifier: 'pass.com.dopecard.passmaker',
      teamIdentifier: 'DTWNQT4JQL',
      webServiceURL: `${baseUrl}/api/passes/v1`,
      authenticationToken: process.env.PASS_AUTH_TOKEN || 'default-token-change-in-production',
      description: config.description || cardTitle,
      organizationName: organizationName,
      logoText: template.ios.logoText || businessName,
      foregroundColor: foregroundColor,
      backgroundColor: backgroundColor,
      labelColor: labelColor,
      storeCard: {
        headerFields: [
          {
            key: 'balance',
            label: 'STAMPS',
            value: `${stampCount}/10`,
            textAlignment: 'PKTextAlignmentCenter'
          }
        ],
        primaryFields: [
          {
            key: 'offer',
            label: 'REWARD STATUS',
            value: stampCount >= 10 ? 'FREE COFFEE!' : 'Keep collecting!',
            textAlignment: 'PKTextAlignmentCenter'
          }
        ],
        secondaryFields: [
          {
            key: 'progress',
            label: 'Progress',
            value: '☕'.repeat(stampCount) + '○'.repeat(10 - stampCount),
            textAlignment: 'PKTextAlignmentCenter'
          }
        ],
        auxiliaryFields: [
          {
            key: 'member',
            label: 'MEMBER SINCE',
            value: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            textAlignment: 'PKTextAlignmentLeft'
          },
          {
            key: 'status',
            label: 'STATUS',
            value: stampCount >= 20 ? 'Gold Member' : 'Regular',
            textAlignment: 'PKTextAlignmentRight'
          }
        ],
        backFields: [
          {
            key: 'terms',
            label: 'TERMS AND CONDITIONS',
            value: '1. Collect one stamp for each beverage purchase\n2. After 10 stamps, receive a free coffee of your choice\n3. Stamps expire after 6 months of inactivity\n4. Gold Member status unlocks exclusive seasonal drinks'
          },
          {
            key: 'locations',
            label: 'PARTICIPATING LOCATIONS',
            value: 'Visit our website for a complete list of locations where you can collect and redeem stamps.'
          }
        ]
      },
      barcode: {
        message: `USER${config.userId}`,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1'
      },
      suppressStripShine: false,
      locations: [
        {
          longitude: -122.3748889,
          latitude: 37.6189722,
          relevantText: "Nearby! Show this pass to collect your stamp."
        }
      ]
    };

    // Create PKPass instance with template assets
    const pass = new passkit.PKPass({
      "icon.png": iconBuffer,
      "icon@2x.png": icon2xBuffer,
      "logo.png": logoBuffer,
      "logo@2x.png": logo2xBuffer,
      "strip.png": artworkBuffer,
      "strip@2x.png": artwork2xBuffer,
      "strip@3x.png": artwork3xBuffer,
      "thumbnail.png": secondaryLogoBuffer,
      "thumbnail@2x.png": secondaryLogo2xBuffer,
      "pass.json": Buffer.from(JSON.stringify(passJson))
    }, {
      wwdr: wwdrBuffer,
      signerCert: p12Buffer,
      signerKey: privateKey,
      signerKeyPassphrase: 'sugoi'
    });

    console.log("PKPass instance created successfully with template:", template.name);

    const buffer = await pass.getAsBuffer();
    console.log('Template pass generated successfully!');

    return buffer;

  } catch (error: any) {
    console.error('Error generating template pass:', error);
    throw new Error(`Template pass generation failed: ${error.message}`);
  }
}

/**
 * Generate Google Wallet pass using a template
 */
export async function generateTemplateGooglePass(config: TemplatePassConfig): Promise<Buffer> {
  const template = getTemplate(config.templateId);
  
  if (!template) {
    throw new Error(`Template with ID "${config.templateId}" not found`);
  }

  console.log(`Generating Google Wallet pass with template: ${template.name}`);

  try {
    const demo = new DemoLoyalty();
    await demo.createClass();
    
    const stampCount = config.stampCount || 0;
    const businessName = config.businessName || template.ios.logoText || 'Rewards';
    
    // Use template assets for Google Wallet
    const heroImage = template.android.heroImage || 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB';
    const programLogo = template.android.programLogo || 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D';
    
    await demo.createObjectWithTemplate(config.userId, stampCount, {
      heroImage,
      programLogo,
      businessName,
      colors: template.android.colors,
    });
    
    const jwtLink = demo.createJwtNewObjectsWithTemplate(config.userId, stampCount, {
      heroImage,
      programLogo,
      businessName,
      colors: template.android.colors,
    });

    const buffer = Buffer.from(jwtLink, 'utf-8');
    console.log('Google Wallet template pass generated successfully!');
    return buffer;

  } catch (error: any) {
    console.error('Error generating Google Wallet template pass:', error);
    throw new Error(`Google Wallet template pass generation failed: ${error.message}`);
  }
}

// Google Wallet helper class (inspired by original implementation)
class DemoLoyalty {
  credentials = serviceAccount;
  client: any;
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
    try {
      await this.client.loyaltyclass.get({
        resourceId: `${this.issuerId}.${this.classSuffix}`
      });
      console.log(`Class ${this.issuerId}.${this.classSuffix} already exists!`);
      return `${this.issuerId}.${this.classSuffix}`;
    } catch (err: any) {
      if (err.response && err.response.status !== 404) {
        console.log(err);
        return `${this.issuerId}.${this.classSuffix}`;
      }
    }

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

    await this.client.loyaltyclass.insert({
      requestBody: newClass
    });

    return `${this.issuerId}.${this.classSuffix}`;
  }

  async createObjectWithTemplate(
    userId: string,
    stampCount: number,
    templateConfig: {
      heroImage: string;
      programLogo: string;
      businessName: string;
      colors?: { primary?: string; secondary?: string };
    }
  ) {
    try {
      await this.client.loyaltyobject.get({
        resourceId: `${this.issuerId}.${this.objectSuffix}`
      });
      return `${this.issuerId}.${this.objectSuffix}`;
    } catch (err: any) {
      if (err.response && err.response.status !== 404) {
        console.log(err);
        return `${this.issuerId}.${this.objectSuffix}`;
      }
    }

    let newObject = {
      'id': `${this.issuerId}.${this.objectSuffix}`,
      'classId': `${this.issuerId}.${this.classSuffix}`,
      'state': 'ACTIVE',
      'heroImage': {
        'sourceUri': {
          'uri': templateConfig.heroImage
        },
        'contentDescription': {
          'defaultValue': {
            'language': 'en-US',
            'value': 'Hero image'
          }
        }
      },
      'textModulesData': [
        {
          'header': `Welcome to ${templateConfig.businessName}!`,
          'body': `You have ${stampCount} stamps! ${stampCount >= 10 ? 'You have a free coffee!' : 'Keep collecting'}`,
          'id': 'TEXT_MODULE_ID'
        }
      ],
      'barcode': {
        'type': 'QR_CODE',
        'value': `USER${userId}`
      },
      'accountId': userId,
      'accountName': 'Member',
      'loyaltyPoints': {
        'label': 'Stamps',
        'balance': {
          'int': stampCount
        }
      }
    };

    await this.client.loyaltyobject.insert({
      requestBody: newObject
    });

    return `${this.issuerId}.${this.objectSuffix}`;
  }

  createJwtNewObjectsWithTemplate(
    userId: string,
    stampCount: number,
    templateConfig: {
      heroImage: string;
      programLogo: string;
      businessName: string;
      colors?: { primary?: string; secondary?: string };
    }
  ) {
    let newClass = {
      'id': `${this.issuerId}.${this.classSuffix}`,
      'issuerName': templateConfig.businessName,
      'reviewStatus': 'UNDER_REVIEW',
      'programName': `${templateConfig.businessName} Program`,
      'programLogo': {
        'sourceUri': {
          'uri': templateConfig.programLogo
        },
        'contentDescription': {
          'defaultValue': {
            'language': 'en-US',
            'value': `${templateConfig.businessName} Logo`
          }
        }
      }
    };

    let newObject = {
      'id': `${this.issuerId}.${this.objectSuffix}`,
      'classId': `${this.issuerId}.${this.classSuffix}`,
      'state': 'ACTIVE',
      'heroImage': {
        'sourceUri': {
          'uri': templateConfig.heroImage
        },
        'contentDescription': {
          'defaultValue': {
            'language': 'en-US',
            'value': 'Hero image'
          }
        }
      },
      'textModulesData': [
        {
          'header': `Welcome to ${templateConfig.businessName}!`,
          'body': `You have ${stampCount} stamps! ${stampCount >= 10 ? 'You have a free coffee!' : 'Keep collecting'}`,
          'id': 'TEXT_MODULE_ID'
        }
      ],
      'barcode': {
        'type': 'QR_CODE',
        'value': `USER${userId}`
      },
      'accountId': userId,
      'accountName': 'Member',
      'loyaltyPoints': {
        'label': 'Stamps',
        'balance': {
          'int': stampCount
        }
      }
    };

    let claims = {
      iss: this.credentials.client_email,
      aud: 'google',
      origins: ['www.example.com'],
      typ: 'savetowallet',
      payload: {
        loyaltyClasses: [newClass],
        loyaltyObjects: [newObject]
      }
    };

    let token = jwt.sign(claims, this.credentials.private_key, { algorithm: 'RS256' });

    return `https://pay.google.com/gp/v/save/${token}`;
  }
}

