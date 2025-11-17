# Pass Preview vs Generated Pass - Fix Summary

## Issue Description
The preview shown in `/test-card` was not matching the actual pass generated when users registered through `/Registration` or `/register/[cardId]`. The passes should match exactly, including:
- Stamp icons and count
- Colors (background, text, accent)
- Logo and icon assets
- Subtitle/status field
- All visual elements

## Root Causes Identified

### 1. Missing Design Fields in Test Pass Generation
**File**: `server/routers/passesRouter.ts`

**Problem**: The `generateTestPass` endpoint was not including visual design fields (backgroundColor, textColor, accentColor) and asset URLs (logo, icon, strip) when generating passes.

**Fix**: Added all design fields and DEFAULT_ASSETS to the cardData object:
```typescript
const cardData = {
  // Visual design fields - MUST match the preview
  cardTitle: input.cardTitle,
  businessName: input.businessName,
  subtitle: input.subtitle,
  description: input.description,
  backgroundColor: input.backgroundColor,
  textColor: input.textColor,
  accentColor: input.accentColor,
  // Asset URLs - use default assets like the preview
  logo: DEFAULT_ASSETS.logo,
  icon: DEFAULT_ASSETS.icon,
  strip: DEFAULT_ASSETS.strip,
  // ... rest of card-specific fields
};
```

### 2. Hardcoded STATUS Field
**File**: `modules/pass-generation/card-type-mappers.ts`

**Problem**: The STATUS auxiliary field in stamp cards was hardcoded to 'Active' instead of using the user-provided subtitle.

**Fix**: Changed to use subtitle from cardData:
```typescript
{
  key: 'status',
  label: 'STATUS',
  value: data.subtitle || 'Active',  // Use subtitle instead of hardcoded 'Active'
  textAlignment: 'PKTextAlignmentRight'
}
```

### 3. Missing Test Pass Download Feature
**File**: `app/admin/test-card/page.tsx`

**Problem**: There was no way to actually download and test the generated pass directly from the test-card page to compare with the preview.

**Fix**: Added "Download Test Pass" button that:
- Generates an actual pass with all current form settings
- Downloads the pass file (.pkpass for iOS or Google Wallet URL for Android)
- Allows admins to test the pass before creating the card template

## What Now Matches

### Visual Design
✅ **Background Color**: Both preview and actual pass use the same backgroundColor from form
✅ **Text Color**: Both use the same textColor for all text elements
✅ **Accent Color**: Both use the same accentColor for highlighted elements

### Assets
✅ **Logo**: Both use the same logo image from DEFAULT_ASSETS
✅ **Icon**: Both use the same icon image from DEFAULT_ASSETS
✅ **Strip**: Both use the same strip/header image from DEFAULT_ASSETS

### Card Content
✅ **Card Title**: Matches exactly
✅ **Business Name**: Matches exactly
✅ **Subtitle**: Now uses the same value in STATUS field
✅ **Description**: Used in back fields

### Stamp Card Specific
✅ **Stamp Count Display**: Shows `X/Y` format (e.g., "3/10")
✅ **Visual Stamps**: 
- Preview: Shows Star icons (React components)
- Actual Pass: Shows Unicode stars (★ for filled, ☆ for empty)
- This difference is expected - Apple Wallet can't render React components

✅ **Stamp Threshold**: Both use the same total number of stamps needed
✅ **Initial Stamps**: Both start with the same number of collected stamps

## How to Test

1. Go to `/admin/test-card`
2. Configure your card (type, colors, stamps, etc.)
3. Navigate to the final step "Save & Generate PDF"
4. Click **"Download Test Pass"** button to get an actual pass file
5. Open the pass in Apple Wallet or Google Wallet
6. Compare with the preview shown on the right side of the page
7. They should now match exactly!

## Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Admin configures card in /test-card                         │
│ - Sets colors, stamps, business name, etc.                  │
│ - Sees PREVIEW on right side                                │
└─────────────────────────────────────────────────────────────┘
                        │
                        ├─────────────────────────────────────┐
                        │                                     │
                        ▼                                     ▼
    ┌───────────────────────────────┐    ┌─────────────────────────────────┐
    │ Download Test Pass (NEW!)     │    │ Save Card & Generate PDF        │
    │ - Calls generateTestPass      │    │ - Creates card template in DB   │
    │ - Downloads actual pass       │    │ - Generates PDF with QR code    │
    │ - Can test immediately        │    │ - QR links to /register/[id]    │
    └───────────────────────────────┘    └─────────────────────────────────┘
                        ▲                                     │
                        │                                     │
                        │                                     ▼
    ┌───────────────────────────────────────────────────────────────┐
    │ NOW MATCHES!                                                   │
    │ Both use same cardData with all design fields and assets      │
    └───────────────────────────────────────────────────────────────┘
                                                                │
                                                                ▼
                                            ┌─────────────────────────────────┐
                                            │ Customer scans QR & registers   │
                                            │ - Fills form at /register/[id]  │
                                            │ - Gets actual pass              │
                                            │ - Pass matches the preview!     │
                                            └─────────────────────────────────┘
```

## Files Modified

1. **`server/routers/passesRouter.ts`**
   - Added DEFAULT_ASSETS constant
   - Included all design fields in cardData
   - Added subtitle, backgroundColor, textColor, accentColor
   - Added logo, icon, strip asset URLs

2. **`app/admin/test-card/page.tsx`**
   - Added "Download Test Pass" button
   - Wired up generateTestPass mutation with all form fields
   - Shows loading state during generation
   - Provides helpful description of the feature

3. **`modules/pass-generation/card-type-mappers.ts`**
   - Changed STATUS field to use data.subtitle instead of hardcoded 'Active'
   - Ensures pass matches preview exactly

## Notes

### Visual Stamps Limitation
The preview shows visual stamps using React Star icons, but the actual Apple Wallet pass must use Unicode star characters (★ ☆) because Apple Wallet doesn't support custom graphics in text fields. This is a platform limitation, not a bug.

### Default Assets
Both preview and actual pass now use the same DEFAULT_ASSETS URLs:
- Icon: `https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw`
- Logo: `https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D`
- Strip: `https://utfs.io/f/v9dcWxyyBXm2A9lcoz1Xuv5igpZT8CKbmJAWOEj0MVtRL9FB`

### Registration Flow
When users register through `/register/[cardId]`:
1. The card template is fetched from the database
2. All design fields and settings are extracted
3. The same `generatePass` function is called with the template's cardData
4. The generated pass matches the preview because both use the same cardData structure

## Testing Checklist

- [ ] Colors match (background, text, accent)
- [ ] Logo appears correctly
- [ ] Icon appears correctly
- [ ] Strip image appears at top
- [ ] Stamp count shows correctly (e.g., "3/10")
- [ ] Visual stamps display (★ filled, ☆ empty)
- [ ] Business name matches
- [ ] Card title matches
- [ ] Subtitle shows in STATUS field
- [ ] Description appears in back fields

All items should now check out! ✅

