# Apple Wallet Callback Debugging Guide

## Quick Diagnosis

If you're not receiving Apple Wallet registration callbacks, follow these steps to diagnose the issue.

## Environment Check

### 1. Verify Environment Variables

```bash
# Check your .env file
cat .env | grep -E "(ENABLE_WEB_SERVICE_URL|PASS_AUTH_TOKEN|APP_URL|NEXT_PUBLIC_APP_URL)"
```

**Required values:**
```bash
ENABLE_WEB_SERVICE_URL=true
PASS_AUTH_TOKEN=your-secure-token-here
APP_URL=https://your-ngrok-url.ngrok-free.app
NEXT_PUBLIC_APP_URL=https://your-ngrok-url.ngrok-free.app
```

**Common issues:**
- ❌ `ENABLE_WEB_SERVICE_URL` is not set to `true` (must be exact string "true")
- ❌ `APP_URL` is using `http://` instead of `https://`
- ❌ `APP_URL` is `localhost` (Apple Wallet cannot reach localhost)
- ❌ `PASS_AUTH_TOKEN` is missing or empty

### 2. Restart Server After Changing .env

```bash
# Kill existing server
# Restart
npm run dev
```

**IMPORTANT:** Changes to `.env` require a server restart!

## Pass Generation Check

### 1. Generate a Test Pass

1. Go to `/test-card` or `/admin/test-card`
2. Configure your pass
3. Click "Generate Test Pass" or "Download Test Pass"
4. **Watch the server logs carefully**

### 2. Look for These Log Messages

**✅ Good signs:**
```
═════════════════════════════════════════════════════
🔧 PASS GENERATION CONFIGURATION
═════════════════════════════════════════════════════
📍 Base URL (webServiceURL): https://your-url.ngrok-free.app
🔐 ENABLE_WEB_SERVICE_URL: true
🔑 PASS_AUTH_TOKEN exists: true
🆔 User ID: 123e4567-e89b-12d3-a456-426614174000
🎫 Serial Number: COFFEE123e4567-e89b-12d3-a456-426614174000
...
✅ webServiceURL ENABLED - Device registration will work
📍 Registration endpoint:
   POST https://your-url.ngrok-free.app/api/passes/v1/devices/{deviceId}/registrations/...
```

**❌ Bad signs:**
```
⚠️  ⚠️  ⚠️  WARNING: webServiceURL DISABLED ⚠️  ⚠️  ⚠️
📱 Device registration will NOT work
```

If you see the warning, check:
1. Is `ENABLE_WEB_SERVICE_URL=true` in `.env`? (exactly "true", no quotes)
2. Did you restart the server after changing `.env`?
3. Is `PASS_AUTH_TOKEN` set in `.env`?

### 3. Verify Pass Record Created

Check if the pass was created in the database:

```bash
# Option 1: Use debug endpoint
curl "http://localhost:3000/api/debug/passes?serialNumber=COFFEE{your-user-id}"

# Option 2: Check database directly
psql $DATABASE_URL -c "SELECT id, serialNumber, userId, status, createdAt FROM user_passes ORDER BY createdAt DESC LIMIT 5;"
```

**Expected result:**
```json
{
  "pass": {
    "id": "...",
    "serialNumber": "COFFEE123e4567...",
    "userId": "123e4567...",
    "status": "active"
  },
  "user": {
    "username": "Test User...",
    "email": "test-...@test.com"
  },
  "deviceCount": 0,
  "registrations": []
}
```

**If pass not found:**
- ❌ Database record was not created
- This shouldn't happen with latest code - check if you're using old version
- Check server logs for errors during pass generation

## Apple Wallet Registration

### 1. Add Pass to Apple Wallet

1. Download the `.pkpass` file
2. Double-click (Mac) or AirDrop to iPhone
3. Click "Add" in Apple Wallet

### 2. Monitor Server Logs

**Watch for this in your server logs:**

**✅ Successful registration:**
```
═════════════════════════════════════════════════════
📱 APPLE WALLET REGISTRATION REQUEST
═════════════════════════════════════════════════════
📍 Endpoint: POST /api/passes/v1/devices/{deviceId}/registrations/{passType}/{serialNumber}
🆔 Device ID: abc123...
🔖 Pass Type: pass.com.dopecard.passmaker
🎫 Serial Number: COFFEE123e4567...
🔐 Authorization Header: Present
═════════════════════════════════════════════════════
✅ Authentication verified
🔍 Searching for pass in database...
✅ Pass found in database
   Pass ID: ...
   Serial Number: COFFEE123e4567...
   User ID: 123e4567...
✨ Creating NEW registration
✅ ✅ ✅ REGISTRATION SUCCESSFUL ✅ ✅ ✅
   Registration ID: ...
   Device ID: abc123...
   Platform: ios
📱 Device is now registered for push notifications!
═════════════════════════════════════════════════════
```

**❌ No logs at all:**
- Apple Wallet is NOT sending the callback
- This means `webServiceURL` is NOT in the pass
- Regenerate pass with correct environment variables

**❌ Authentication failed:**
```
❌ AUTHENTICATION FAILED
Expected: ApplePass your-token-here
Received: ApplePass different-token
```
- Token in pass doesn't match `PASS_AUTH_TOKEN` in `.env`
- Regenerate pass after fixing token

**❌ Pass not found:**
```
❌ PASS NOT FOUND IN DATABASE
   Serial Number: COFFEE123e4567...
💡 This means the pass was not created in the database
```
- Pass record was not created during generation
- This is the main issue - check `generateTestPass` endpoint

## Verification in Scanner

### 1. Open Scanner App

Go to `/scanner`

### 2. Search for Test User

Search by:
- Email: `test-...@test.com` (use the one from logs)
- Username: `Test User ...` (use the one from logs)
- UUID: Paste the user ID from logs

### 3. Check Device Count

**✅ Success:**
```
Devices registered: 1
✅ 1 device(s) registered. Notifications will be sent.
```

**❌ Failure:**
```
Devices registered: 0
⚠️ No devices registered. Configure webServiceURL in pass generation...
```

## Common Issues and Solutions

### Issue 1: No Registration Callback Received

**Symptoms:**
- Pass added to Apple Wallet successfully
- No logs in server console
- Device count shows 0

**Diagnosis:**
```bash
# Check if webServiceURL is in pass
# Extract pass.json from .pkpass file
unzip -p your-pass.pkpass pass.json | jq .

# Look for:
{
  "webServiceURL": "https://your-url.ngrok-free.app/api/passes/v1",
  "authenticationToken": "your-token-here"
}
```

**Solution:**
1. If missing: Set `ENABLE_WEB_SERVICE_URL=true` in `.env`
2. Restart server
3. Regenerate pass
4. Add new pass to wallet

### Issue 2: 401 Unauthorized

**Symptoms:**
- Server logs show authentication failed
- Status 401 returned

**Diagnosis:**
```bash
# Check token in pass vs .env
echo "Pass token: $(unzip -p your-pass.pkpass pass.json | jq -r .authenticationToken)"
echo "Env token: $(grep PASS_AUTH_TOKEN .env)"
```

**Solution:**
1. Ensure `PASS_AUTH_TOKEN` is set in `.env`
2. Restart server
3. Regenerate pass with new token
4. Add new pass to wallet

### Issue 3: 404 Pass Not Found

**Symptoms:**
- Registration request received
- Pass not found in database
- Status 404 returned

**Diagnosis:**
```bash
# Check if pass exists
curl "http://localhost:3000/api/debug/passes?serialNumber=COFFEE{your-user-id}"
```

**Solution:**
1. Ensure `generateTestPass` creates database record (should be fixed in latest code)
2. Check server logs for errors during pass generation
3. Regenerate pass

### Issue 4: Using localhost Instead of ngrok

**Symptoms:**
- Everything looks correct
- No registration callback
- webServiceURL contains `localhost`

**Problem:**
Apple Wallet cannot reach `localhost` from your device

**Solution:**
1. Use ngrok: `ngrok http 3000`
2. Copy ngrok URL: `https://abc123.ngrok-free.app`
3. Update `.env`:
   ```bash
   APP_URL=https://abc123.ngrok-free.app
   NEXT_PUBLIC_APP_URL=https://abc123.ngrok-free.app
   ```
4. Restart server
5. Regenerate pass

### Issue 5: Old Pass Cached

**Symptoms:**
- Fixed configuration
- Still not working
- Old pass still in wallet

**Problem:**
Apple Wallet may cache the old pass configuration

**Solution:**
1. Delete pass from Apple Wallet
2. Regenerate new pass (should have new serial number)
3. Add new pass to wallet
4. Check logs again

## Debug Endpoints

### Check Pass Record

```bash
# By serial number
curl "http://localhost:3000/api/debug/passes?serialNumber=COFFEE123e4567-e89b-12d3-a456-426614174000"

# By user ID
curl "http://localhost:3000/api/debug/passes?userId=123e4567-e89b-12d3-a456-426614174000"

# List recent passes
curl "http://localhost:3000/api/debug/passes?limit=5"
```

**Response shows:**
- Pass details
- User details
- Device registrations
- Device count

**Note:** Debug endpoint only works in development

## Testing Checklist

Before reporting an issue, verify:

- [ ] `ENABLE_WEB_SERVICE_URL=true` in `.env` (exactly "true")
- [ ] `PASS_AUTH_TOKEN` is set in `.env`
- [ ] `APP_URL` uses HTTPS (ngrok or deployed URL)
- [ ] Server restarted after changing `.env`
- [ ] Test pass generated shows "webServiceURL ENABLED" in logs
- [ ] Pass record created in database (check debug endpoint)
- [ ] User record created in database
- [ ] Old passes deleted from Apple Wallet before testing
- [ ] New pass added to Apple Wallet
- [ ] Server logs monitored during wallet add
- [ ] Registration callback received (check logs)
- [ ] Scanner shows device count > 0

## Manual Callback Test

If Apple Wallet isn't sending callbacks, test the endpoint manually:

```bash
# Replace with your values
SERIAL="COFFEE123e4567-e89b-12d3-a456-426614174000"
TOKEN="your-pass-token-here"
NGROK_URL="https://abc123.ngrok-free.app"

# Send registration request
curl -X POST \
  "$NGROK_URL/api/passes/v1/devices/TEST_DEVICE_123/registrations/pass.com.dopecard.passmaker/$SERIAL" \
  -H "Authorization: ApplePass $TOKEN" \
  -H "Content-Type: application/json" \
  -d '"test-push-token-abc123"' \
  -v
```

**Expected response:** `201 Created` or `200 OK`

**Check:**
1. Server logs show registration successful
2. Database has new registration record
3. Scanner shows device count = 1

## Still Not Working?

1. Check ngrok is running and URL is correct
2. Verify ngrok URL is accessible: `curl https://your-url.ngrok-free.app`
3. Check firewall/network settings
4. Try different ngrok region: `ngrok http 3000 --region us`
5. Check Apple Wallet console on device for errors
6. Verify device has internet connection

## Success Indicators

When everything works correctly, you should see:

1. **During pass generation:**
   - ✅ webServiceURL ENABLED
   - ✅ Test user created
   - ✅ Pass record created

2. **When adding to wallet:**
   - ✅ Registration request received
   - ✅ Authentication verified
   - ✅ Pass found in database
   - ✅ Registration created

3. **In scanner:**
   - ✅ Devices registered: 1 (or more)
   - ✅ Can send test notifications

4. **In debug endpoint:**
   - ✅ Pass exists
   - ✅ User exists
   - ✅ Registrations array has 1+ items

---

**If you've followed all steps and it still doesn't work, collect these logs:**
1. Full server logs during pass generation
2. Full server logs when adding to wallet
3. Output from debug endpoint
4. Screenshot of environment variables (hide sensitive tokens)
5. ngrok URL and verification it's accessible


