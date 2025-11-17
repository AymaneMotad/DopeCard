/**
 * Pass Generation Module
 * 
 * Abstraction layer for pass generation functionality.
 * This module wraps the existing pass generation implementation
 * without modifying the core functionality.
 */

import { generatePass, generateGooglePass } from '@/app/utils/pass-generation/pass-generation';
import { generatePWAPass, shouldUsePWAFallback, type PWAPassResult } from './pwa-generator';
import type { CardData } from './card-type-mappers';

export interface PassGenerationOptions {
  userId: string;
  stampCount?: number;
  platform: 'ios' | 'android' | 'unknown';
  cardType?: string;
  cardData?: CardData;
  googleWalletEnabled?: boolean;
  templateId?: string;
}

export interface PassGenerationResult {
  platform: 'ios' | 'android' | 'pwa';
  data: string | Buffer | PWAPassResult;
  mimeType?: string;
}

/**
 * Generate a pass for the specified platform
 * 
 * @param options - Pass generation options
 * @returns Pass data (base64 string for iOS, URL string for Android, or PWA URL)
 */
export async function generatePassForPlatform(
  options: PassGenerationOptions
): Promise<PassGenerationResult> {
  const { 
    userId, 
    stampCount = 0, 
    platform,
    cardType = 'stamp',
    cardData,
    googleWalletEnabled = true,
    templateId
  } = options;

  // Check if PWA fallback should be used
  if (shouldUsePWAFallback(platform, googleWalletEnabled)) {
    const pwaResult = generatePWAPass(userId, cardType, templateId);
    return {
      platform: 'pwa',
      data: pwaResult,
    };
  }

  if (platform === 'ios') {
    const buffer = await generatePass(userId, stampCount, cardType, cardData);
    const base64Pass = buffer.toString('base64');
    
    return {
      platform: 'ios',
      data: base64Pass,
      mimeType: 'application/vnd.apple.pkpass',
    };
  } else if (platform === 'android') {
    const buffer = await generateGooglePass(userId, stampCount, cardType, cardData);
    
    return {
      platform: 'android',
      data: buffer.toString('utf-8'), // Google Pay URL
    };
  } else {
    // Fallback to PWA for unknown platforms
    const pwaResult = generatePWAPass(userId, cardType, templateId);
    return {
      platform: 'pwa',
      data: pwaResult,
    };
  }
}

/**
 * Detect platform from user agent string
 * 
 * @param userAgent - User agent string
 * @returns Detected platform or 'unknown'
 */
export function detectPlatform(userAgent: string): 'ios' | 'android' | 'unknown' {
  if (/iPhone|iPad|iPod/i.test(userAgent)) {
    return 'ios';
  } else if (/Android/i.test(userAgent)) {
    return 'android';
  }
  return 'unknown';
}

// Export template-related functions
export {
  PASS_TEMPLATES,
  getTemplate,
  getTemplatesByCategory,
  getAllTemplates,
  type PassTemplate,
} from './templates';

export {
  generateTemplatePass,
  generateTemplateGooglePass,
  type TemplatePassConfig,
} from './template-pass-generator';

export {
  generatePassWithTemplate,
  generateGooglePassWithTemplate,
  generatePassWithTemplateForPlatform,
  getTemplatePreview,
  type TemplatePassOptions,
} from './template-generator';

// Re-export core functions for backward compatibility
export { generatePass, generateGooglePass };

// Export PWA generator functions
export { generatePWAPass, shouldUsePWAFallback, isGoogleWalletAvailable } from './pwa-generator';
export type { PWAPassResult } from './pwa-generator';

