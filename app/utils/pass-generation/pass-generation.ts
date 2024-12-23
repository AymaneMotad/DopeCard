const passkit = require('passkit-generator');
const axios = require('axios')
import fs from 'fs';
import path from 'path';

export async function generatePass(userId: string) {
  console.log('Starting to initiate the pass creation');

  const certUrl = 'https://utfs.io/f/v9dcWxyyBXm2miFx3bCpbOAKCumMZX3vy8cLhEznF9o2tdT6';
  const wwdrUrl = 'https://utfs.io/f/v9dcWxyyBXm23y1zJZBUJTKDh8yoOZc6HWrbfYx4CqnVS5wl';
  const privateKeyUrl = 'https://utfs.io/f/v9dcWxyyBXm2iv3e8rjFZiEzRGPkYrmA4yCnvhLJXf81S7s2';

  let p12Buffer, wwdrBuffer, privateKey;

  try {
    // Fetch the certificates using axios
    const [certResponse, wwdrResponse, privateKeyResponse] = await Promise.all([
      axios.get(certUrl, { responseType: 'arraybuffer' }),
      axios.get(wwdrUrl, { responseType: 'arraybuffer' }),
      axios.get(privateKeyUrl, { responseType: 'text' }),
    ]);

    if (certResponse.status !== 200) {
      throw new Error(`Failed to fetch certificate: ${certResponse.status} ${certResponse.statusText}`);
    }
    if (wwdrResponse.status !== 200) {
      throw new Error(`Failed to fetch WWDR certificate: ${wwdrResponse.status} ${wwdrResponse.statusText}`);
    }
    if (privateKeyResponse.status !== 200) {
        throw new Error(`Failed to fetch private key: ${privateKeyResponse.status} ${privateKeyResponse.statusText}`);
      }

    p12Buffer = Buffer.from(certResponse.data);
    wwdrBuffer = Buffer.from(wwdrResponse.data);
    privateKey = privateKeyResponse.data;


        // Validate buffers
        if (p12Buffer.length === 0) {
            throw new Error('P12 certificate buffer is empty');
        }
        if (wwdrBuffer.length === 0) {
            throw new Error('WWDR certificate buffer is empty');
        }
        if (!privateKey) {
          throw new Error('Private key is empty');
        }

        // URLs for the logo and icon
    const logoUrl = 'https://utfs.io/f/v9dcWxyyBXm2LPAiLQGidC9sUyKnGjQvFrToaVE8eWm7XNOk';
    const iconUrl = 'https://utfs.io/f/v9dcWxyyBXm2O1AhFkhncMqa9p0mnb2AHzQrSBdLTXRoN1WE';
  
        // Fetch files from external URLs
        const [logoResponse, iconResponse] = await Promise.all([
            axios.get(logoUrl, { responseType: 'arraybuffer' }),
            axios.get(iconUrl, { responseType: 'arraybuffer' }),
        ]);
    
        const logoBuffer = Buffer.from(logoResponse.data);
        const iconBuffer = Buffer.from(iconResponse.data);
    
        // Create pass.json content
        const passJson = {
          formatVersion: 1,
          passTypeIdentifier: 'pass.com.dopecard.stamps',
          teamIdentifier: 'DTWNQT4JQL',
          organizationName: 'Dopecard',
          description: 'Dopecard Stamp',
          serialNumber: `ADSK2D-${userId}`,
          generic: {
            primaryFields: [
              {
                key: 'stamps',
                label: 'Stamps Collected',
                value: 5,
              },
            ],
            secondaryFields: [
              {
                key: 'reward',
                label: 'Reward Progress',
                value: '5/10',
              },
            ],
          },
          barcode: {
            message: userId,
            format: 'PKBarcodeFormatQR',
            messageEncoding: 'iso-8859-1',
          },
          logoText: 'Dopecard', // Text that appears next to the logo
          logoURL: 'https://example.com/logo.png', // URL to your logo
          backgroundColor: 'rgb(255, 255, 255)', // White background
          foregroundColor: 'rgb(0, 0, 0)', // Black text
        };

        // Create a new PKPass instance using buffers for static files
      const pass = new passkit.PKPass({
            "pass.json": Buffer.from(JSON.stringify(passJson)), // Pass data as buffer
            "logo.png": logoBuffer,
            "icon.png": iconBuffer,
        }, {
        wwdr: wwdrBuffer,
        signerCert: p12Buffer,
        signerKey: privateKey,
        signerKeyPassphrase: 'sugoi', // If private key is encrypted
      });
    
      // Localize content and set barcode (this is optional)
      pass.localize("en", { description: 'Dopecard Stamp' });
      pass.setBarcodes([{
        message: userId,
        format: 'PKBarcodeFormatQR',
        messageEncoding: 'iso-8859-1',
      }]);
    
      // Generate the .pkpass files
      const buffer = await pass.getAsBuffer();
    
      // Save the .pkpass file to disk
      const outputDir = path.join(process.cwd(), 'output');
      console.log('console loggging process cwd', process.cwd())
      console.log(fs.existsSync(outputDir))
      
      
      if (!fs.existsSync(outputDir)){
          fs.mkdirSync(outputDir);
      }
    
      const filePath = path.join(outputDir, `ADSK2D-${userId}-pass.pkpass`);
      console.log('file path is',filePath)
      fs.writeFileSync(filePath, buffer);
    
      console.log('Pass generated successfully!');
      return filePath;


  } catch (error) {
    console.error('Error generating pass:', error);
    throw new Error(`Pass generation failed: ${error.message}`);
  }
}