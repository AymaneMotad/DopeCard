/**
 * PDF Generator Utility
 * 
 * Generates PDFs with QR codes for card distribution
 */

import { QRCodeSVG } from 'qrcode.react';
import { jsPDF } from 'jspdf';

export interface PDFGenerationOptions {
  cardTitle: string;
  businessName: string;
  registrationLink: string;
  backgroundColor?: string;
  textColor?: string;
  logoUrl?: string;
  description?: string;
  cardType?: string;
}

/**
 * Generate a PDF with QR code for card distribution
 * 
 * @param options - PDF generation options
 * @returns PDF buffer
 */
export async function generateCardPDF(options: PDFGenerationOptions): Promise<Buffer> {
  const {
    cardTitle,
    businessName,
    registrationLink,
    backgroundColor = '#59341C',
    textColor = '#FFFFFF',
    logoUrl,
    description,
    cardType = 'stamp',
  } = options;

  // Create new PDF document (A4 size)
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
      : [89, 52, 28]; // Default brown
  };

  const bgRgb = hexToRgb(backgroundColor);
  const textRgb = hexToRgb(textColor);

  // Header section with background color
  doc.setFillColor(bgRgb[0], bgRgb[1], bgRgb[2]);
  doc.rect(0, 0, pageWidth, 60, 'F');

  // Add logo if provided (placeholder for now - would need to load image)
  if (logoUrl) {
    // In a real implementation, you'd load the image and add it here
    // doc.addImage(logoData, 'PNG', margin, 10, 30, 30);
  }

  // Business name
  doc.setTextColor(textRgb[0], textRgb[1], textRgb[2]);
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text(businessName, pageWidth / 2, 25, { align: 'center' });

  // Card title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'normal');
  doc.text(cardTitle, pageWidth / 2, 35, { align: 'center' });

  // Description
  if (description) {
    doc.setFontSize(12);
    doc.text(description, pageWidth / 2, 45, { align: 'center', maxWidth: contentWidth });
  }

  // Instructions section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Scan to Join', pageWidth / 2, 80, { align: 'center' });

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.text(
    'Scan this QR code with your phone camera to add this card to your wallet',
    pageWidth / 2,
    90,
    { align: 'center', maxWidth: contentWidth }
  );

  // QR Code section
  // Generate QR code as data URL
  const qrCodeSize = 100; // mm
  const qrCodeX = (pageWidth - qrCodeSize) / 2;
  const qrCodeY = 110;

  // Create a canvas to generate QR code
  const canvas = document.createElement('canvas');
  canvas.width = 400;
  canvas.height = 400;
  
  // Use qrcode.react to generate QR code
  // Note: This is a simplified version - in production you'd use a server-side QR generator
  // For now, we'll create a placeholder and note that server-side generation is needed
  
  // Add QR code placeholder (in production, use a library like 'qrcode' for Node.js)
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(qrCodeX, qrCodeY, qrCodeSize, qrCodeSize);
  
  // Add text in QR code area (temporary - replace with actual QR code image)
  doc.setFontSize(10);
  doc.text('QR CODE', pageWidth / 2, qrCodeY + qrCodeSize / 2, { align: 'center' });
  doc.text(registrationLink.substring(0, 30) + '...', pageWidth / 2, qrCodeY + qrCodeSize / 2 + 5, { align: 'center' });

  // Footer section
  const footerY = pageHeight - 30;
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `Visit: ${registrationLink}`,
    pageWidth / 2,
    footerY,
    { align: 'center' }
  );

  doc.text(
    `Card Type: ${cardType.charAt(0).toUpperCase() + cardType.slice(1)}`,
    pageWidth / 2,
    footerY + 8,
    { align: 'center' }
  );

  // Generate PDF buffer
  const pdfBlob = doc.output('blob');
  const arrayBuffer = await pdfBlob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate unique business link slug
 * 
 * @param businessName - Business name
 * @param cardType - Card type
 * @returns Unique slug
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

