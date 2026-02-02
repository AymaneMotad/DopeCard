# DopeCard - Complete Project Documentation

> **Last Updated:** February 2, 2026  
> **Status:** Apple Wallet integration fully working ✅

## Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Database Schema](#database-schema)
4. [Apple Wallet Integration](#apple-wallet-integration)
5. [Apple Developer Setup](#apple-developer-setup)
6. [API Endpoints](#api-endpoints)
7. [Environment Variables](#environment-variables)
8. [Pass Update Flow](#pass-update-flow)
9. [Key Files Reference](#key-files-reference)
10. [Troubleshooting](#troubleshooting)

---

## Project Overview

DopeCard is a digital loyalty card platform that allows businesses to create and manage loyalty programs via Apple Wallet and Google Pay.

### Core Features

- **Card Types:** Stamp, Points, Discount, Cashback, Membership, Coupon, Reward, Gift, Multipass
- **Platforms:** Apple Wallet (PassKit), Google Pay (JWT-based)
- **Real-time Updates:** Push notifications trigger wallet updates
- **QR Scanner:** Admin dashboard for scanning and updating customer passes

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React, Tailwind CSS, shadcn/ui |
| Backend | Next.js API Routes, tRPC |
| Database | PostgreSQL (Neon), Drizzle ORM |
| Auth | NextAuth.js |
| File Storage | UploadThing |
| Push Notifications | APNS (Apple), FCM (Google) |
| Message Queue | Upstash QStash |
| Caching | Upstash Redis |
| Pass Generation | passkit-generator |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  Admin Dashboard    │  Scanner App    │  Customer Registration   │
│  /admin/*           │  /scanner       │  /register/{cardId}      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API LAYER (tRPC)                          │
├─────────────────────────────────────────────────────────────────┤
│  cardsRouter     │  customersRouter  │  scannerRouter           │
│  passesRouter    │  notificationsRouter  │  usersRouter         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLE WALLET API LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  /api/passes/v1/devices/{deviceId}/registrations/{passType}     │
│  /api/passes/v1/devices/{deviceId}/registrations/{passType}/{serial} │
│  /api/passes/v1/passes/{passType}/{serial}                      │
│  /api/passes/v1/log                                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL (Neon)  │  Upstash Redis  │  UploadThing (Assets)   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   EXTERNAL SERVICES                              │
├─────────────────────────────────────────────────────────────────┤
│  Apple APNS         │  Google FCM     │  Upstash QStash         │
│  (Push to Wallet)   │  (Android Push) │  (Message Queue)        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Database Schema

### Entity Relationship

```
users (1) ──────── (1) customer
  │                      │
  │                      └── businessId → business
  │
  ├── role: admin | commercial | business | manager | customer
  │
  └── (1) ──────── (many) userPasses
                            │
                            ├── (many) passRegistrations (device tokens)
                            │
                            └── (many) passUpdates (change history)

business (1) ──────── (many) passTemplates
```

### Tables

#### `users`
Core authentication table with role-based access.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role role_enum NOT NULL, -- admin, commercial, business, manager, customer
  email TEXT NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  password TEXT,
  phone_number TEXT UNIQUE,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `business`
Business accounts that create loyalty cards.

```sql
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  commercial_agent_id UUID REFERENCES commercial_agents(id),
  business_name TEXT NOT NULL,
  business_type TEXT,
  subscription_pack subscription_pack_enum NOT NULL, -- basic, premium, enterprise
  max_managers INTEGER DEFAULT 1,
  active BOOLEAN DEFAULT true,
  settings JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `customer`
End-users who receive loyalty cards.

```sql
CREATE TABLE customer (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) UNIQUE,
  email TEXT NOT NULL UNIQUE,
  phone_number TEXT UNIQUE,
  username TEXT NOT NULL UNIQUE,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES customer(id),
  business_id UUID REFERENCES businesses(id), -- Links customer to issuing business
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `passTemplates`
Card templates created by businesses.

```sql
CREATE TABLE pass_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES businesses(id),
  name TEXT NOT NULL,
  type pass_type_enum NOT NULL, -- loyalty, coupon, eventTicket, boardingPass, generic
  card_type TEXT, -- stamp, points, discount, cashback, etc.
  design JSONB NOT NULL, -- Colors, images, layout
  settings JSONB, -- stampCount, initialStamps, pointsRate, etc.
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `userPasses`
Actual passes issued to customers.

```sql
CREATE TABLE user_passes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  template_id UUID REFERENCES pass_templates(id),
  serial_number TEXT NOT NULL UNIQUE, -- e.g., COFFEEe9eefaa2-7512-49d9-8eac-b9a0525cd060
  status TEXT DEFAULT 'active',
  metadata JSONB, -- stampCount, rewards, lastUpdated, etc.
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `passRegistrations`
Device registrations for push notifications.

```sql
CREATE TABLE pass_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID REFERENCES user_passes(id),
  push_token TEXT NOT NULL, -- 64-char hex token from Apple
  device_library_identifier TEXT NOT NULL, -- Device ID from Apple
  platform platform_enum NOT NULL, -- ios, android
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### `passUpdates`
History of pass changes (triggers wallet updates).

```sql
CREATE TABLE pass_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pass_id UUID REFERENCES user_passes(id),
  metadata JSONB NOT NULL, -- Snapshot of changes
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Apple Wallet Integration

### How Apple Wallet Updates Work

Apple Wallet uses a **pull-based** update mechanism:

1. **Empty Push Notification** → Tells device "check for updates"
2. **Device Calls Server** → Asks "which passes have updates?"
3. **Server Returns Serial Numbers** → List of updated passes
4. **Device Downloads Passes** → Fetches new `.pkpass` files

### PassKit Web Service Protocol

Apple requires these endpoints at `{webServiceURL}/v1/`:

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/devices/{deviceId}/registrations/{passType}/{serial}` | Register device |
| DELETE | `/devices/{deviceId}/registrations/{passType}/{serial}` | Unregister device |
| GET | `/devices/{deviceId}/registrations/{passType}` | Get updated pass list |
| GET | `/passes/{passType}/{serial}` | Download updated pass |
| POST | `/log` | Receive error logs from Apple |

### Key Implementation Details

#### webServiceURL Configuration

```javascript
// In pass.json - webServiceURL should NOT include /v1
// Apple automatically appends /v1 to all requests
{
  "webServiceURL": "https://your-domain.com/api/passes",  // ✅ Correct
  "webServiceURL": "https://your-domain.com/api/passes/v1",  // ❌ Wrong (causes /v1/v1)
  "authenticationToken": "your-secure-token"
}
```

#### Push Notification Format (CRITICAL)

For Apple Wallet, push notifications must be **EMPTY**:

```javascript
// ✅ Correct - Empty push for Wallet
const note = new apn.Notification();
note.topic = 'pass.com.dopecard.passmaker';  // Pass Type ID
note.payload = {};  // Empty!
note.pushType = 'background';
// NO alert, NO badge, NO sound

// ❌ Wrong - Regular push notification
note.alert = { title: 'Update', body: 'Your card updated' };
note.badge = 1;
```

#### APNS Environment

Push tokens can be for **sandbox** or **production** depending on how the pass was installed:

- **Sandbox**: Passes installed during development (via Safari, direct download)
- **Production**: Passes from App Store apps, sometimes development passes

Our implementation tries both environments:

```javascript
// Try sandbox first, then production
const sandboxResult = await apnsSandbox.send(note, token);
if (sandboxResult.failed) {
  const productionResult = await apnsProduction.send(note, token);
}
```

---

## Apple Developer Setup

### Required Certificates & Keys

| Item | Purpose | Location in Portal |
|------|---------|-------------------|
| Pass Type ID | Identifier for your passes | Certificates, IDs & Profiles → Identifiers → Pass Type IDs |
| Pass Signing Certificate | Signs .pkpass files | Certificates → Pass Type ID Certificate |
| APNS Key (.p8) | Authenticates push notifications | Keys → Create Key → Enable APNs |
| Team ID | Your Apple Developer Team ID | Membership → Team ID |

### Step-by-Step Setup

#### 1. Create Pass Type ID

1. Go to [Apple Developer Portal](https://developer.apple.com/account/resources/identifiers/list/passTypeId)
2. Click "+" → "Pass Type IDs"
3. Enter: `pass.com.dopecard.passmaker`
4. Register

#### 2. Create Pass Signing Certificate

1. Go to Certificates → "+" → "Pass Type ID Certificate"
2. Select your Pass Type ID
3. Create CSR on your Mac (Keychain Access → Certificate Assistant → Request Certificate)
4. Upload CSR, download certificate
5. Export as .p12 from Keychain

#### 3. Create APNS Key

1. Go to Keys → "+" 
2. Name: "DopeCard APNS Key"
3. Enable "Apple Push Notifications service (APNs)"
4. Register and download `.p8` file
5. Note the **Key ID** (e.g., `2ALDJ2F9G3`)

#### 4. Get Team ID

1. Go to Membership
2. Copy your **Team ID** (e.g., `DTWNQT4JQL`)

### Certificate Files Structure

```
/certs
├── pass.p12              # Pass signing certificate (uploaded to UploadThing)
├── AppleWWDRCA.cer       # Apple WWDR certificate (uploaded to UploadThing)
└── AuthKey_XXXXXX.p8     # APNS key (stored in .env)
```

---

## API Endpoints

### tRPC Routers

#### Cards Router (`/api/trpc/cards.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `cards.create` | Mutation | Create new card template |
| `cards.update` | Mutation | Update card template |
| `cards.getById` | Query | Get card by ID |
| `cards.getByIdPublic` | Query | Get card (public, no auth) |
| `cards.getAll` | Query | List all cards for business |

#### Scanner Router (`/api/trpc/scanner.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `scanner.scanQR` | Mutation | Process QR code scan |
| `scanner.lookupCustomer` | Query | Find customer by query |
| `scanner.addStamps` | Mutation | Add stamps to pass |
| `scanner.redeemReward` | Mutation | Redeem reward |

#### Notifications Router (`/api/trpc/notifications.*`)

| Procedure | Type | Description |
|-----------|------|-------------|
| `notifications.sendManual` | Mutation | Send via QStash (production) |
| `notifications.testDirect` | Mutation | Send directly (testing) |
| `notifications.sendToAll` | Mutation | Broadcast to all customers |

### Apple Wallet Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/api/passes/v1/devices/{deviceId}/registrations/{passType}/{serial}` | POST | Yes (ApplePass) | Register device |
| `/api/passes/v1/devices/{deviceId}/registrations/{passType}/{serial}` | DELETE | Yes (ApplePass) | Unregister device |
| `/api/passes/v1/devices/{deviceId}/registrations/{passType}` | GET | No | Get updated passes |
| `/api/passes/v1/passes/{passType}/{serial}` | GET | Yes (ApplePass) | Download pass |
| `/api/passes/v1/log` | POST | No | Receive logs |

---

## Environment Variables

### Required Variables

```bash
# Database
DATABASE_URL=postgresql://user:pass@host/db

# NextAuth
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com

# App URLs (must match for Apple Wallet)
APP_URL=https://your-domain.com
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Apple Wallet
PASS_AUTH_TOKEN=secure-random-token  # Token for Apple Wallet auth
ENABLE_WEB_SERVICE_URL=true  # Enable device registration

# APNS (Apple Push Notifications)
APNS_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
APNS_KEY_ID=2ALDJ2F9G3  # From Apple Developer Portal
APPLE_TEAM_ID=DTWNQT4JQL  # Your Team ID
APNS_TOPIC=pass.com.dopecard.passmaker  # Pass Type ID

# Certificate URLs (hosted on UploadThing)
APPLE_CERT_URL=https://utfs.io/f/...
WWDR_CERT_URL=https://utfs.io/f/...
PRIVATE_KEY_URL=https://utfs.io/f/...

# QStash (Message Queue)
QSTASH_URL=https://qstash.upstash.io
QSTASH_TOKEN=your-token
QSTASH_CURRENT_SIGNING_KEY=sig_xxx
QSTASH_NEXT_SIGNING_KEY=sig_xxx

# Redis (Optional - Caching)
UPSTASH_REDIS_REST_URL=https://xxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxx

# UploadThing (File Storage)
UPLOADTHING_TOKEN=xxx

# Google Wallet (Optional)
SERVICE_ACCOUNT_PROJECT_ID=your-project
SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."
SERVICE_ACCOUNT_CLIENT_EMAIL=xxx@xxx.iam.gserviceaccount.com

# FCM (Firebase - Android Push)
FCM_CREDENTIALS='{"type":"service_account",...}'
```

### Development with ngrok

When developing locally, use ngrok for HTTPS:

```bash
# Start ngrok
ngrok http 3000

# Update .env.local with ngrok URL
APP_URL=https://xxxx.ngrok-free.app
NEXT_PUBLIC_APP_URL=https://xxxx.ngrok-free.app
NEXTAUTH_URL=https://xxxx.ngrok-free.app
```

**Important:** If you have both `.env` and `.env.local`, the `.env.local` values take precedence!

---

## Pass Update Flow

### Complete Flow Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PASS UPDATE FLOW                                  │
└──────────────────────────────────────────────────────────────────────────┘

1. ADMIN ADDS STAMP
   ┌─────────────┐
   │   Scanner   │ ──► POST /api/trpc/scanner.addStamps
   │   Dashboard │
   └─────────────┘
         │
         ▼
2. SERVER UPDATES DATABASE
   ┌─────────────────────────────────────────────────────┐
   │ a) UPDATE userPasses SET metadata = {...new stamps} │
   │ b) INSERT INTO passUpdates (passId, metadata)       │ ◄── Marks pass as updated
   │ c) Enqueue notification to QStash                   │
   └─────────────────────────────────────────────────────┘
         │
         ▼
3. QSTASH PROCESSES NOTIFICATION
   ┌─────────────────────────────────────────────────────┐
   │ QStash calls POST /api/qstash-worker                │
   │ Worker sends EMPTY push to APNS (production)        │
   └─────────────────────────────────────────────────────┘
         │
         ▼
4. APPLE DELIVERS PUSH TO DEVICE
   ┌─────────────────────────────────────────────────────┐
   │ iPhone receives silent push                         │
   │ Wallet app wakes up to check for updates            │
   └─────────────────────────────────────────────────────┘
         │
         ▼
5. DEVICE ASKS "WHAT'S UPDATED?"
   ┌─────────────────────────────────────────────────────┐
   │ GET /api/passes/v1/devices/{deviceId}/registrations │
   │     /pass.com.dopecard.passmaker                    │
   │                                                     │
   │ Server queries passUpdates table                    │
   │ Returns: { serialNumbers: ["COFFEExxxx..."] }       │
   └─────────────────────────────────────────────────────┘
         │
         ▼
6. DEVICE DOWNLOADS UPDATED PASS
   ┌─────────────────────────────────────────────────────┐
   │ GET /api/passes/v1/passes/pass.com.dopecard...     │
   │     /COFFEExxxx...                                  │
   │                                                     │
   │ Server regenerates .pkpass with new stamp count     │
   │ Returns: application/vnd.apple.pkpass               │
   └─────────────────────────────────────────────────────┘
         │
         ▼
7. WALLET UPDATES PASS
   ┌─────────────────────────────────────────────────────┐
   │ iPhone Wallet shows updated pass                    │
   │ Visual: ● ○ ○ ○ ○ ○ ○ (1 stamp collected!)         │
   └─────────────────────────────────────────────────────┘
```

### Timing

| Step | Typical Duration |
|------|------------------|
| Scanner to QStash | < 500ms |
| QStash to APNS | 1-3 seconds |
| APNS to Device | 0-30 seconds (depends on network) |
| Device to Server | < 1 second |
| Pass regeneration | 5-8 seconds |
| **Total** | **~10-40 seconds** |

---

## Key Files Reference

### Pass Generation

| File | Purpose |
|------|---------|
| `app/utils/pass-generation/pass-generation.ts` | Main pass generation logic |
| `modules/pass-generation/templates.ts` | Pass template definitions |
| `modules/pass-generation/card-templates.ts` | Card-specific templates |

### Apple Wallet API

| File | Purpose |
|------|---------|
| `app/api/passes/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]/[serialNumber]/route.ts` | Device registration |
| `app/api/passes/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]/route.ts` | Get updated passes |
| `app/api/passes/v1/passes/[passTypeIdentifier]/[serialNumber]/route.ts` | Download pass |
| `app/api/passes/v1/log/route.ts` | Receive Apple logs |

### Push Notifications

| File | Purpose |
|------|---------|
| `lib/apns.ts` | APNS client (sandbox + production) |
| `lib/fcm.ts` | FCM client (Android) |
| `lib/qstash.ts` | QStash queue client |
| `app/api/qstash-worker/route.ts` | Process queued notifications |

### Database

| File | Purpose |
|------|---------|
| `db/schema.ts` | Drizzle schema definitions |
| `db/drizzle.ts` | Database client |
| `drizzle/` | Migration files |

---

## Troubleshooting

### Common Issues

#### 1. "BadDeviceToken" Error

**Cause:** Push token environment mismatch

**Solution:** Our code now tries both sandbox and production:
```
🌍 Trying SANDBOX environment...
⚠️ Sandbox failed: BadDeviceToken
🌍 Trying PRODUCTION environment...
✅ Wallet push sent successfully via PRODUCTION!
```

#### 2. "401 Unauthorized" on Registration

**Cause:** Missing or incorrect `Authorization: ApplePass {token}` header

**Solution:** Verify `PASS_AUTH_TOKEN` matches in:
- `.env` file
- Pass generation (`authenticationToken` in pass.json)

#### 3. "404 Not Found" with `/v1/v1/` in path

**Cause:** `webServiceURL` incorrectly includes `/v1`

**Solution:** Use `https://domain.com/api/passes` NOT `https://domain.com/api/passes/v1`

#### 4. "204 No Content" but pass should update

**Cause:** No record in `passUpdates` table

**Solution:** Ensure `scanner.addStamps` creates passUpdates record

#### 5. ngrok URL not updating

**Cause:** `.env.local` overriding `.env`

**Solution:** Update URLs in BOTH files, or delete `.env.local`

### Debug Endpoints

| Endpoint | Purpose |
|----------|---------|
| `/api/debug/config` | Check environment variable configuration |

### Useful Logs to Watch

```bash
# Pass generation
📍 Base URL (webServiceURL): https://xxx.ngrok-free.app
🌐 WebService URL: https://xxx.ngrok-free.app/api/passes

# Device registration
✅ ✅ ✅ REGISTRATION SUCCESSFUL ✅ ✅ ✅
📱 Device is now registered for push notifications!

# Push notification
✅ Wallet push sent successfully via PRODUCTION!

# Pass update check
📋 Updated passes to return: [ 'COFFEExxxx...' ]

# Pass download
GET /api/passes/v1/passes/pass.com.dopecard.passmaker/COFFEExxxx... 200
```

---

## Next Steps & Future Improvements

### Recommended Additions

1. **Soft Deletes** - Add `deletedAt` column for audit trails
2. **Template Versioning** - Track changes to pass templates
3. **Analytics Dashboard** - Track scans, redemptions, engagement
4. **Batch Notifications** - Send to multiple devices efficiently
5. **Pass Personalization** - Custom fields per customer
6. **Google Wallet** - Complete Google Pay integration

### Performance Optimizations

1. Add database indexes on frequently queried columns
2. Implement Redis caching for pass templates
3. Use CDN for pass assets
4. Consider edge deployment for Apple Wallet endpoints

---

## Support

For issues or questions:
1. Check this documentation first
2. Review the troubleshooting section
3. Check Apple's [PassKit documentation](https://developer.apple.com/documentation/walletpasses)
4. Review server logs for detailed error messages
