/**
 * Server-Side PDF Generator
 * 
 * Generates PDFs with QR codes for card distribution
 * Uses a simple approach that can work with available libraries
 */

// Note: QRCode library needs to be installed: npm install qrcode @types/qrcode
// For now, using a placeholder approach
// In production, install: npm install qrcode @types/qrcode
let QRCode: any;
try {
  QRCode = require('qrcode');
} catch (e) {
  // QRCode not installed - will use placeholder
  console.warn('qrcode library not installed. Install with: npm install qrcode @types/qrcode');
}

export interface PDFGenerationOptions {
  cardTitle: string;
  businessName: string;
  registrationLink: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  description?: string;
  cardType?: string;
  businessSlug?: string;
}

/**
 * Generate QR code as data URL
 */
async function generateQRCodeDataURL(text: string): Promise<string> {
  try {
    if (QRCode) {
      const qrDataURL = await QRCode.toDataURL(text, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      return qrDataURL;
    } else {
      // Fallback: Generate a simple placeholder QR code using an API
      // In production, use a proper QR code library
      const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
      return qrApiUrl;
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Fallback to API-based QR code
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(text)}`;
    return qrApiUrl;
  }
}

/**
 * Generate PDF HTML template
 * This HTML can be converted to PDF using a service or library
 */
export async function generatePDFHTML(options: PDFGenerationOptions): Promise<string> {
  const {
    cardTitle,
    businessName,
    registrationLink,
    backgroundColor = '#59341C',
    textColor = '#FFFFFF',
    description,
    cardType = 'stamp',
  } = options;

  const qrCodeDataURL = await generateQRCodeDataURL(registrationLink);

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 0;
      background: white;
    }
    .header {
      background: ${backgroundColor};
      color: ${textColor};
      padding: 40px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 32px;
      font-weight: bold;
    }
    .header h2 {
      margin: 0;
      font-size: 20px;
      font-weight: normal;
      opacity: 0.9;
    }
    .content {
      padding: 40px 20px;
      text-align: center;
    }
    .instructions {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 10px;
      color: #333;
    }
    .instructions-text {
      font-size: 14px;
      color: #666;
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }
    .qr-container {
      display: inline-block;
      padding: 20px;
      background: white;
      border: 2px solid #e5e5e5;
      border-radius: 8px;
      margin: 20px 0;
    }
    .qr-code {
      width: 300px;
      height: 300px;
      display: block;
    }
    .footer {
      padding: 20px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #e5e5e5;
      margin-top: 40px;
    }
    .link {
      word-break: break-all;
      color: #666;
      margin-top: 10px;
    }
    .card-type {
      margin-top: 5px;
      font-weight: 600;
      color: #333;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${businessName}</h1>
    <h2>${cardTitle}</h2>
    ${description ? `<p style="margin-top: 15px; opacity: 0.9; font-size: 14px;">${description}</p>` : ''}
  </div>
  
  <div class="content">
    <div class="instructions">Scan to Join</div>
    <div class="instructions-text">
      Scan this QR code with your phone camera to add this card to your wallet
    </div>
    
    <div class="qr-container">
      <img src="${qrCodeDataURL}" alt="QR Code" class="qr-code" />
    </div>
  </div>
  
  <div class="footer">
    <div class="link">${registrationLink}</div>
    <div class="card-type">Card Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}</div>
  </div>
</body>
</html>
  `;

  return html;
}

/**
 * Generate unique business link slug
 */
export function generateBusinessSlug(businessName: string, cardType: string): string {
  const slug = businessName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  
  const cardTypeSlug = cardType.toLowerCase();
  const uniqueId = Math.random().toString(36).substring(2, 8);
  
  return `${slug}-${cardTypeSlug}-${uniqueId}`;
}

