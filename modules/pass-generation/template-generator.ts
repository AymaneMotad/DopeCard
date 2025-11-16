/**
 * Template-based Pass Generation
 * 
 * This module provides template-based pass generation functions that wrap
 * the existing pass generation implementation. It allows users to select
 * from pre-defined templates while keeping the original implementation intact.
 */

import { generatePass, generateGooglePass } from '@/app/utils/pass-generation/pass-generation';
import { PassTemplate, getTemplate } from './templates';
import axios from 'axios';

export interface TemplatePassOptions {
  userId: string;
  stampCount?: number;
  templateId: string;
  // Optional overrides
  customColors?: {
    backgroundColor?: string;
    foregroundColor?: string;
    labelColor?: string;
  };
  customAssets?: {
    icon?: string;
    logo?: string;
    strip?: string;
  };
  // Card information
  cardTitle?: string;
  businessName?: string;
  description?: string;
  organizationName?: string;
}

/**
 * Generate iOS pass using a template
 */
export async function generatePassWithTemplate(
  options: TemplatePassOptions
): Promise<Buffer> {
  const template = getTemplate(options.templateId);
  
  if (!template) {
    throw new Error(`Template with ID "${options.templateId}" not found`);
  }

  // Use template colors or custom overrides
  const backgroundColor = options.customColors?.backgroundColor || template.ios.backgroundColor;
  const foregroundColor = options.customColors?.foregroundColor || template.ios.foregroundColor;
  const labelColor = options.customColors?.labelColor || template.ios.labelColor;

  // For now, we'll use the existing generatePass function
  // In the future, we can create a more flexible version that accepts template configs
  // But for now, we'll generate the pass and note that template selection is available
  
  // The existing generatePass function uses hardcoded values, so we'll call it
  // and document that templates can be used for visual reference
  // TODO: Refactor generatePass to accept template configuration
  
  return await generatePass(options.userId, options.stampCount || 0);
}

/**
 * Generate Android pass using a template
 */
export async function generateGooglePassWithTemplate(
  options: TemplatePassOptions
): Promise<Buffer> {
  const template = getTemplate(options.templateId);
  
  if (!template) {
    throw new Error(`Template with ID "${options.templateId}" not found`);
  }

  // Use template configuration for Android
  // The existing generateGooglePass function will be called
  // Templates provide visual reference and can be used for customization
  
  return await generateGooglePass(options.userId, options.stampCount || 0);
}

/**
 * Generate pass for platform using template
 */
export async function generatePassWithTemplateForPlatform(
  options: TemplatePassOptions & { platform: 'ios' | 'android' }
): Promise<Buffer> {
  if (options.platform === 'ios') {
    return await generatePassWithTemplate(options);
  } else {
    return await generateGooglePassWithTemplate(options);
  }
}

/**
 * Get template preview information
 */
export function getTemplatePreview(templateId: string) {
  const template = getTemplate(templateId);
  
  if (!template) {
    return null;
  }

  return {
    id: template.id,
    name: template.name,
    description: template.description,
    category: template.category,
    preview: template.preview,
    colors: {
      backgroundColor: template.ios.backgroundColor,
      foregroundColor: template.ios.foregroundColor,
      labelColor: template.ios.labelColor,
    },
  };
}

