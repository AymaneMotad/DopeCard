/**
 * Pre-ready Templates for Pass Generation
 * 
 * These templates provide ready-to-use designs for both iOS and Android passes.
 * Users can select a template and customize it further if needed.
 */

export interface PassTemplate {
  id: string;
  name: string;
  description: string;
  category: 'coffee' | 'restaurant' | 'retail' | 'service' | 'modern' | 'classic';
  preview: string; // Preview image URL or description
  
  // iOS Template Configuration
  ios: {
    backgroundColor: string;
    foregroundColor: string;
    labelColor: string;
    logoText?: string;
    // Asset URLs (can be overridden)
    assets: {
      icon?: string;
      icon2x?: string;
      logo?: string;
      logo2x?: string;
      strip?: string;
      strip2x?: string;
      strip3x?: string;
      thumbnail?: string;
      thumbnail2x?: string;
    };
  };
  
  // Android Template Configuration
  android: {
    heroImage?: string;
    programLogo?: string;
    colors?: {
      primary?: string;
      secondary?: string;
    };
  };
}

/**
 * Pre-defined Templates Collection
 */
export const PASS_TEMPLATES: PassTemplate[] = [
  {
    id: 'coffee-classic',
    name: 'Coffee Classic',
    description: 'Warm brown tones perfect for coffee shops and cafes',
    category: 'coffee',
    preview: 'Warm brown background with cream text',
    ios: {
      backgroundColor: 'rgb(89, 52, 28)', // Dark brown
      foregroundColor: 'rgb(255, 255, 255)', // White
      labelColor: 'rgb(255, 240, 220)', // Cream
      logoText: 'Brew Rewards',
      assets: {
        icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
        icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
        logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
        strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
        strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
        strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
        thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
      },
    },
    android: {
      heroImage: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      programLogo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      colors: {
        primary: '#59341C',
        secondary: '#FFF0DC',
      },
    },
  },
  {
    id: 'modern-minimal',
    name: 'Modern Minimal',
    description: 'Clean, minimalist design with bold colors',
    category: 'modern',
    preview: 'Black background with white text and accent colors',
    ios: {
      backgroundColor: 'rgb(0, 0, 0)', // Black
      foregroundColor: 'rgb(255, 255, 255)', // White
      labelColor: 'rgb(200, 200, 200)', // Light gray
      logoText: 'Loyalty Rewards',
      assets: {
        icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
        icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
        logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
        strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
        strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
        strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
        thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
      },
    },
    android: {
      heroImage: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      programLogo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      colors: {
        primary: '#000000',
        secondary: '#FFFFFF',
      },
    },
  },
  {
    id: 'vibrant-sunset',
    name: 'Vibrant Sunset',
    description: 'Bright orange and pink gradient perfect for restaurants',
    category: 'restaurant',
    preview: 'Orange to pink gradient with white text',
    ios: {
      backgroundColor: 'rgb(255, 140, 0)', // Orange
      foregroundColor: 'rgb(255, 255, 255)', // White
      labelColor: 'rgb(255, 240, 220)', // Light cream
      logoText: 'Food Rewards',
      assets: {
        icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
        icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
        logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
        strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
        strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
        strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
        thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
      },
    },
    android: {
      heroImage: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      programLogo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      colors: {
        primary: '#FF8C00',
        secondary: '#FFF0DC',
      },
    },
  },
  {
    id: 'elegant-purple',
    name: 'Elegant Purple',
    description: 'Sophisticated purple theme for premium services',
    category: 'service',
    preview: 'Deep purple background with gold accents',
    ios: {
      backgroundColor: 'rgb(75, 0, 130)', // Deep purple
      foregroundColor: 'rgb(255, 255, 255)', // White
      labelColor: 'rgb(255, 215, 0)', // Gold
      logoText: 'Premium Rewards',
      assets: {
        icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
        icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
        logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
        strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
        strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
        strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
        thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
      },
    },
    android: {
      heroImage: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      programLogo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      colors: {
        primary: '#4B0082',
        secondary: '#FFD700',
      },
    },
  },
  {
    id: 'fresh-green',
    name: 'Fresh Green',
    description: 'Natural green theme for health and wellness businesses',
    category: 'service',
    preview: 'Fresh green background with white text',
    ios: {
      backgroundColor: 'rgb(34, 139, 34)', // Forest green
      foregroundColor: 'rgb(255, 255, 255)', // White
      labelColor: 'rgb(240, 255, 240)', // Honeydew
      logoText: 'Wellness Rewards',
      assets: {
        icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
        icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
        logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
        strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
        strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
        strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
        thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
      },
    },
    android: {
      heroImage: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      programLogo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      colors: {
        primary: '#228B22',
        secondary: '#F0FFF0',
      },
    },
  },
  {
    id: 'ocean-blue',
    name: 'Ocean Blue',
    description: 'Calming blue theme for retail and services',
    category: 'retail',
    preview: 'Deep blue background with light blue accents',
    ios: {
      backgroundColor: 'rgb(0, 102, 204)', // Deep blue
      foregroundColor: 'rgb(255, 255, 255)', // White
      labelColor: 'rgb(173, 216, 230)', // Light blue
      logoText: 'Retail Rewards',
      assets: {
        icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw',
        icon2x: 'https://utfs.io/f/v9dcWxyyBXm2asmT0F8U1F5xrmVC4fMZczRnpsYKdjgOoNiD',
        logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        logo2x: 'https://utfs.io/f/v9dcWxyyBXm2u25tz3rFvDKcpQeTOCk1SUmysgVLA7R8fMEi',
        strip: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
        strip2x: 'https://utfs.io/f/v9dcWxyyBXm2jr5UzeK6f0hWPH4F3v2CNOSxudmYknel9a71',
        strip3x: 'https://utfs.io/f/v9dcWxyyBXm2WEfKMOUHGEVbuT0pxYkSf4FOdyotCqwhRjrz',
        thumbnail: 'https://utfs.io/f/v9dcWxyyBXm28cMspbD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
        thumbnail2x: 'https://utfs.io/f/v9dcWxyyBXm2CivrB7umyZWxon9IEVcb5etHSBpqaG8sjL71',
      },
    },
    android: {
      heroImage: 'https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB',
      programLogo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
      colors: {
        primary: '#0066CC',
        secondary: '#ADD8E6',
      },
    },
  },
];

/**
 * Get a template by ID
 */
export function getTemplate(templateId: string): PassTemplate | undefined {
  return PASS_TEMPLATES.find(t => t.id === templateId);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: PassTemplate['category']): PassTemplate[] {
  return PASS_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get all templates
 */
export function getAllTemplates(): PassTemplate[] {
  return PASS_TEMPLATES;
}

