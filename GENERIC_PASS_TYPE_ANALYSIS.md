# Pass Type Analysis: Generic vs StoreCard

## Executive Summary

**Question**: Is the generic pass type sufficient for the PRD requirements and card designs?

**Answer**: **NO - StoreCard Type Required** - Based on the card design images, all card types (Stamp, Points, Discount, Cashback, Multipass, Coupon, Reward, Membership, Gift) require **storeCard** pass type for proper visual representation and field organization.

**Critical Finding**: The same `passTypeIdentifier` can be used - only the JSON structure needs to change from `generic` to `storeCard`.

---

## Card Design Analysis (Based on Inspiration Images)

### Design Requirements from Images

Analyzing the card design inspiration images reveals **8 distinct card types** that need to be supported:

#### Retention Cards (Green Labels)
1. **Stamp Card** (CITY HAIR example)
   - Visual stamp grid (10 stamps, 4 filled, 6 empty)
   - "STAMPS UNTIL THE REWARD: 6 stamps"
   - "REWARDS COLLECTED: 0 rewards"
   - Strip image with branding
   - **Requires**: headerFields, primaryFields, visual stamp indicators

2. **Cashback Card** (BREAD AHEAD example)
   - "POINTS: 23.00" (large display)
   - "CASHBACK PERCENTAGE: 3%"
   - "CASHBACK STATUS: Bronze"
   - Strip image with product photos
   - **Requires**: headerFields, primaryFields, auxiliaryFields for status

3. **Reward Card** (BISOU-BISOU example)
   - "POINTS 105" (prominent)
   - "Earn rewards" with "£1 = 10 points"
   - "REWARD £10 off coupon"
   - "NEXT REWARD AFTER 95"
   - Vibrant strip image with macarons
   - **Requires**: headerFields, primaryFields, secondaryFields, rich visuals

4. **Discount Card** (TESCO Clubcard example)
   - "DISCOUNT PERCENTAGE 1%"
   - "DISCOUNT STATUS Bronze"
   - **Requires**: headerFields, primaryFields, auxiliaryFields

5. **Membership Card** (YOGA STUDIO CHELSEA example)
   - "VALID UNTIL 01/05/2024"
   - "5 CLASSES PER MONTH"
   - "ONLINE CLASSES"
   - "MEMBERSHIP TIER Gold"
   - "AVAILABLE LIMITS 5"
   - Strip image with yoga pose
   - **Requires**: headerFields, primaryFields, auxiliaryFields, expiration date

#### Acquisition Cards (Blue Labels)
6. **Multipass** (storksen example)
   - "VISITS LEFT: 9 stamps"
   - "NAME: Anika"
   - Visual bird icons (10 icons, 1 filled)
   - **Requires**: headerFields, primaryFields, visual indicators

7. **Coupon** (Stretch Inc. example)
   - "VALID UNTIL: 24/04/2024"
   - "FREE STRETCHING CLASS EVERY TUESDAY"
   - "FREE CLASS: Stretching"
   - Strip image with person stretching
   - **Requires**: headerFields, primaryFields, expiration date, rich visuals

8. **Gift Card** (abi lee. example)
   - "BALANCE 180" (prominent)
   - "GIFT CARD # 3777248"
   - "Where Nails Come To Life"
   - Strip image with balloons
   - **Requires**: headerFields, primaryFields, secondaryFields

### Common Design Patterns Across All Cards

**Visual Elements**:
- ✅ **Strip images** - All cards have background/banner images
- ✅ **Multiple field types** - Header, primary, secondary, auxiliary fields
- ✅ **Status indicators** - Bronze, Gold tiers, progress displays
- ✅ **Expiration dates** - "VALID UNTIL" fields
- ✅ **Rich branding** - Custom colors, logos, images

**Field Organization**:
- **Header Fields**: Status, tier, expiration (top section)
- **Primary Fields**: Main value (points, balance, stamps) - large, prominent
- **Secondary Fields**: Progress, next reward, details
- **Auxiliary Fields**: Status, tier, limits (side-by-side)
- **Back Fields**: Terms, contact info (when pass is flipped)

### Critical Finding: StoreCard Type Required

**All 8 card types require storeCard pass type** because:
1. ✅ **Strip images** - Generic pass doesn't support strip.png
2. ✅ **Header fields** - Generic pass doesn't have headerFields
3. ✅ **Auxiliary fields** - Generic pass has limited field organization
4. ✅ **Visual hierarchy** - StoreCard provides better layout control
5. ✅ **Status displays** - Need multiple field types for tier/status info

---

## Current Implementation Status

### What We Have (Generic Pass Type)

✅ **Working Features**:
- Basic pass generation and distribution
- QR code scanning capability
- Stamp/point tracking display (basic)
- Minimal visual customization (colors, logo, icon)
- Pass opens successfully in Apple Wallet

### What's Missing (Critical Gaps)

❌ **Cannot Support Design Requirements**:
- ❌ **No strip images** - All designs show background/strip images
- ❌ **No headerFields** - Designs show status/tier in header
- ❌ **No auxiliaryFields** - Designs show side-by-side status info
- ❌ **Limited visual appeal** - Generic pass is too simple for these designs
- ❌ **Cannot differentiate card types** - All look the same visually

---

## Technical Analysis: What Needs to Change?

### Key Question: API/JSON Structure vs Apple Identifier?

**Answer**: **Only JSON Structure Needs to Change** - No change to Apple Identifier required.

### 1. Pass Type Identifier (Apple Identifier)

**Current**: `pass.com.dopecard.passmaker`
**Change Required**: ❌ **NO CHANGE**

**Why**: 
- The `passTypeIdentifier` is tied to your **Apple Developer certificate**, not the pass type
- You can use the **same passTypeIdentifier** for both `generic` and `storeCard` passes
- The certificate authorizes the identifier, not the specific pass structure
- Apple allows one identifier to generate different pass types

**Important**: The `teamIdentifier` also stays the same: `DTWNQT4JQL`

### 2. Pass JSON Structure (API/Code Changes)

**Current Structure** (Generic):
```json
{
  "formatVersion": 1,
  "serialNumber": "COFFEE{userId}",
  "passTypeIdentifier": "pass.com.dopecard.passmaker",
  "teamIdentifier": "DTWNQT4JQL",
  "generic": {
    "primaryFields": [...],
    "secondaryFields": [...]
  }
}
```

**Required Structure** (StoreCard):
```json
{
  "formatVersion": 1,
  "serialNumber": "COFFEE{userId}",
  "passTypeIdentifier": "pass.com.dopecard.passmaker",  // SAME IDENTIFIER
  "teamIdentifier": "DTWNQT4JQL",  // SAME TEAM ID
  "storeCard": {  // CHANGE: generic → storeCard
    "headerFields": [...],      // NEW: Status, tier, expiration
    "primaryFields": [...],     // SAME: Main value
    "secondaryFields": [...],   // SAME: Progress, details
    "auxiliaryFields": [...],   // NEW: Side-by-side info
    "backFields": [...]         // NEW: Terms, contact
  }
}
```

### 3. Required Code Changes

#### File: `app/utils/pass-generation/pass-generation.ts`

**Change 1**: Replace `generic` with `storeCard`:
```typescript
// OLD (Generic)
const passJson = {
  generic: { ... }
};

// NEW (StoreCard)
const passJson = {
  storeCard: {
    headerFields: [...],
    primaryFields: [...],
    secondaryFields: [...],
    auxiliaryFields: [...],
    backFields: [...]
  }
};
```

**Change 2**: Add strip images to PKPass instance:
```typescript
// OLD (Minimal assets)
const pass = new passkit.PKPass({
  "pass.json": Buffer.from(JSON.stringify(passJson)),
  "logo.png": logoBuffer,
  "icon.png": iconBuffer
}, {...});

// NEW (With strip images)
const pass = new passkit.PKPass({
  "pass.json": Buffer.from(JSON.stringify(passJson)),
  "logo.png": logoBuffer,
  "logo@2x.png": logo2xBuffer,
  "icon.png": iconBuffer,
  "icon@2x.png": icon2xBuffer,
  "strip.png": artworkBuffer,        // NEW: Background banner
  "strip@2x.png": artwork2xBuffer,  // NEW: Retina banner
  "strip@3x.png": artwork3xBuffer,  // NEW: High-res banner
  "thumbnail.png": secondaryLogoBuffer,
  "thumbnail@2x.png": secondaryLogo2xBuffer
}, {...});
```

**Change 3**: Map card types to field structures:
```typescript
// Stamp Card Structure
if (cardType === 'stamp') {
  storeCard: {
    headerFields: [
      { key: 'stamps', label: 'STAMPS', value: `${stampCount}/10` }
    ],
    primaryFields: [
      { key: 'reward', label: 'REWARD STATUS', value: 'Keep collecting!' }
    ],
    secondaryFields: [
      { key: 'progress', label: 'Progress', value: '6 stamps until reward' }
    ],
    auxiliaryFields: [
      { key: 'member', label: 'MEMBER SINCE', value: '...' },
      { key: 'status', label: 'STATUS', value: 'Regular' }
    ]
  }
}

// Points Card Structure
if (cardType === 'points') {
  storeCard: {
    headerFields: [
      { key: 'points', label: 'POINTS', value: '105' }
    ],
    primaryFields: [
      { key: 'earn', label: 'Earn rewards', value: '£1 = 10 points' }
    ],
    secondaryFields: [
      { key: 'next', label: 'NEXT REWARD', value: 'After 95 points' }
    ]
  }
}
```

### 4. Asset Requirements

**Current Assets** (Minimal):
- `logo.png` ✅
- `icon.png` ✅

**Required Assets** (StoreCard):
- `logo.png` ✅ (already have)
- `logo@2x.png` ✅ (already fetching)
- `icon.png` ✅ (already have)
- `icon@2x.png` ✅ (already fetching)
- `strip.png` ✅ (already fetching - need to include)
- `strip@2x.png` ✅ (already fetching - need to include)
- `strip@3x.png` ✅ (already fetching - need to include)
- `thumbnail.png` ✅ (already fetching - need to include)
- `thumbnail@2x.png` ✅ (already fetching - need to include)

**Good News**: All assets are already being fetched! Just need to include them in PKPass instance.

---

## PRD Requirements Analysis

### 2.1 Card Creation System

#### 2.1.1 Card Templates

**PRD Requirement**:
- 8 card types: Stamp, Points, Discount, Cashback, Multipass, Coupon, Reward, Membership, Gift
- Configurable stamp count (2-50)
- Points rate configuration
- Discount tiers
- Status/tier displays
- Expiration dates

**Current Status**: ❌ **INSUFFICIENT**

**Generic Pass Type Capability**:
- ✅ Can display stamp count in `primaryFields`
- ✅ Can display progress in `secondaryFields`
- ❌ **Cannot show status/tier in header** - No headerFields
- ❌ **Cannot show side-by-side info** - No auxiliaryFields
- ❌ **Cannot use strip images** - No visual background
- ❌ **Cannot differentiate visually** - All cards look identical

**StoreCard Pass Type Capability**:
- ✅ Can display stamp count in `primaryFields`
- ✅ Can display progress in `secondaryFields`
- ✅ **Can show status/tier in headerFields** - Perfect for designs
- ✅ **Can show side-by-side info in auxiliaryFields** - Matches designs
- ✅ **Can use strip images** - Rich visual backgrounds
- ✅ **Can differentiate visually** - Each card type can have unique layout

**Gap**: Generic pass type **cannot** support the visual requirements shown in the design images.

**Recommendation**: 
- ❌ **Generic pass type is NOT sufficient** for the design requirements
- ✅ **StoreCard type is REQUIRED** to match the design images

#### 2.1.2 Visual Customization

**PRD Requirement**:
- Logo upload ✅ (Working)
- Icon upload ✅ (Working)
- Brand color selection ✅ (Working - backgroundColor, foregroundColor)
- **Strip/banner images** ❌ (Required by all designs - NOT in generic)
- Background customization ❌ (Required - NOT in generic)
- Font selection ❌ (Not supported in any pass type)

**Current Status**: ❌ **INSUFFICIENT**

**Generic Pass Type Capability**:
- ✅ Logo and icon support
- ✅ Color customization (background, foreground)
- ❌ **No strip images** - **ALL designs show strip images - CRITICAL GAP**
- ❌ **No background images** - Only solid colors (designs need images)
- ❌ **Limited layout options** - Fixed field positions (designs need flexibility)

**StoreCard Pass Type Capability**:
- ✅ Logo and icon support
- ✅ Color customization (background, foreground, labelColor)
- ✅ **Strip images supported** - `strip.png`, `strip@2x.png`, `strip@3x.png`
- ✅ **Rich visual backgrounds** - Can use images for branding
- ✅ **Flexible layout** - Multiple field types for better organization

**Gap**: Generic pass type **cannot** support the visual requirements. **StoreCard is mandatory**.

**Recommendation**:
- ❌ **Generic is NOT sufficient** - All designs require strip images
- ✅ **StoreCard is REQUIRED** - Only way to match design images

#### 2.1.3 Card Information Fields

**PRD Requirement**:
- Card title ✅ (Can use `description`)
- Business name ✅ (Using `organizationName`)
- Card description ✅ (Can add to fields)
- Reward details ✅ (Can display in fields)
- Terms of use ❌ (No backFields in current implementation)
- Contact information ❌ (Not implemented)
- Operating hours ❌ (Not implemented)
- Social media links ❌ (Not implemented)

**Current Status**: ⚠️ **PARTIAL**

**Generic Pass Type Capability**:
- ✅ Can display title, business name, description
- ✅ Can show reward details in fields
- ✅ **Supports backFields** - Can add terms, contact info, links
- ❌ **Not currently implemented** - BackFields exist but not used

**Gap**: Generic pass type **supports** all required fields but they're not implemented yet.

**Recommendation**:
- **MVP**: Add backFields to generic pass for terms and contact info
- **Phase 2**: Add auxiliaryFields for additional information

### 2.2 Customer Management & Card Distribution

**PRD Requirement**:
- QR code generation ✅ (Working)
- Direct link sharing ✅ (Working)
- Card installation flow ✅ (Working)

**Current Status**: ✅ **SUFFICIENT**

**Generic Pass Type**: Fully supports distribution requirements.

### 2.3 Scanner Application

**PRD Requirement**:
- QR code scanning ✅ (Barcode in pass works)
- Add stamps/points ✅ (Can update pass)
- Transaction history ✅ (Backend feature, not pass-related)

**Current Status**: ✅ **SUFFICIENT**

**Generic Pass Type**: QR code scanning works perfectly with generic pass type.

### 2.4 Push Notification System

**PRD Requirement**:
- Manual push messages ✅ (Backend feature)
- Automated push notifications ✅ (Backend feature)
- Geo-based push ❌ (Requires webServiceURL and locations)

**Current Status**: ⚠️ **PARTIAL**

**Generic Pass Type Capability**:
- ✅ Supports push notifications (backend feature)
- ❌ **webServiceURL commented out** - Needed for push updates
- ❌ **Locations not in pass.json** - Needed for geo-push

**Gap**: Generic pass type supports locations field but it's not implemented.

**Recommendation**:
- **MVP**: Can work without geo-push
- **Phase 2**: Add locations field to pass.json for geo-push

---

## Detailed Feature Comparison by Card Type

### Stamp Card Requirements (CITY HAIR Design)

| Feature | Design Shows | Generic Pass | StoreCard Pass | Required? |
|---------|-------------|--------------|----------------|----------|
| Visual stamp grid (10 stamps) | ✅ Yes | ❌ No | ✅ Can show in fields | ✅ **YES** |
| "STAMPS UNTIL REWARD: 6" | ✅ Yes | ⚠️ Limited | ✅ headerFields | ✅ **YES** |
| "REWARDS COLLECTED: 0" | ✅ Yes | ⚠️ Limited | ✅ auxiliaryFields | ✅ **YES** |
| Strip image background | ✅ Yes | ❌ **NO** | ✅ **YES** | ✅ **CRITICAL** |
| Status display | ✅ Yes | ❌ No | ✅ headerFields | ✅ **YES** |

**Verdict**: ❌ **Generic CANNOT support** - Missing strip images and headerFields. **StoreCard REQUIRED**.

### Points/Reward Card Requirements (BISOU-BISOU Design)

| Feature | Design Shows | Generic Pass | StoreCard Pass | Required? |
|---------|-------------|--------------|----------------|----------|
| "POINTS 105" (large) | ✅ Yes | ⚠️ Basic | ✅ primaryFields | ✅ **YES** |
| "Earn rewards" section | ✅ Yes | ⚠️ Limited | ✅ primaryFields | ✅ **YES** |
| "£1 = 10 points" | ✅ Yes | ⚠️ Limited | ✅ secondaryFields | ✅ **YES** |
| "NEXT REWARD AFTER 95" | ✅ Yes | ⚠️ Limited | ✅ secondaryFields | ✅ **YES** |
| Strip image (macarons) | ✅ Yes | ❌ **NO** | ✅ **YES** | ✅ **CRITICAL** |
| Multiple field sections | ✅ Yes | ❌ Limited | ✅ Multiple fields | ✅ **YES** |

**Verdict**: ❌ **Generic CANNOT support** - Missing strip images and field organization. **StoreCard REQUIRED**.

### Cashback Card Requirements (BREAD AHEAD Design)

| Feature | Design Shows | Generic Pass | StoreCard Pass | Required? |
|---------|-------------|--------------|----------------|----------|
| "POINTS: 23.00" | ✅ Yes | ⚠️ Basic | ✅ primaryFields | ✅ **YES** |
| "CASHBACK PERCENTAGE: 3%" | ✅ Yes | ⚠️ Limited | ✅ secondaryFields | ✅ **YES** |
| "CASHBACK STATUS: Bronze" | ✅ Yes | ❌ No | ✅ auxiliaryFields | ✅ **YES** |
| Strip image (bread) | ✅ Yes | ❌ **NO** | ✅ **YES** | ✅ **CRITICAL** |

**Verdict**: ❌ **Generic CANNOT support** - Missing strip images and status fields. **StoreCard REQUIRED**.

### Membership Card Requirements (YOGA STUDIO Design)

| Feature | Design Shows | Generic Pass | StoreCard Pass | Required? |
|---------|-------------|--------------|----------------|----------|
| "VALID UNTIL 01/05/2024" | ✅ Yes | ❌ No | ✅ headerFields | ✅ **YES** |
| "5 CLASSES PER MONTH" | ✅ Yes | ⚠️ Limited | ✅ primaryFields | ✅ **YES** |
| "MEMBERSHIP TIER Gold" | ✅ Yes | ❌ No | ✅ auxiliaryFields | ✅ **YES** |
| "AVAILABLE LIMITS 5" | ✅ Yes | ❌ No | ✅ auxiliaryFields | ✅ **YES** |
| Strip image (yoga pose) | ✅ Yes | ❌ **NO** | ✅ **YES** | ✅ **CRITICAL** |

**Verdict**: ❌ **Generic CANNOT support** - Missing expiration, tier, and strip images. **StoreCard REQUIRED**.

### Coupon Card Requirements (Stretch Inc. Design)

| Feature | Design Shows | Generic Pass | StoreCard Pass | Required? |
|---------|-------------|--------------|----------------|----------|
| "VALID UNTIL: 24/04/2024" | ✅ Yes | ❌ No | ✅ headerFields | ✅ **YES** |
| "FREE STRETCHING CLASS" | ✅ Yes | ⚠️ Limited | ✅ primaryFields | ✅ **YES** |
| Strip image (person) | ✅ Yes | ❌ **NO** | ✅ **YES** | ✅ **CRITICAL** |

**Verdict**: ❌ **Generic CANNOT support** - Missing expiration and strip images. **StoreCard REQUIRED**.

### Gift Card Requirements (abi lee. Design)

| Feature | Design Shows | Generic Pass | StoreCard Pass | Required? |
|---------|-------------|--------------|----------------|----------|
| "BALANCE 180" (large) | ✅ Yes | ⚠️ Basic | ✅ primaryFields | ✅ **YES** |
| "GIFT CARD # 3777248" | ✅ Yes | ⚠️ Limited | ✅ secondaryFields | ✅ **YES** |
| Strip image (balloons) | ✅ Yes | ❌ **NO** | ✅ **YES** | ✅ **CRITICAL** |

**Verdict**: ❌ **Generic CANNOT support** - Missing strip images. **StoreCard REQUIRED**.

---

## Visual Comparison: Generic vs StoreCard

### Generic Pass Type (Current - Cannot Match Designs)

```
┌─────────────────────────┐
│ [Logo]  Organization    │
│         Name            │
├─────────────────────────┤
│                         │
│   Primary Field         │
│   (Large, prominent)    │
│                         │
│   Secondary Field       │
│   (Smaller)             │
│                         │
│   [QR Code]             │
│                         │
└─────────────────────────┘
```

**Limitations**:
- ❌ **No strip images** - Cannot match any design
- ❌ **No header fields** - Cannot show status/tier/expiration
- ❌ **No auxiliary fields** - Cannot show side-by-side info
- ❌ **Plain background** - Only solid colors
- ❌ **All cards look identical** - No visual differentiation

### StoreCard Type (Required - Matches All Designs)

```
┌─────────────────────────┐
│ [Strip Image Banner]    │ ← Matches all designs
│ [Logo]  Organization    │
├─────────────────────────┤
│ Header: Status/Tier     │ ← Matches designs
├─────────────────────────┤
│ Primary: Main Value     │ ← Matches designs
├─────────────────────────┤
│ Secondary: Progress     │ ← Matches designs
│ Auxiliary: Side Info    │ ← Matches designs
├─────────────────────────┤
│ [QR Code]               │
└─────────────────────────┘
```

**Capabilities**:
- ✅ **Strip images** - Matches all 8 card designs
- ✅ **Header fields** - Shows status, tier, expiration (as in designs)
- ✅ **Auxiliary fields** - Shows side-by-side info (as in designs)
- ✅ **Rich backgrounds** - Visual branding (as in designs)
- ✅ **Visual differentiation** - Each card type can be unique

---

## Brainstorming: Implementation Strategy

### Critical Decision: Generic vs StoreCard

**Based on Design Analysis**: **StoreCard is MANDATORY**

**Why**:
1. **All 8 card designs show strip images** - Generic cannot support this
2. **All designs show header fields** - Generic doesn't have headerFields
3. **All designs show status/tier info** - Generic cannot organize this properly
4. **Visual differentiation required** - Generic makes all cards look the same

### Implementation Options

#### Option 1: Direct Migration to StoreCard (Recommended)

**Approach**: Switch from generic to storeCard immediately

**Pros**:
- ✅ Matches all design requirements
- ✅ Supports all 8 card types
- ✅ Professional appearance
- ✅ Future-proof

**Cons**:
- ⚠️ More complex structure
- ⚠️ Need to test thoroughly
- ⚠️ More assets required

**Implementation**:
1. Change `generic` → `storeCard` in pass.json
2. Add headerFields, auxiliaryFields, backFields
3. Include strip images in PKPass instance
4. Map card types to field structures
5. Test each card type

#### Option 2: Hybrid Approach (Not Recommended)

**Approach**: Support both generic and storeCard

**Pros**:
- ✅ Fallback option
- ✅ Gradual migration

**Cons**:
- ❌ Double maintenance
- ❌ Confusing for users
- ❌ Generic doesn't meet requirements anyway

**Verdict**: Not recommended - StoreCard is required for all designs.

### Field Structure Mapping by Card Type

#### Stamp Card Structure
```typescript
storeCard: {
  headerFields: [
    { key: 'stamps', label: 'STAMPS', value: `${stampCount}/10` }
  ],
  primaryFields: [
    { key: 'reward', label: 'REWARD STATUS', value: stampCount >= 10 ? 'FREE!' : 'Keep collecting!' }
  ],
  secondaryFields: [
    { key: 'progress', label: 'STAMPS UNTIL REWARD', value: `${10 - stampCount} stamps` }
  ],
  auxiliaryFields: [
    { key: 'collected', label: 'REWARDS COLLECTED', value: `${rewardsCollected} rewards` },
    { key: 'status', label: 'STATUS', value: 'Active' }
  ]
}
```

#### Points/Reward Card Structure
```typescript
storeCard: {
  headerFields: [
    { key: 'points', label: 'POINTS', value: `${pointsBalance}` }
  ],
  primaryFields: [
    { key: 'earn', label: 'Earn rewards', value: `£1 = ${pointsRate} points` }
  ],
  secondaryFields: [
    { key: 'next', label: 'NEXT REWARD', value: `After ${nextRewardThreshold} points` },
    { key: 'current', label: 'REWARD', value: `${currentReward}` }
  ],
  auxiliaryFields: [
    { key: 'tier', label: 'TIER', value: tier },
    { key: 'lifetime', label: 'LIFETIME POINTS', value: `${lifetimePoints}` }
  ]
}
```

#### Cashback Card Structure
```typescript
storeCard: {
  headerFields: [
    { key: 'points', label: 'POINTS', value: `${pointsBalance}` }
  ],
  primaryFields: [
    { key: 'cashback', label: 'CASHBACK CARD', value: `${cashbackPercentage}%` }
  ],
  secondaryFields: [
    { key: 'earned', label: 'CASHBACK EARNED', value: `£${cashbackEarned}` }
  ],
  auxiliaryFields: [
    { key: 'status', label: 'CASHBACK STATUS', value: statusTier } // Bronze, Silver, Gold
  ]
}
```

#### Membership Card Structure
```typescript
storeCard: {
  headerFields: [
    { key: 'valid', label: 'VALID UNTIL', value: expirationDate }
  ],
  primaryFields: [
    { key: 'classes', label: 'CLASSES PER MONTH', value: `${classesPerMonth}` },
    { key: 'type', label: 'TYPE', value: 'ONLINE CLASSES' }
  ],
  auxiliaryFields: [
    { key: 'tier', label: 'MEMBERSHIP TIER', value: tier }, // Gold, Silver, Bronze
    { key: 'limits', label: 'AVAILABLE LIMITS', value: `${availableLimits}` }
  ]
}
```

#### Coupon Card Structure
```typescript
storeCard: {
  headerFields: [
    { key: 'valid', label: 'VALID UNTIL', value: expirationDate }
  ],
  primaryFields: [
    { key: 'offer', label: 'FREE STRETCHING CLASS', value: 'EVERY TUESDAY' },
    { key: 'class', label: 'FREE CLASS', value: 'Stretching' }
  ]
}
```

#### Gift Card Structure
```typescript
storeCard: {
  headerFields: [
    { key: 'balance', label: 'BALANCE', value: `£${balance}` }
  ],
  primaryFields: [
    { key: 'tagline', label: '', value: 'Where Nails Come To Life' }
  ],
  secondaryFields: [
    { key: 'number', label: 'GIFT CARD #', value: cardNumber }
  ]
}
```

### Asset Strategy

**All Assets Already Available**:
- ✅ `logo.png`, `logo@2x.png` - Business logo
- ✅ `icon.png`, `icon@2x.png` - Notification icon
- ✅ `strip.png`, `strip@2x.png`, `strip@3x.png` - Background banner (already fetching!)
- ✅ `thumbnail.png`, `thumbnail@2x.png` - Thumbnail image

**Action Required**: Just include them in PKPass instance (currently commented out)

---

## Recommendations by Phase

### Phase 1: MVP (Current - 70% Feature Parity)

**StoreCard Pass Type**: ✅ **REQUIRED**

**What to Change**:
1. ✅ **Switch to storeCard** - Change `generic` → `storeCard` in pass.json
2. ✅ **Add headerFields** - Status, tier, expiration
3. ✅ **Add auxiliaryFields** - Side-by-side info
4. ✅ **Add backFields** - Terms, contact info
5. ✅ **Include strip images** - Uncomment strip.png assets
6. ✅ **Map card types** - Create field structures for each card type
7. ✅ **Map form data** - Use test-card form inputs

**What to Keep**:
- ✅ Same passTypeIdentifier (`pass.com.dopecard.passmaker`)
- ✅ Same teamIdentifier (`DTWNQT4JQL`)
- ✅ Same certificates (no change needed)
- ✅ Same asset URLs (already fetching all assets)

**What to Add**:
- ✅ StoreCard structure in pass.json
- ✅ All field types (header, primary, secondary, auxiliary, back)
- ✅ Strip images in PKPass instance

### Phase 2: Enhanced Features (Months 4-6)

**StoreCard Pass Type**: ✅ **ALREADY IMPLEMENTED** (if Phase 1 done correctly)

**What to Add**:
1. ✅ **webServiceURL** - Add when HTTPS ready (for pass updates)
2. ✅ **Push notifications** - Implement pass update system
3. ✅ **Geo-location** - Add locations field for geo-push
4. ✅ **Expiration handling** - Dynamic expiration dates
5. ✅ **Advanced customization** - More field options per card type

### Phase 3: Premium Features (Months 7-9)

**StoreCard Type**: ✅ **BASE REQUIREMENT** (already in place)

**Enhancements**:
- ✅ **Custom strip images** - User-uploaded backgrounds
- ✅ **Advanced field layouts** - More creative arrangements
- ✅ **Multi-language support** - Localized field labels
- ✅ **Dynamic updates** - Real-time pass updates via webServiceURL

---

## Generic Pass Type Analysis: Current State & Limitations

### Barcode Support in Generic Pass Type

**Current Implementation**: Barcode is defined in pass.json (lines 222-226) with proper structure:
```typescript
barcode: {
    message: userId,
    format: 'PKBarcodeFormatQR',
    messageEncoding: 'iso-8859-1'
}
```

**Issue**: Barcode may not be visually rendering in the test-card, but this is not a generic pass type limitation. Generic pass type fully supports barcodes. The issue is likely:
- Visual rendering problem (barcode exists but not visible)
- Asset/display issue unrelated to pass type
- Testing environment limitation

**Verification**: Generic pass type supports all barcode formats (QR, PDF417, Aztec, Code128). The barcode field is correctly structured and should work.

**Action Required**: Debug barcode rendering separately from pass type migration. Barcode support is not a reason to switch to storeCard.

### Generic Pass Type Capabilities Summary

**What Generic Pass Type Can Do**:
- Display primary and secondary fields
- Support barcodes (QR, PDF417, Aztec, Code128)
- Customize colors (background, foreground, label)
- Include logo and icon assets
- Support backFields for terms/contact info
- Basic pass updates via webServiceURL

**What Generic Pass Type Cannot Do**:
- Display strip/banner images (critical for design requirements)
- Organize fields into header section (status, tier, expiration)
- Show auxiliary fields side-by-side (status displays)
- Differentiate visual layouts between card types
- Match professional appearance of design inspiration images

**Conclusion**: Generic pass type works functionally but cannot meet visual design requirements. Migration to storeCard is required for visual compliance, not functional limitations.

---

## Database Design & Card Type Mapping

### Current Database Schema

**passTemplates Table**:
```typescript
{
  id: uuid (PK)
  clientId: uuid (FK -> client.id)
  name: text
  type: passTypeEnum ('loyalty', 'coupon', 'eventTicket', 'boardingPass', 'generic')
  design: jsonb (design settings)
  settings: jsonb (configuration)
  active: boolean
}
```

**userPasses Table**:
```typescript
{
  id: uuid (PK)
  userId: uuid (FK -> users.id)
  templateId: uuid (FK -> passTemplates.id, nullable)
  serialNumber: text (unique)
  status: text ('active', 'expired', 'revoked')
  metadata: jsonb (dynamic pass data)
}
```

### Card Type to Database Mapping

**Card Type Enum** (from constants):
- `stamp` - Stamp card (buy N, get 1 free)
- `points` - Points accumulation card
- `discount` - Progressive discount card
- `coupon` - One-time use coupon
- `membership` - Membership/subscription card
- `multipass` - Prepaid visit card
- `cash_back` - Cashback percentage card
- `certificate` - Gift certificate card

**Database Mapping Strategy**:

1. **passTemplates.type** should map to card type:
   - Current enum: `passTypeEnum` ('loyalty', 'coupon', 'eventTicket', 'boardingPass', 'generic')
   - Required: Add card type enum or use `settings` JSONB to store card type
   - Recommendation: Extend `passTypeEnum` or add `cardType` field

2. **passTemplates.design** (JSONB) should contain:
   ```json
   {
     "cardType": "stamp" | "points" | "discount" | ...,
     "colors": { "background": "...", "foreground": "...", "accent": "..." },
     "assets": { "logo": "...", "icon": "...", "strip": "..." },
     "layout": "generic" | "storeCard"
   }
   ```

3. **passTemplates.settings** (JSONB) should contain:
   ```json
   {
     "stampCount": 10,           // For stamp cards
     "pointsRate": 1,             // For points cards
     "discountTiers": [5, 10, 15], // For discount cards
     "expirationDays": 365,       // Optional
     "rewardThreshold": 10        // Card-specific
   }
   ```

4. **userPasses.metadata** (JSONB) should contain dynamic data:
   ```json
   {
     "stampCount": 2,            // Current stamps
     "pointsBalance": 105,        // Current points
     "discountTier": "Bronze",    // Current tier
     "rewardsCollected": 0,      // Lifetime rewards
     "lastUpdated": "2024-01-15"  // Last transaction
   }
   ```

### Database Schema Recommendations

**Option 1: Extend Current Schema** (Recommended)
- Add `cardType` text field to `passTemplates` table
- Keep `type` as passTypeEnum for Apple Wallet compatibility
- Use `design` JSONB for visual configuration
- Use `settings` JSONB for card-type-specific rules
- Use `userPasses.metadata` for dynamic user data

**Option 2: New Card Types Table**
- Create `cardTypes` table with predefined configurations
- Reference from `passTemplates`
- More normalized but adds complexity

**Recommendation**: Option 1 - Extend current schema with `cardType` field and use JSONB for flexibility.

---

## Template System Design

### Template Types

**1. Quick Start Templates** (Pre-designed)
- Pre-configured designs for each card type
- Business selects template and customizes
- Fast onboarding (5 minutes)
- Templates stored in codebase (`modules/pass-generation/templates.ts`)

**2. From Scratch Templates** (Custom)
- Business creates fully custom design
- Uploads all assets
- Configures all settings manually
- Full control but slower (30+ minutes)

### Template Structure per Card Type

**Stamp Card Template**:
```typescript
{
  cardType: 'stamp',
  design: {
    backgroundColor: 'rgb(89, 52, 28)',
    foregroundColor: 'rgb(255, 255, 255)',
    stripImage: 'url',
    logo: 'url',
    icon: 'url'
  },
  settings: {
    stampCount: 10,
    rewardThreshold: 10,
    rewardDescription: 'Free item'
  },
  passStructure: {
    headerFields: [{ key: 'stamps', label: 'STAMPS', value: '${stampCount}/10' }],
    primaryFields: [{ key: 'reward', label: 'REWARD STATUS', value: '...' }],
    secondaryFields: [{ key: 'progress', label: 'STAMPS UNTIL REWARD', value: '...' }],
    auxiliaryFields: [{ key: 'collected', label: 'REWARDS COLLECTED', value: '...' }]
  }
}
```

**Points Card Template**:
```typescript
{
  cardType: 'points',
  design: { /* colors, assets */ },
  settings: {
    pointsRate: 1, // £1 = 1 point
    rewardThresholds: [100, 250, 500],
    rewardCatalog: [...]
  },
  passStructure: {
    headerFields: [{ key: 'points', label: 'POINTS', value: '${pointsBalance}' }],
    primaryFields: [{ key: 'earn', label: 'Earn rewards', value: '£1 = ${pointsRate} points' }],
    secondaryFields: [{ key: 'next', label: 'NEXT REWARD', value: 'After ${nextThreshold} points' }]
  }
}
```

**Discount Card Template**:
```typescript
{
  cardType: 'discount',
  design: { /* colors, assets */ },
  settings: {
    discountTiers: [
      { visits: 5, discount: 5 },
      { visits: 10, discount: 10 },
      { visits: 20, discount: 15 }
    ]
  },
  passStructure: {
    headerFields: [{ key: 'discount', label: 'DISCOUNT', value: '${currentDiscount}%' }],
    primaryFields: [{ key: 'status', label: 'DISCOUNT STATUS', value: '${tier}' }],
    auxiliaryFields: [{ key: 'visits', label: 'VISITS', value: '${visitCount}' }]
  }
}
```

### Template Selection Flow

1. **Business selects card type** (stamp, points, discount, etc.)
2. **System shows template options**:
   - Quick Start: Pre-designed templates (Coffee Classic, Modern Minimal, etc.)
   - From Scratch: Blank template with default settings
3. **Business customizes**:
   - Quick Start: Modify colors, upload logo, adjust settings
   - From Scratch: Configure everything from scratch
4. **System generates pass template** and stores in `passTemplates` table
5. **Template ready for customer registration**

### Template Storage

**Quick Start Templates**: Stored in codebase
- Location: `modules/pass-generation/templates.ts`
- Pre-defined designs with default assets
- Can be overridden by business uploads

**Custom Templates**: Stored in database
- Location: `passTemplates` table
- Business-specific designs
- Fully customizable

---

## WebService Implementation Strategy

### Purpose of webServiceURL

**Sole Purpose**: Enable pass updates via Apple Wallet push notifications.

**How It Works**:
1. Pass includes `webServiceURL` and `authenticationToken` in pass.json
2. Apple Wallet registers pass with web service
3. When pass data changes, system sends push notification
4. Apple Wallet requests updated pass from web service
5. System returns updated pass.json with new data

### Update Flow (Scanner App Driven)

**Current Flow** (Without webServiceURL):
1. Scanner app scans QR code
2. Scanner app fetches user data from database
3. Scanner app updates database (stamps, points, etc.)
4. Pass in Wallet is stale until user manually refreshes

**Future Flow** (With webServiceURL):
1. Scanner app scans QR code
2. Scanner app fetches user data from database
3. Scanner app updates database (stamps, points, etc.)
4. Scanner app triggers pass update via API
5. System sends push notification to Apple Wallet
6. Apple Wallet automatically fetches updated pass
7. Pass updates in Wallet without user action

### Implementation Requirements

**HTTPS Required**: Apple Wallet rejects HTTP URLs for webServiceURL. Must deploy with HTTPS.

**API Endpoints Required**:
- `GET /api/passes/v1/devices/{deviceLibraryIdentifier}/registrations/{passTypeIdentifier}` - Get registered passes
- `GET /api/passes/v1/passes/{passTypeIdentifier}/{serialNumber}` - Get updated pass
- `POST /api/passes/v1/log` - Log pass updates (optional)

**Authentication**: Use `authenticationToken` from pass.json for secure updates.

**When to Implement**: After HTTPS deployment. Not required for MVP functionality (scanner app works without it).

---

## Conclusion & Final Verdict

### Is Generic Pass Type Enough?

**Answer**: ❌ **NO - StoreCard Type is REQUIRED** ✅ **IMPLEMENTED**

**Based on Design Analysis**:
- ❌ **All 8 card designs require strip images** - Generic cannot support ✅ **FIXED** - Strip images now included
- ❌ **All designs show header fields** - Generic doesn't have headerFields ✅ **FIXED** - headerFields implemented
- ❌ **All designs show status/tier info** - Generic cannot organize properly ✅ **FIXED** - auxiliaryFields implemented
- ❌ **Visual differentiation required** - Generic makes all cards identical ✅ **FIXED** - Card type mappers implemented

**Based on PRD Requirements**:
- ❌ **8 card types need different layouts** - Generic cannot differentiate ✅ **FIXED** - All 8 card types supported
- ❌ **Rich visual customization required** - Generic is too limited ✅ **FIXED** - StoreCard with full customization
- ❌ **Professional appearance needed** - Generic looks too basic ✅ **FIXED** - StoreCard provides professional appearance

### What Needs to Change?

#### ✅ NO Change Required:
1. **passTypeIdentifier** - Keep `pass.com.dopecard.passmaker` (same for both types)
2. **teamIdentifier** - Keep `DTWNQT4JQL` (same for both types)
3. **Certificates** - Same P12, WWDR, Private Key (work for both types)
4. **Asset URLs** - Already fetching all required assets

#### ✅ Changes Required:
1. **JSON Structure** - Change `generic` → `storeCard` in pass.json
2. **Field Organization** - Add headerFields, auxiliaryFields, backFields
3. **PKPass Assets** - Include strip images (already fetching, just need to add)
4. **Card Type Mapping** - Create field structures for each of 8 card types

### Recommended Path Forward

#### Immediate Action (MVP):
1. ✅ **Switch to StoreCard** - Change JSON structure from generic to storeCard
2. ✅ **Add all field types** - headerFields, auxiliaryFields, backFields
3. ✅ **Include strip images** - Uncomment strip.png assets in PKPass
4. ✅ **Map card types** - Create field structures for Stamp, Points, Discount, etc.
5. ✅ **Map form data** - Use test-card form inputs to populate fields
6. ✅ **Test each card type** - Verify all 8 types work correctly

#### Why This Approach:
- ✅ **Meets all design requirements** - Matches inspiration images
- ✅ **No certificate changes** - Same Apple identifier works
- ✅ **Assets already available** - Just need to include them
- ✅ **Future-proof** - StoreCard supports all planned features
- ✅ **Professional appearance** - Matches competitor designs

### Final Verdict

**StoreCard pass type is REQUIRED** to match the card design images and PRD requirements. ✅ **IMPLEMENTED**

**Key Insight**: The same `passTypeIdentifier` can be used - **only the JSON structure needs to change**. This makes the migration straightforward:

1. ✅ Change `generic` → `storeCard` in pass.json - **COMPLETED**
2. ✅ Add headerFields, auxiliaryFields, backFields - **COMPLETED**
3. ✅ Include strip images in PKPass instance - **COMPLETED**
4. ✅ Map card types to field structures - **COMPLETED**

**No Apple Developer account changes needed** - the certificate and identifier work for both pass types.

**Implementation Status**: ✅ **MIGRATION COMPLETE**

### Implementation Summary

**Completed Changes**:
1. ✅ Database schema extended with `cardType` field in `passTemplates` table
2. ✅ Card type mappers created (`modules/pass-generation/card-type-mappers.ts`)
3. ✅ Apple Wallet pass generation migrated to `storeCard` with all 8 card types
4. ✅ Google Wallet pass generation updated to support all card types
5. ✅ PWA generator created for Android fallback (`modules/pass-generation/pwa-generator.ts`)
6. ✅ Test-card form updated to support all 8 card types
7. ✅ Pass generation router updated to handle all card types
8. ✅ Card creation router updated to save cardType to database
9. ✅ Constants updated with all card types (including REWARD and GIFT)

**Platform Support**:
- ✅ Apple Wallet: `storeCard` pass type for all card types
- ✅ Google Wallet: `loyaltyObject` with card-type-specific fields
- ✅ PWA: Web-based fallback for Android without Google Wallet

**Backward Compatibility**: ✅ Maintained - Existing test-card functionality preserved

