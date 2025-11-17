/**
 * Client-Side PDF Generator
 * 
 * Generates PDFs with QR codes for card distribution
 * Uses browser APIs for client-side generation
 */

import { QRCodeSVG } from 'qrcode.react';

export interface PDFGenerationOptions {
  cardTitle: string;
  businessName: string;
  registrationLink: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  description?: string;
  cardType?: string;
  stampCount?: number; // Number of stamps needed for reward
}


/**
 * Alternative: Generate PDF using jsPDF with QR code
 */
export async function generateCardPDFWithJSPDF(options: PDFGenerationOptions): Promise<void> {
  const {
    cardTitle,
    businessName,
    registrationLink,
    backgroundColor = '#59341C',
    textColor = '#FFFFFF',
    description,
    cardType = 'stamp',
    stampCount = 10,
  } = options;

  // Dynamically import jsPDF
  const { default: jsPDF } = await import('jspdf');

  // Create PDF
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - (margin * 2);

  // Convert hex to RGB
  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [89, 52, 28];
  };

  const bgRgb = hexToRgb(backgroundColor);
  // Use white text on dark background (like the inspiration image)
  const whiteRgb: [number, number, number] = [255, 255, 255];

  // Full page black/dark background (like table tent sign)
  doc.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');

  // Instructions text (white on dark background)
  doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2]);
  
  // Main instruction line 1 (dynamic based on card type)
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  const instructionY1 = 40;
  const mainInstruction = cardType === 'stamp' 
    ? 'Collect stamps to get a reward'
    : cardType === 'points'
    ? 'Collect points to get a reward'
    : cardType === 'discount'
    ? 'Get progressive discounts'
    : 'Join our loyalty program';
  doc.text(mainInstruction, pageWidth / 2, instructionY1, { align: 'center' });

  // Instruction lines 2-3
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  const instructionY2 = instructionY1 + 12;
  doc.text('Scan QR code by your phone camera', pageWidth / 2, instructionY2, { align: 'center' });
  
  const instructionY3 = instructionY2 + 8;
  doc.text('and install digital card in Apple Wallet', pageWidth / 2, instructionY3, { align: 'center' });
  
  const instructionY4 = instructionY3 + 8;
  doc.text('on Phone or Google Pay on Android', pageWidth / 2, instructionY4, { align: 'center' });

  // Instruction lines 4-5
  const instructionY5 = instructionY4 + 12;
  doc.text('Get your reward after', pageWidth / 2, instructionY5, { align: 'center' });
  
  // Get reward threshold based on card type
  const instructionY6 = instructionY5 + 8;
  const rewardText = cardType === 'stamp'
    ? `receiving ${stampCount} stamps`
    : cardType === 'points'
    ? 'collecting enough points'
    : cardType === 'discount'
    ? 'making more visits'
    : 'joining our program';
  doc.text(rewardText, pageWidth / 2, instructionY6, { align: 'center' });

  // Generate QR code (WHITE QR code on dark background - like inspiration)
  // Use QR code API (no need for qrcode package)
  try {
    // Generate white QR code using API
    const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(registrationLink)}&color=ffffff&bgcolor=000000`;
    
    // Add QR code to PDF (larger, more prominent)
    const qrCodeSize = 100; // mm - larger for better scanning
    const qrCodeX = (pageWidth - qrCodeSize) / 2;
    const qrCodeY = instructionY6 + 20; // Position after instructions

    doc.addImage(qrApiUrl, 'PNG', qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
    
    // Add registration link below QR code
    const linkY = qrCodeY + qrCodeSize + 10;
    doc.setFontSize(10);
    doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2]);
    doc.setFont('helvetica', 'normal');
    // Split long links across multiple lines if needed
    const maxLinkWidth = pageWidth - (margin * 2);
    doc.text(registrationLink, pageWidth / 2, linkY, { 
      align: 'center',
      maxWidth: maxLinkWidth 
    });
  } catch (error) {
    console.error('Error generating QR code:', error);
    // Last resort: Draw a white placeholder
    doc.setDrawColor(255, 255, 255);
    doc.setLineWidth(2);
    doc.rect((pageWidth - 100) / 2, instructionY6 + 20, 100, 100);
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text('QR CODE', pageWidth / 2, instructionY6 + 70, { align: 'center' });
    
    // Still add the link
    const linkY = instructionY6 + 20 + 100 + 10;
    doc.text(registrationLink, pageWidth / 2, linkY, { 
      align: 'center',
      maxWidth: pageWidth - (margin * 2)
    });
  }

  // Footer (optional - can be removed for cleaner look like inspiration)
  // The inspiration image doesn't show footer, but we can add business name at bottom
  const footerY = pageHeight - 15;
  doc.setFontSize(10);
  doc.setTextColor(whiteRgb[0], whiteRgb[1], whiteRgb[2]);
  doc.setFont('helvetica', 'normal');
  doc.text(
    businessName,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  // Save PDF
  doc.save(`${businessName.replace(/\s+/g, '-')}-card.pdf`);
}

