# Card Creation System Specification

## Overview

The card creation system allows businesses to create digital loyalty cards through a guided workflow. This is a new feature being built as part of the MVP.

## MVP Scope (Simplified)

Focus on essential features only - avoid bloat.

### Supported Card Types (MVP)

1. **Stamps Card** - Traditional punch card (buy 10, get 1 free)
2. **Points Card** - Accumulate points, exchange for rewards
3. **Discount Card** - Progressive discount based on visits

*Note: Additional card types (Multipass, Cash Back, Certificate, Coupon, Membership, Reward) will be added in Phase 2+*

## User Journey

### 5-Section Workflow

1. **Card Type Selection**
   - Display 3 card types with icons and descriptions
   - Show use case examples
   - Require selection before proceeding

2. **Settings** (Essential Only)
   - Card expiration (30/60/90/180/365 days or no expiration)
   - Language selection (default: account language)
   - Basic form fields (name, email, phone - required)
   - Privacy policy toggle (optional)

3. **Design** (Simplified)
   - Logo upload (PNG, JPG - max 2MB)
   - Icon upload for push notifications (PNG - 192x192px)
   - Color scheme (background, text, primary accent)
   - Basic preview (mobile mockup)

4. **Information**
   - Card title (required)
   - Business name (required)
   - Description (optional)
   - Reward details (card-type specific)
   - Terms of use (optional)

5. **Save & Preview**
   - Generate QR code
   - Generate distribution link
   - Preview card in wallet format
   - Activate card

## Technical Implementation

### Database Schema

Uses existing `passTemplates` table:
- `id`: UUID primary key
- `clientId`: Reference to client
- `name`: Template name
- `type`: Card type enum
- `design`: JSONB for design settings
- `settings`: JSONB for configuration
- `active`: Boolean flag

### API Endpoints (tRPC)

**Router**: `server/routers/cardsRouter.ts` (to be created)

Procedures:
- `create`: Create new card template
- `getById`: Get card template details
- `update`: Update card template
- `list`: List all cards for a client
- `activate`: Activate a card
- `deactivate`: Deactivate a card

### Frontend Components

**Page**: `app/cards/create/page.tsx`

**Components**:
- `CardTypeSelector` - Step 1
- `CardSettings` - Step 2
- `CardDesign` - Step 3
- `CardInformation` - Step 4
- `CardPreview` - Step 5

### State Management

Use React state or Zustand for:
- Current step tracking
- Form data across steps
- Preview state
- Validation state

## Validation Rules

### Required Fields
- Card type
- Card title
- Business name
- At least one location
- Logo (for design)

### Format Validation
- Email format
- Phone number format (by region)
- URL format
- Image file types (PNG, JPG)
- Image file size (max 2MB)

### Business Rules
- Stamp count: 2-50 stamps
- Expiration date: Must be in future (if set)
- Card name: Unique per client

## Integration with Pass Generation

Once card is created:
1. Store template in database
2. When customer registers, use template to generate pass
3. Pass generation uses template's design and settings
4. Update pass generation to support templates (future)

## Future Enhancements (Post-MVP)

- Additional card types (8 total)
- Advanced settings (UTM tracking, custom fields, etc.)
- Advanced design options (fonts, layouts, etc.)
- Multi-language support
- Template library
- Card duplication
- Bulk operations

## UI References

See `.agentos/ui-elements/card-designs/` for design inspiration.

## Testing Requirements

### Unit Tests
- [ ] Card type selection validation
- [ ] Form field validation
- [ ] Image upload validation
- [ ] Color picker functionality

### Integration Tests
- [ ] Full card creation flow
- [ ] Database persistence
- [ ] QR code generation
- [ ] Link generation

### E2E Tests (Future)
- [ ] Complete user journey
- [ ] Card activation
- [ ] Customer registration with new card

