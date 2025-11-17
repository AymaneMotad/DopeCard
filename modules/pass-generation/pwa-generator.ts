/**
 * PWA Pass Generator
 * 
 * Generates web-based card views for devices without native wallet support
 * or as a fallback when Google Wallet is not available on Android
 */

import type { CardData } from './card-type-mappers';

export interface PWAPassResult {
  type: 'pwa';
  url: string;
}

/**
 * Generate PWA pass URL
 * 
 * @param userId - User ID
 * @param cardType - Card type
 * @param templateId - Optional template ID
 * @returns PWA pass result with URL
 */
export function generatePWAPass(
  userId: string,
  cardType: string = 'stamp',
  templateId?: string
): PWAPassResult {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000';

  const params = new URLSearchParams({
    userId,
    cardType,
  });

  if (templateId) {
    params.append('template', templateId);
  }

  return {
    type: 'pwa',
    url: `${baseUrl}/cards/${userId}?${params.toString()}`,
  };
}

/**
 * Check if Google Wallet is available
 * This is a simple check - in production, you might want to check
 * if the Google Pay API is actually available
 */
export function isGoogleWalletAvailable(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if running on Android
  const userAgent = navigator.userAgent.toLowerCase();
  const isAndroid = userAgent.includes('android');

  if (!isAndroid) {
    return false;
  }

  // In a real implementation, you might check for Google Pay API availability
  // For now, we'll assume it's available on Android
  // You can enhance this by checking for specific Google Pay API features
  return true;
}

/**
 * Determine if PWA fallback should be used
 * 
 * @param platform - Detected platform
 * @param googleWalletEnabled - Whether Google Wallet is enabled for this card
 * @returns True if PWA fallback should be used
 */
export function shouldUsePWAFallback(
  platform: 'ios' | 'android' | 'unknown',
  googleWalletEnabled: boolean = true
): boolean {
  // Use PWA for unknown platforms
  if (platform === 'unknown') {
    return true;
  }

  // Use PWA for Android if Google Wallet is not enabled or not available
  if (platform === 'android') {
    if (!googleWalletEnabled) {
      return true;
    }
    // Check if Google Wallet is actually available
    if (typeof window !== 'undefined' && !isGoogleWalletAvailable()) {
      return true;
    }
  }

  // iOS always uses Apple Wallet (no PWA fallback needed)
  return false;
}

