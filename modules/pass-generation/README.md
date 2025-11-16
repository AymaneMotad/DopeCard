# Pass Generation Module

This module provides pass generation functionality for both iOS (Apple Wallet) and Android (Google Pay) platforms.

## Features

- ✅ Original pass generation (preserved)
- ✅ Template-based pass generation (NEW)
- ✅ Pre-ready templates for iOS and Android
- ✅ Customizable templates

## Available Templates

### Coffee Classic
- **ID**: `coffee-classic`
- **Category**: Coffee
- **Colors**: Warm brown tones
- Perfect for coffee shops and cafes

### Modern Minimal
- **ID**: `modern-minimal`
- **Category**: Modern
- **Colors**: Black background with white text
- Clean, minimalist design

### Vibrant Sunset
- **ID**: `vibrant-sunset`
- **Category**: Restaurant
- **Colors**: Bright orange and pink gradient
- Perfect for restaurants

### Elegant Purple
- **ID**: `elegant-purple`
- **Category**: Service
- **Colors**: Deep purple with gold accents
- Sophisticated theme for premium services

### Fresh Green
- **ID**: `fresh-green`
- **Category**: Service
- **Colors**: Natural green theme
- Perfect for health and wellness businesses

### Ocean Blue
- **ID**: `ocean-blue`
- **Category**: Retail
- **Colors**: Deep blue with light blue accents
- Calming theme for retail and services

## Usage

### Using Templates

```typescript
import { 
  generateTemplatePass, 
  generateTemplateGooglePass,
  getAllTemplates,
  getTemplate 
} from '@/modules/pass-generation';

// Get all available templates
const templates = getAllTemplates();

// Generate iOS pass with template
const iosPassBuffer = await generateTemplatePass({
  userId: 'user123',
  stampCount: 5,
  templateId: 'coffee-classic',
  cardTitle: 'Coffee Loyalty Card',
  businessName: 'Brew Rewards',
  organizationName: 'Brew Rewards',
});

// Generate Android pass with template
const androidPassBuffer = await generateTemplateGooglePass({
  userId: 'user123',
  stampCount: 5,
  templateId: 'coffee-classic',
  cardTitle: 'Coffee Loyalty Card',
  businessName: 'Brew Rewards',
});

// Customize template colors
const customPass = await generateTemplatePass({
  userId: 'user123',
  stampCount: 5,
  templateId: 'coffee-classic',
  customColors: {
    backgroundColor: 'rgb(100, 50, 30)',
    foregroundColor: 'rgb(255, 255, 255)',
    labelColor: 'rgb(255, 240, 220)',
  },
});
```

### Using Original Functions (Preserved)

```typescript
import { generatePass, generateGooglePass } from '@/app/utils/pass-generation/pass-generation';

// Original functions still work as before
const iosPass = await generatePass('user123', 5);
const androidPass = await generateGooglePass('user123', 5);
```

## Template Selection

Users can select templates when creating passes. The template system provides:

1. **Pre-configured colors** - Background, foreground, and label colors
2. **Asset URLs** - Icons, logos, and strip images
3. **Styling** - Consistent design across platforms
4. **Customization** - Override any template property

## File Structure

```
modules/pass-generation/
├── index.ts                    # Main exports
├── types.ts                    # Type definitions
├── templates.ts                # Template definitions
├── template-generator.ts       # Template wrapper functions
├── template-pass-generator.ts  # Enhanced template-based generation
└── README.md                   # This file
```

## Notes

- Original implementation is preserved and unchanged
- Templates are additive - they don't modify existing code
- All templates include both iOS and Android configurations
- Custom colors and assets can override template defaults

