/**
 * Pass Generation Module
 * 
 * Abstraction layer for pass generation functionality.
 * This module wraps the existing pass generation implementation
 * without modifying the core functionality.
 */

import { generatePass, generateGooglePass } from '@/app/utils/pass-generation/pass-generation';

export interface PassGenerationOptions {
  userId: string;
  stampCount?: number;
  platform: 'ios' | 'android';
}

export interface PassGenerationResult {
  platform: 'ios' | 'android';
  data: string | Buffer;
  mimeType?: string;
}

/**
 * Generate a pass for the specified platform
 * 
 * @param options - Pass generation options
 * @returns Pass data (base64 string for iOS, URL string for Android)
 */
export async function generatePassForPlatform(
  options: PassGenerationOptions
): Promise<PassGenerationResult> {
  const { userId, stampCount = 0, platform } = options;

  if (platform === 'ios') {
    const buffer = await generatePass(userId, stampCount);
    const base64Pass = buffer.toString('base64');
    
    return {
      platform: 'ios',
      data: base64Pass,
      mimeType: 'application/vnd.apple.pkpass',
    };
  } else if (platform === 'android') {
    const buffer = await generateGooglePass(userId, stampCount);
    
    return {
      platform: 'android',
      data: buffer.toString('utf-8'), // Google Pay URL
    };
  } else {
    throw new Error(`Unsupported platform: ${platform}`);
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

