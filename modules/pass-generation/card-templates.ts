/**
 * Pre-designed Card Templates
 * 
 * These templates are ready-to-use card designs that work perfectly
 * with pass generation. Users can select a template when creating a card.
 */

import { PassTemplate, PASS_TEMPLATES } from './templates';

export interface CardTemplate {
  id: string;
  name: string;
  description: string;
  category: 'coffee' | 'restaurant' | 'retail' | 'service' | 'modern' | 'classic';
  cardType: 'stamp' | 'points' | 'discount';
  preview: {
    backgroundColor: string;
    foregroundColor: string;
    accentColor: string;
    description: string;
  };
  // Pass generation template ID
  passTemplateId: string;
  // Default settings
  defaults: {
    stampCount?: number;
    pointsRate?: number;
    discountTiers?: number[];
  };
}

/**
 * Pre-designed Card Templates Collection
 */
export const CARD_TEMPLATES: CardTemplate[] = [
  {
    id: 'coffee-stamp-classic',
    name: 'Coffee Classic',
    description: 'Perfect for coffee shops - warm brown tones with stamp collection',
    category: 'coffee',
    cardType: 'stamp',
    preview: {
      backgroundColor: '#59341C',
      foregroundColor: '#FFFFFF',
      accentColor: '#FF8C00',
      description: 'Warm brown background with cream accents',
    },
    passTemplateId: 'coffee-classic',
    defaults: {
      stampCount: 10,
    },
  },
  {
    id: 'modern-stamp-minimal',
    name: 'Modern Minimal',
    description: 'Clean, minimalist design perfect for modern businesses',
    category: 'modern',
    cardType: 'stamp',
    preview: {
      backgroundColor: '#000000',
      foregroundColor: '#FFFFFF',
      accentColor: '#6366F1',
      description: 'Black background with white text',
    },
    passTemplateId: 'modern-minimal',
    defaults: {
      stampCount: 10,
    },
  },
  {
    id: 'restaurant-stamp-sunset',
    name: 'Vibrant Sunset',
    description: 'Bright and energetic - perfect for restaurants and cafes',
    category: 'restaurant',
    cardType: 'stamp',
    preview: {
      backgroundColor: '#FF8C00',
      foregroundColor: '#FFFFFF',
      accentColor: '#FF6B9D',
      description: 'Orange to pink gradient',
    },
    passTemplateId: 'vibrant-sunset',
    defaults: {
      stampCount: 10,
    },
  },
  {
    id: 'service-points-elegant',
    name: 'Elegant Points',
    description: 'Sophisticated design for premium services',
    category: 'service',
    cardType: 'points',
    preview: {
      backgroundColor: '#4B0082',
      foregroundColor: '#FFFFFF',
      accentColor: '#FFD700',
      description: 'Deep purple with gold accents',
    },
    passTemplateId: 'elegant-purple',
    defaults: {
      pointsRate: 1,
    },
  },
  {
    id: 'wellness-stamp-fresh',
    name: 'Fresh Green',
    description: 'Natural and fresh - perfect for health and wellness',
    category: 'service',
    cardType: 'stamp',
    preview: {
      backgroundColor: '#228B22',
      foregroundColor: '#FFFFFF',
      accentColor: '#90EE90',
      description: 'Natural green theme',
    },
    passTemplateId: 'fresh-green',
    defaults: {
      stampCount: 10,
    },
  },
  {
    id: 'retail-discount-ocean',
    name: 'Ocean Blue Discount',
    description: 'Calming blue theme for retail stores',
    category: 'retail',
    cardType: 'discount',
    preview: {
      backgroundColor: '#0066CC',
      foregroundColor: '#FFFFFF',
      accentColor: '#ADD8E6',
      description: 'Deep blue with light blue accents',
    },
    passTemplateId: 'ocean-blue',
    defaults: {
      discountTiers: [5, 10, 15],
    },
  },
];

/**
 * Get card template by ID
 */
export function getCardTemplate(templateId: string): CardTemplate | undefined {
  return CARD_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get card templates by category
 */
export function getCardTemplatesByCategory(category: CardTemplate['category']): CardTemplate[] {
  return CARD_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get card templates by card type
 */
export function getCardTemplatesByType(cardType: CardTemplate['cardType']): CardTemplate[] {
  return CARD_TEMPLATES.filter(t => t.cardType === cardType);
}

/**
 * Get all card templates
 */
export function getAllCardTemplates(): CardTemplate[] {
  return CARD_TEMPLATES;
}

/**
 * Get pass template for a card template
 */
export function getPassTemplateForCard(cardTemplateId: string): PassTemplate | undefined {
  const cardTemplate = getCardTemplate(cardTemplateId);
  if (!cardTemplate) return undefined;
  
  return PASS_TEMPLATES.find(t => t.id === cardTemplate.passTemplateId);
}

