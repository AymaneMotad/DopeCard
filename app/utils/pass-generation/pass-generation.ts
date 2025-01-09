const passkit = require('passkit-generator');
const axios = require('axios');
import * as fs from 'fs';
import * as path from 'path';

export async function generatePass(userId: string, stampCount: number = 0) {
    console.log('Starting to initiate the pass creation');

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

        // Fetch all assets
        const assetUrls = {
            artwork: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
            artwork2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
            artwork3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
            icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
            icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
            logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
            logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
            secondaryLogo: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
            secondaryLogo2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71'
        };

        console.log('Fetching assets...');
        
        // Fetch all assets concurrently
        const responses = await Promise.all(
            Object.values(assetUrls).map(url => axios.get(url, { responseType: 'arraybuffer' }))
        );

        // Create buffers for each asset
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

        // Log buffer sizes
        console.log('Buffer sizes:', {
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

        // Verify that none of the buffers are empty
        if (
            artworkBuffer.length === 0 ||
            artwork2xBuffer.length === 0 ||
            artwork3xBuffer.length === 0 ||
            iconBuffer.length === 0 ||
            icon2xBuffer.length === 0 ||
            logoBuffer.length === 0 ||
            logo2xBuffer.length === 0 ||
            secondaryLogoBuffer.length === 0 ||
            secondaryLogo2xBuffer.length === 0
        ) {
            throw new Error('One or more asset buffers are empty');
        }

        console.log('Assets fetched successfully.');

        // Create the pass JSON
        const passJson = {
            formatVersion: 1,
            serialNumber: `COFFEE${userId}`,
            passTypeIdentifier: 'pass.com.dopecard.passmaker',
            teamIdentifier: 'DTWNQT4JQL',
            description: 'Coffee Loyalty Card',
            organizationName: 'Brew Rewards',
            logoText: 'Brew Rewards',
            foregroundColor: 'rgb(255, 255, 255)',
            backgroundColor: 'rgb(89, 52, 28)',
            labelColor: 'rgb(255, 240, 220)',
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
                message: `USER${userId}`,
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

        // Create a new PKPass instance with all the assets and the updated pass.json
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

        console.log("PKPass instance created successfully.");

        // Generate the .pkpass file
        const buffer = await pass.getAsBuffer();

        console.log('Pass generated successfully!');
        console.log('Pass generation buffer size:', buffer.length);

        return buffer;

    } catch (error) {
        console.error('Error generating pass:', error);
        throw new Error(`Pass generation failed: ${error.message}`);
    }
}