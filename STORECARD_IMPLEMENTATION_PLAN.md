# StoreCard Implementation Plan

## Executive Summary

**Objective**: Migrate from generic pass type to storeCard pass type to support 8 card types (stamp, points, discount, cashback, multipass, coupon, reward, membership, gift) with modern design requirements.

**Key Decision**: Focus on **card types mapping to database** - card types are business logic entities that map to database schema, not just pass generation logic.

**Platform Support**: Apple Wallet (storeCard), Google Wallet (loyaltyObject), PWA fallback.

---

## Core Architecture Decision

### Card Types vs Pass Types

**Card Types** (Business Logic):
- `stamp` - Stamp collection card
- `points` - Points accumulation card  
- `discount` - Progressive discount card
- `cashback` - Cashback percentage card
- `multipass` - Prepaid visit card
- `coupon` - One-time use coupon
- `reward` - Reward points card
- `membership` - Membership/subscription card
- `gift` - Gift certificate card

**Pass Types** (Platform Implementation):
- Apple Wallet: `storeCard` (for all card types)
- Google Wallet: `loyaltyObject` (for all card types)
- PWA: Custom web-based card (fallback)

**Mapping Strategy**: One card type maps to one pass structure, but pass structure differs by platform (iOS vs Android vs PWA).

**Recommendation**: Focus on **card types mapping to database** because:
1. Card types define business rules (stamp count, points rate, discount tiers)
2. Database stores card type configuration and user data
3. Pass generation uses card type to determine pass structure
4. Platform selection (iOS/Android/PWA) is separate from card type logic

---

## Implementation Phases

### Phase 1: Database Schema Extension

**Objective**: Extend database to support card types and locations.

**Changes Required**:

1. **Extend `passTemplates` table**:
   ```sql
   ALTER TABLE pass_templates ADD COLUMN card_type TEXT;
   -- card_type: 'stamp', 'points', 'discount', 'cashback', etc.
   ```

2. **Add `locations` table**:
   ```sql
   CREATE TABLE locations (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     template_id UUID REFERENCES pass_templates(id),
     name TEXT NOT NULL,
     latitude DECIMAL(10, 8) NOT NULL,
     longitude DECIMAL(11, 8) NOT NULL,
     radius INTEGER DEFAULT 100, -- meters
     enabled BOOLEAN DEFAULT true,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Update `passTemplates.design` JSONB structure**:
```json
{
     "cardType": "stamp",
     "layout": "storeCard",
     "colors": {
       "background": "rgb(89, 52, 28)",
       "foreground": "rgb(255, 255, 255)",
       "accent": "rgb(255, 240, 220)"
     },
     "assets": {
       "logo": "url",
       "icon": "url",
       "strip": "url"
  }
}
```

4. **Update `passTemplates.settings` JSONB structure**:
```json
{
     "stampCount": 10,
     "pointsRate": 1,
     "discountTiers": [5, 10, 15],
     "expirationDays": 365,
     "rewardThreshold": 10
   }
   ```

**Files to Modify**:
- `db/schema.ts` - Add cardType field, locations table
- `drizzle/migrations/` - Create migration file

---

### Phase 2: StoreCard Pass Generation

**Objective**: Migrate pass generation from generic to storeCard.

**Changes Required**:

1. **Update `generatePass` function** (`app/utils/pass-generation/pass-generation.ts`):
   - Change `generic` → `storeCard` in pass.json
   - Add `headerFields`, `auxiliaryFields`, `backFields`
   - Include strip images in PKPass instance
   - Map card type to field structure

2. **Create card type field mappers**:
```typescript
   function getStoreCardFields(cardType: string, data: any) {
     switch(cardType) {
       case 'stamp':
         return {
           headerFields: [{ key: 'stamps', label: 'STAMPS', value: `${data.stampCount}/10` }],
           primaryFields: [{ key: 'reward', label: 'REWARD STATUS', value: data.rewardStatus }],
           secondaryFields: [{ key: 'progress', label: 'STAMPS UNTIL REWARD', value: `${10 - data.stampCount} stamps` }],
           auxiliaryFields: [{ key: 'collected', label: 'REWARDS COLLECTED', value: `${data.rewardsCollected} rewards` }]
         };
       case 'points':
         return {
           headerFields: [{ key: 'points', label: 'POINTS', value: `${data.pointsBalance}` }],
           primaryFields: [{ key: 'earn', label: 'Earn rewards', value: `£1 = ${data.pointsRate} points` }],
           secondaryFields: [{ key: 'next', label: 'NEXT REWARD', value: `After ${data.nextThreshold} points` }]
         };
       // ... other card types
     }
   }
   ```

3. **Update PKPass asset inclusion**:
```typescript
const pass = new passkit.PKPass({
  "pass.json": Buffer.from(JSON.stringify(passJson)),
  "logo.png": logoBuffer,
  "logo@2x.png": logo2xBuffer,
  "icon.png": iconBuffer,
  "icon@2x.png": icon2xBuffer,
     "strip.png": artworkBuffer,
     "strip@2x.png": artwork2xBuffer,
     "strip@3x.png": artwork3xBuffer,
  "thumbnail.png": secondaryLogoBuffer,
  "thumbnail@2x.png": secondaryLogo2xBuffer
}, {...});
```

**Files to Modify**:
- `app/utils/pass-generation/pass-generation.ts`
- Create `modules/pass-generation/card-type-mappers.ts` (new file)

---

### Phase 3: Platform Toggle & PWA Support

**Objective**: Add business-level platform selection and PWA fallback.

**Changes Required**:

1. **Add platform preferences to `client` table**:
   ```sql
   ALTER TABLE clients ADD COLUMN platform_preferences JSONB;
   -- {
   --   "appleWallet": true,
   --   "googleWallet": true,
   --   "pwa": true
   -- }
   ```

2. **Update pass generation logic**:
```typescript
   async function generatePassForUser(userId: string, templateId: string) {
     const template = await getTemplate(templateId);
     const client = await getClient(template.clientId);
     const platformPrefs = client.platformPreferences;
     
     // Detect user platform
     const userPlatform = detectPlatform(userAgent);
     
     // Check if platform is enabled
     if (userPlatform === 'ios' && !platformPrefs.appleWallet) {
       return generatePWAPass(userId, templateId); // Fallback to PWA
     }
     if (userPlatform === 'android' && !platformPrefs.googleWallet) {
       return generatePWAPass(userId, templateId); // Fallback to PWA
     }
     
     // Generate platform-specific pass
     if (userPlatform === 'ios') {
       return generatePass(userId, templateId);
     } else if (userPlatform === 'android') {
       return generateGooglePass(userId, templateId);
     } else {
       return generatePWAPass(userId, templateId); // Unknown platform -> PWA
  }
}
```

3. **Create PWA pass generator**:
   ```typescript
   async function generatePWAPass(userId: string, templateId: string) {
     // Generate web-based card view
     // Return URL to PWA card page
     return {
       type: 'pwa',
       url: `/cards/${userId}?template=${templateId}`
     };
   }
   ```

**Files to Modify**:
- `db/schema.ts` - Add platform_preferences to clients
- `modules/pass-generation/index.ts` - Add platform preference check
- Create `modules/pass-generation/pwa-generator.ts` (new file)
- `app/cards/[id]/page.tsx` - PWA card display page

---

### Phase 4: Card Creation Dashboard - Location Feature

**Objective**: Add location management to card creation workflow.

**Changes Required**:

1. **Add location section to card creation form** (`app/cards/create/page.tsx`):
```typescript
   const [locations, setLocations] = useState<Location[]>([]);
   
   const addLocation = (location: { name: string; lat: number; lng: number; radius: number }) => {
     setLocations([...locations, location]);
   };
   ```

2. **Create location input component**:
```typescript
   <LocationInput
     onAdd={addLocation}
     locations={locations}
     onRemove={(index) => setLocations(locations.filter((_, i) => i !== index))}
   />
   ```

3. **Update card creation API** (`server/routers/cardsRouter.ts`):
```typescript
   create: protectedProcedure
     .input(cardCreationSchema.extend({
       locations: z.array(z.object({
         name: z.string(),
         latitude: z.number(),
         longitude: z.number(),
         radius: z.number().min(50).max(500)
       })).optional()
     }))
     .mutation(async ({ input }) => {
       // Create template
       const template = await createTemplate(input);
       
       // Create locations
       if (input.locations) {
         await createLocations(template.id, input.locations);
       }
       
       return template;
     });
   ```

4. **Add locations to pass.json**:
```typescript
   const passJson = {
     // ... other fields
     locations: locations.map(loc => ({
       latitude: loc.latitude,
       longitude: loc.longitude,
       relevantText: loc.name
     }))
   };
   ```

**Files to Modify**:
- `app/cards/create/page.tsx` - Add location section
- `server/routers/cardsRouter.ts` - Handle locations in create mutation
- `app/utils/pass-generation/pass-generation.ts` - Include locations in pass.json
- Create `components/cards/location-input.tsx` (new file)

---

### Phase 5: Template System Implementation

**Objective**: Implement Quick Start and From Scratch template flows.

**Changes Required**:

1. **Update template selection UI** (`app/cards/create/page.tsx`):
```typescript
   const [templateMode, setTemplateMode] = useState<'quick-start' | 'from-scratch'>('quick-start');
   const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
   ```

2. **Load templates by card type**:
   ```typescript
   const templates = getTemplatesByCardType(cardType);
   // Show template gallery for quick-start mode
   // Show blank form for from-scratch mode
   ```

3. **Template application logic**:
   ```typescript
   function applyTemplate(templateId: string, cardType: string) {
     const template = getTemplate(templateId);
     return {
       design: template.design,
       settings: template.settings,
       passStructure: getPassStructureForCardType(cardType)
     };
   }
   ```

**Files to Modify**:
- `app/cards/create/page.tsx` - Template selection UI
- `modules/pass-generation/templates.ts` - Organize by card type
- `modules/pass-generation/card-type-mappers.ts` - Pass structure generators

---

### Phase 6: Google Wallet StoreCard Mapping

**Objective**: Ensure Google Wallet loyaltyObject matches storeCard structure.

**Changes Required**:

1. **Update Google Wallet pass generation** (`app/utils/pass-generation/pass-generation.ts`):
   ```typescript
   export async function generateGooglePass(userId: string, cardType: string, data: any) {
     const demo = new DemoLoyalty();
     await demo.createClass();
     
     // Map card type to Google Wallet structure
     const objectData = mapCardTypeToGoogleWallet(cardType, data);
     await demo.createObject(userId, objectData);
     
     return demo.createJwtNewObjects(userId, objectData);
   }
   ```

2. **Create Google Wallet mapper**:
```typescript
   function mapCardTypeToGoogleWallet(cardType: string, data: any) {
     switch(cardType) {
       case 'stamp':
         return {
           loyaltyPoints: {
             label: 'Stamps',
             balance: { int: data.stampCount }
           },
           textModulesData: [
             { header: 'STAMPS', body: `${data.stampCount}/10` },
             { header: 'REWARD STATUS', body: data.rewardStatus }
           ]
         };
       // ... other card types
  }
}
```

**Files to Modify**:
- `app/utils/pass-generation/pass-generation.ts` - Update generateGooglePass
- Create `modules/pass-generation/google-wallet-mapper.ts` (new file)

---

## Database Schema Summary

### Extended Tables

**passTemplates**:
- `cardType` TEXT - Card type identifier
- `design` JSONB - Visual configuration
- `settings` JSONB - Card-type-specific rules

**locations** (new):
- `template_id` UUID FK
- `name` TEXT
- `latitude` DECIMAL
- `longitude` DECIMAL
- `radius` INTEGER
- `enabled` BOOLEAN

**clients**:
- `platform_preferences` JSONB - Platform toggle settings

**userPasses**:
- `metadata` JSONB - Dynamic user data (stamps, points, etc.)

---

## Card Type to Pass Structure Mapping

### Stamp Card
- Header: STAMPS (X/10)
- Primary: REWARD STATUS
- Secondary: STAMPS UNTIL REWARD
- Auxiliary: REWARDS COLLECTED, STATUS

### Points Card
- Header: POINTS (balance)
- Primary: Earn rewards (£1 = X points)
- Secondary: NEXT REWARD, CURRENT REWARD
- Auxiliary: TIER, LIFETIME POINTS

### Discount Card
- Header: DISCOUNT (percentage)
- Primary: DISCOUNT STATUS
- Secondary: CASHBACK EARNED
- Auxiliary: VISITS, TIER

### Cashback Card
- Header: POINTS (balance)
- Primary: CASHBACK CARD (percentage)
- Secondary: CASHBACK EARNED
- Auxiliary: CASHBACK STATUS (Bronze/Silver/Gold)

### Membership Card
- Header: VALID UNTIL (date)
- Primary: CLASSES PER MONTH, TYPE
- Auxiliary: MEMBERSHIP TIER, AVAILABLE LIMITS

### Coupon Card
- Header: VALID UNTIL (date)
- Primary: OFFER DESCRIPTION
- Secondary: CLASS/TYPE

### Gift Card
- Header: BALANCE (amount)
- Primary: TAGLINE
- Secondary: GIFT CARD NUMBER

### Multipass Card
- Header: VISITS LEFT (count)
- Primary: NAME
- Secondary: VISIT PROGRESS

---

## Implementation Checklist

### Phase 1: Database
- [ ] Add `cardType` field to `passTemplates` table
- [ ] Create `locations` table
- [ ] Add `platform_preferences` to `clients` table
- [ ] Create database migration
- [ ] Update TypeScript schema types

### Phase 2: StoreCard Migration
- [ ] Update `generatePass` to use storeCard
- [ ] Create card type field mappers
- [ ] Include strip images in PKPass
- [ ] Add headerFields, auxiliaryFields, backFields
- [ ] Test each card type pass generation

### Phase 3: Platform Toggle
- [ ] Add platform preferences UI to client settings
- [ ] Update pass generation to check platform preferences
- [ ] Create PWA pass generator
- [ ] Create PWA card display page
- [ ] Test platform fallback logic

### Phase 4: Location Feature
- [ ] Add location input component
- [ ] Add location section to card creation form
- [ ] Update card creation API to handle locations
- [ ] Include locations in pass.json
- [ ] Test geo-push notification setup

### Phase 5: Templates
- [ ] Organize templates by card type
- [ ] Create template selection UI
- [ ] Implement template application logic
- [ ] Test quick-start and from-scratch flows

### Phase 6: Google Wallet
- [ ] Update Google Wallet pass generation
- [ ] Create Google Wallet card type mapper
- [ ] Ensure structure matches storeCard design
- [ ] Test all card types on Google Wallet

---

## Testing Strategy

### Unit Tests
- Card type field mapping functions
- Pass structure generation per card type
- Platform preference logic
- Location validation

### Integration Tests
- Full pass generation flow per card type
- Platform toggle behavior
- Location inclusion in passes
- Template application

### E2E Tests
- Card creation with locations
- Pass download on iOS/Android/PWA
- Scanner app updates pass
- Geo-push notifications (when webServiceURL enabled)

---

## Migration Notes

### Backward Compatibility
- Existing generic passes continue to work
- New passes use storeCard
- Gradual migration: update passes on next scan/update

### Rollout Strategy
1. Deploy database changes
2. Deploy storeCard generation (new passes only)
3. Add platform toggle UI
4. Add location feature
5. Migrate existing passes gradually

---

## Future Enhancements

### Phase 7: WebService Implementation (Post-HTTPS)
- Enable webServiceURL in pass.json
- Implement pass update API endpoints
- Trigger push notifications on scanner updates
- Test automatic pass updates

### Phase 8: Advanced Features
- Custom strip images per card type
- Multi-language support
- Advanced field layouts
- Dynamic pass updates via webServiceURL

---

## Key Files Reference

**Database**:
- `db/schema.ts` - Schema definitions
- `drizzle/migrations/` - Migration files

**Pass Generation**:
- `app/utils/pass-generation/pass-generation.ts` - Core pass generation
- `modules/pass-generation/card-type-mappers.ts` - Field structure mappers
- `modules/pass-generation/google-wallet-mapper.ts` - Google Wallet mapping
- `modules/pass-generation/pwa-generator.ts` - PWA fallback

**UI Components**:
- `app/cards/create/page.tsx` - Card creation form
- `components/cards/location-input.tsx` - Location input component
- `app/cards/[id]/page.tsx` - PWA card display

**API Routes**:
- `server/routers/cardsRouter.ts` - Card template management
- `server/routers/passesRouter.ts` - Pass generation endpoints
