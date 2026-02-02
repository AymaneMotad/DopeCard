# WebService Callback Debug Analysis

## Issue Summary
User generates a pass on `/test-card` with ngrok HTTPS configured, but:
- ❌ No device registration callbacks received
- ❌ Scanner shows "⚠️ No devices registered"
- ✅ ENABLE_WEB_SERVICE_URL=true
- ✅ PASS_AUTH_TOKEN set
- ✅ APP_URL=https://df7221dc4a07.ngrok-free.app

## Root Causes Identified

### 🔴 CRITICAL ISSUE #1: Pass Not Created in Database
**Location**: `server/routers/passesRouter.ts` - `generateTestPass` mutation

**Problem**: The test pass endpoint generates a .pkpass file but **NEVER creates a record in the database**. When Apple Wallet tries to register the device:
1. Apple Wallet adds pass → sends registration request
2. Registration endpoint looks for pass by serialNumber
3. Pass not found in database → 404 error
4. No device registration created

**Code Analysis**:
```typescript
// server/routers/passesRouter.ts - Line ~130
generateTestPass: adminProcedure
  .input(...)
  .mutation(async ({ input, ctx }) => {
    // ❌ Generates pass buffer but doesn't create DB record
    const passBuffer = await generatePass(userId, ...);
    return { buffer: base64Pass, mimeType: "..." };
    // Missing: await db.insert(userPasses).values({...})
  })
```

### 🔴 CRITICAL ISSUE #2: SerialNumber Mismatch
**Location**: `app/utils/pass-generation/pass-generation.ts` - Line 239

**Current Code**:
```typescript
serialNumber: `COFFEE${userId}`,
```

**Problem**: Test pass uses a random UUID for `userId`, but there's no corresponding user in the database. Even if we create the pass record, the serialNumber won't match any real user.

### 🟡 ISSUE #3: No Pass-User Relationship
**Problem**: Test passes generate with random UUIDs that don't correspond to actual users in the database. The registration endpoint expects to find:
- Pass record with matching serialNumber
- User record linked to that pass
- But test passes are orphaned (no user relationship)

### 🟡 ISSUE #4: NEXT_PUBLIC_APP_URL Not Used Properly
**Location**: `app/utils/pass-generation/pass-generation.ts` - Line 225

**Current Code**:
```typescript
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
```

**Problem**: This runs on the server side where `NEXT_PUBLIC_APP_URL` might not be properly exposed. The inconsistency between `NEXT_PUBLIC_APP_URL`, `APP_URL`, and `NEXT_PUBLIC_BASE_URL` causes confusion.

## Complete Fix Strategy

### Fix #1: Create Pass Record in Database
Modify `generateTestPass` to create a database record:

```typescript
// server/routers/passesRouter.ts
generateTestPass: adminProcedure
  .mutation(async ({ input, ctx }) => {
    // ... existing code ...
    
    // Generate pass buffer
    const passBuffer = await generatePass(userId, stampCount, input.cardType, cardData);
    
    // 🆕 CREATE DATABASE RECORD
    const serialNumber = `COFFEE${userId}`;
    await ctx.db.insert(userPasses).values({
      id: uuidv4(),
      userId: userId, // The generated UUID
      serialNumber: serialNumber,
      passType: 'loyalty',
      stampCount: input.initialStamps || 0,
      cardType: input.cardType,
      status: 'active',
      platform: detectedPlatform === 'ios' ? 'ios' : 'android',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    console.log('✅ Test pass record created:', { userId, serialNumber });
    
    return { buffer: base64Pass, mimeType: "application/vnd.apple.pkpass" };
  })
```

### Fix #2: Create Test User Record
Since test passes need a user, create a test user:

```typescript
// Option A: Check if user exists, create if not
const existingUser = await ctx.db.query.users.findFirst({
  where: eq(users.id, userId)
});

if (!existingUser) {
  await ctx.db.insert(users).values({
    id: userId,
    username: `Test User ${userId.slice(0, 8)}`,
    email: `test-${userId.slice(0, 8)}@dopecard.test`,
    phoneNumber: `+1555${Math.random().toString().slice(2, 9)}`,
    password: 'N/A', // Test user doesn't need login
    role: 'user',
    createdAt: new Date(),
  });
  console.log('✅ Test user created:', userId);
}
```

### Fix #3: Standardize Environment Variables
Use consistent env var naming:

```typescript
// app/utils/pass-generation/pass-generation.ts
const baseUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
```

**Reason**: `APP_URL` is server-side only, `NEXT_PUBLIC_APP_URL` is exposed to client. For server-side code (pass generation), use `APP_URL` first.

### Fix #4: Add Better Logging
Add comprehensive logging to track the registration flow:

```typescript
// app/utils/pass-generation/pass-generation.ts - Line ~270
console.log('📝 Pass JSON configuration:', {
  serialNumber: passJson.serialNumber,
  webServiceURL: passJson.webServiceURL,
  authenticationToken: passJson.authenticationToken ? '***set***' : 'MISSING',
  passTypeIdentifier: passJson.passTypeIdentifier,
});

if (passJson.webServiceURL) {
  console.log('✅ webServiceURL ENABLED - Device registration will work');
  console.log('   Devices will register at:', `${passJson.webServiceURL}/devices/{deviceId}/registrations/{passType}/{serialNumber}`);
} else {
  console.log('⚠️ webServiceURL DISABLED - No device registration possible');
}
```

### Fix #5: Verify Registration Endpoint Works
Test the registration endpoint directly:

```bash
# Test registration endpoint (simulating Apple Wallet)
curl -X POST "https://df7221dc4a07.ngrok-free.app/api/passes/v1/devices/TEST_DEVICE/registrations/pass.com.dopecard.passmaker/COFFEE{test-user-id}" \
  -H "Authorization: ApplePass secure-pass-token-319609b9-840e-460f-bad0-fa7a79a2" \
  -H "Content-Type: application/json" \
  -d '"test-push-token"'
```

Expected response: `201 Created` (if pass exists in DB)

## Implementation Steps

### Step 1: Update Database Schema (if needed)
Check if `userPasses` table has all required fields:
- `id` (UUID)
- `userId` (UUID, references users)
- `serialNumber` (String, unique)
- `passType` (String)
- `stampCount` (Int)
- `cardType` (String)
- `status` (String)
- `platform` (String)

### Step 2: Modify generateTestPass Endpoint
File: `server/routers/passesRouter.ts`

Add database record creation after pass generation (see Fix #1)

### Step 3: Create Test User
File: `server/routers/passesRouter.ts`

Add user creation before pass generation (see Fix #2)

### Step 4: Update Environment Variable Usage
File: `app/utils/pass-generation/pass-generation.ts`

Change line 225 to use `APP_URL` first

### Step 5: Add Comprehensive Logging
Files:
- `app/utils/pass-generation/pass-generation.ts`
- `app/api/passes/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]/[serialNumber]/route.ts`

Add detailed logs to track the full flow

### Step 6: Test the Full Flow
1. Generate test pass on `/test-card`
2. Check server logs for:
   - `✅ Test user created`
   - `✅ Test pass record created`
   - `✅ webServiceURL ENABLED`
3. Download pass, add to Apple Wallet
4. Check for registration callback in server logs:
   - `[Pass Registration] Looking for pass with serialNumber: COFFEE{uuid}`
   - `[Pass Registration] Found pass: {...}`
   - `[Pass Registration] ✅ Registration created and verified`
5. Open scanner, search for test user
6. Should see "Devices registered: 1"

## Verification Checklist

After implementing fixes:

- [ ] Test pass creates user record in database
- [ ] Test pass creates pass record in database
- [ ] Pass serialNumber matches database record
- [ ] webServiceURL is included in pass.json
- [ ] authenticationToken is included in pass.json
- [ ] Pass downloads successfully
- [ ] Adding to Apple Wallet triggers registration callback
- [ ] Registration creates device record in database
- [ ] Scanner shows "1 device(s) registered"
- [ ] Sending notification works

## Current Environment Status

```bash
✅ ENABLE_WEB_SERVICE_URL=true
✅ PASS_AUTH_TOKEN=secure-pass-token-319609b9-840e-460f-bad0-fa7a79a2
✅ APP_URL=https://df7221dc4a07.ngrok-free.app
✅ NEXT_PUBLIC_APP_URL=https://df7221dc4a07.ngrok-free.app
```

## Why It's Not Working Now

**Current Flow**:
1. User generates test pass → ✅ Pass file created
2. Pass includes webServiceURL → ✅ Correct
3. User adds to Apple Wallet → ✅ Pass added
4. Apple Wallet sends registration request → ✅ Request sent
5. **Registration endpoint looks for pass → ❌ NOT FOUND (no DB record)**
6. **Returns 404 → ❌ No device registered**
7. Scanner shows 0 devices → ❌ Expected behavior

**After Fix**:
1. User generates test pass → ✅ Pass file created + DB record created
2. Pass includes webServiceURL → ✅ Correct
3. User adds to Apple Wallet → ✅ Pass added
4. Apple Wallet sends registration request → ✅ Request sent
5. **Registration endpoint looks for pass → ✅ FOUND in DB**
6. **Creates device registration → ✅ Success (201)**
7. Scanner shows 1 device → ✅ Working!

## Additional Notes

### Why Regular Registration Works
The `/register/[cardId]` flow works because:
1. Creates user record first
2. Creates pass record in database
3. Generates pass file
4. All records exist when Apple Wallet tries to register

### Why Test Pass Doesn't Work
The `/test-card` flow fails because:
1. Only generates pass file
2. No user record created
3. No pass record created
4. Apple Wallet can't register (pass not found)

## Quick Test Command

After implementing fixes, test with:

```bash
# Check if pass exists in database
psql $DATABASE_URL -c "SELECT id, serialNumber, userId FROM userPasses WHERE serialNumber LIKE 'COFFEE%' ORDER BY createdAt DESC LIMIT 5;"

# Check if test users exist
psql $DATABASE_URL -c "SELECT id, username, email FROM users WHERE email LIKE '%@dopecard.test%' ORDER BY createdAt DESC LIMIT 5;"

# Check device registrations
psql $DATABASE_URL -c "SELECT pr.id, pr.passId, pr.deviceLibraryIdentifier, pr.platform, up.serialNumber FROM passRegistrations pr JOIN userPasses up ON pr.passId = up.id ORDER BY pr.createdAt DESC LIMIT 5;"
```

## Summary

The core issue is that **test passes generate `.pkpass` files but never create database records**. When Apple Wallet tries to register the device, it can't find the pass in the database and returns 404. The fix is to create both user and pass records in the database when generating test passes, matching the same flow used in the regular registration process.


