# Apple Wallet Pass Generation - Complete Documentation

## Overview

This document provides a comprehensive guide to the working Apple Wallet pass generation system. It documents the exact structure, flow, and implementation details that make the pass generation work successfully.

**Status**: ✅ **WORKING** - This implementation successfully generates `.pkpass` files that open in Apple Wallet.

**Last Updated**: Based on working implementation after fixing validation errors and switching to generic pass type.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Certificate & Key Management](#certificate--key-management)
3. [Asset Fetching & Validation](#asset-fetching--validation)
4. [Pass JSON Structure](#pass-json-structure)
5. [PKPass Instance Creation](#pkpass-instance-creation)
6. [Pass Generation Flow](#pass-generation-flow)
7. [Integration with /admin/test-card](#integration-with-admintest-card)
8. [Client-Side Download Handling](#client-side-download-handling)
9. [Critical Implementation Details](#critical-implementation-details)
10. [Troubleshooting Guide](#troubleshooting-guide)

---

## Architecture Overview

### File Structure

```
app/utils/pass-generation/pass-generation.ts  # Main pass generation logic
server/routers/passesRouter.ts                 # tRPC endpoint for test-card
app/admin/test-card/page.tsx                   # Frontend test interface
```

### Key Dependencies

- `passkit-generator` (v3.2.0) - Apple Wallet pass generation library
- `axios` - HTTP client for fetching certificates and assets
- Node.js `Buffer` - Binary data handling

### Pass Generation Flow

```
1. Fetch Certificates (P12, WWDR, Private Key)
   ↓
2. Fetch & Validate Assets (logo.png, icon.png)
   ↓
3. Build pass.json Structure
   ↓
4. Create PKPass Instance
   ↓
5. Apply Localization (optional)
   ↓
6. Generate .pkpass Buffer
   ↓
7. Validate ZIP Signature
   ↓
8. Return Buffer
```

---

## Certificate & Key Management

### Required Certificates

The pass generation requires three critical security components:

#### 1. P12 Certificate (Signer Certificate)
- **Purpose**: Signs the pass manifest
- **URL**: `https://utfs.io/f/v9dcWxyyBXm21Gwze4c7l6M8cWvkzGsuYqT9a1SpxhnLOrB4`
- **Format**: Binary (arraybuffer)
- **Usage**: `signerCert` in PKPass options

#### 2. WWDR Certificate (Worldwide Developer Relations)
- **Purpose**: Apple's intermediate certificate for validation
- **URL**: `https://utfs.io/f/v9dcWxyyBXm2uRC4Dg3rFvDKcpQeTOCk1SUmysgVLA7R8fME`
- **Format**: Binary (arraybuffer)
- **Usage**: `wwdr` in PKPass options

#### 3. Private Key
- **Purpose**: Decrypts the P12 certificate
- **URL**: `https://utfs.io/f/v9dcWxyyBXm2HnAiB7kqANS5hgWbHv3yTOp0w7KoRPaLVBCx`
- **Format**: Text (PEM format)
- **Passphrase**: `'sugoi'`
- **Usage**: `signerKey` in PKPass options

### Certificate Fetching Implementation

```typescript
// Fetch certificates concurrently for performance
const [certResponse, wwdrResponse, privateKeyResponse] = await Promise.all([
    axios.get(certUrl, { responseType: 'arraybuffer' }),
    axios.get(wwdrUrl, { responseType: 'arraybuffer' }),
    axios.get(privateKeyUrl, { responseType: 'text' }),
]);

// Validate HTTP status codes
if (certResponse.status !== 200 || wwdrResponse.status !== 200 || privateKeyResponse.status !== 200) {
    throw new Error('Failed to fetch one or more certificates');
}

// Convert to Buffers
p12Buffer = Buffer.from(certResponse.data);
wwdrBuffer = Buffer.from(wwdrResponse.data);
privateKey = privateKeyResponse.data;

// Validate buffers are not empty
if (p12Buffer.length === 0 || wwdrBuffer.length === 0 || !privateKey) {
    throw new Error('One or more buffers are empty');
}
```

### Critical Notes

- **All certificates must return HTTP 200** - Any other status code will fail
- **Buffers cannot be empty** - Empty buffers indicate fetch failure
- **Private key must be in PEM format** - Text format, not binary
- **Passphrase is required** - The P12 certificate is encrypted with passphrase `'sugoi'`

---

## Asset Fetching & Validation

### Required Assets (Minimal Working Configuration)

For the **minimal working pass**, only two assets are required:

1. **logo.png** - Business logo displayed on the pass
   - URL: `https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D`
   - Size: ~1.5KB
   - Format: PNG

2. **icon.png** - Icon for push notifications and pass list
   - URL: `https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw`
   - Size: ~102KB
   - Format: PNG

### Asset Validation Process

#### Step 1: Concurrent Fetching

```typescript
const assetUrls = {
    logo: 'https://utfs.io/f/v9dcWxyyBXm28BhSeXD0FgCIaOWfxZRyNvXnHek9stU1rK3D',
    icon: 'https://utfs.io/f/v9dcWxyyBXm22t0LAEXSGFaOBg9vC4mypPQi2Mx7nDHeUKcw'
};

const responses = await Promise.all(
    assetUrlArray.map(async (url, index) => {
        const assetName = assetNames[index];
        const response = await axios.get(url, { 
            responseType: 'arraybuffer',
            validateStatus: (status) => status === 200 // Only accept 200
        });
        
        // Validate HTTP status
        if (response.status !== 200) {
            throw new Error(`HTTP ${response.status} for ${assetName}`);
        }
        
        // Validate Content-Type
        const contentType = response.headers['content-type'] || '';
        if (!contentType.startsWith('image/')) {
            console.warn(`Warning: ${assetName} has non-image Content-Type: ${contentType}`);
        }
        
        return { assetName, data: response.data, status: response.status, contentType };
    })
);
```

#### Step 2: Buffer Creation & Validation

```typescript
const [logoBuffer, iconBuffer] = responses.map((response, index) => {
    const assetName = assetNames[index];
    const buffer = Buffer.from(response.data);
    
    // Validate buffer is not empty
    if (buffer.length === 0) {
        throw new Error(`Asset ${assetName}: Buffer is empty`);
    }
    
    // Validate image format using magic bytes
    validateImageBuffer(buffer, assetName);
    
    return buffer;
});
```

#### Step 3: Image Format Validation

The `validateImageBuffer()` function checks magic bytes to ensure valid image format:

```typescript
function validateImageBuffer(buffer: Buffer, assetName: string): void {
    if (buffer.length < 8) {
        throw new Error(`Asset ${assetName}: Buffer too small to be a valid image`);
    }

    // Check for PNG signature: 89 50 4E 47 0D 0A 1A 0A
    const isPNG = buffer[0] === 0x89 && 
                  buffer[1] === 0x50 && 
                  buffer[2] === 0x4E && 
                  buffer[3] === 0x47 &&
                  buffer[4] === 0x0D && 
                  buffer[5] === 0x0A && 
                  buffer[6] === 0x1A && 
                  buffer[7] === 0x0A;

    // Check for JPEG signature: FF D8 FF
    const isJPEG = buffer[0] === 0xFF && 
                   buffer[1] === 0xD8 && 
                   buffer[2] === 0xFF;

    if (!isPNG && !isJPEG) {
        throw new Error(`Asset ${assetName}: Invalid image format. Expected PNG or JPEG.`);
    }
}
```

### Why Minimal Assets Work

The old working version (9 months ago) used only `logo.png` and `icon.png`. This minimal approach:

1. **Reduces complexity** - Fewer assets mean fewer potential failure points
2. **Faster generation** - Less data to fetch and process
3. **Better compatibility** - Generic pass type doesn't require strip images
4. **Proven to work** - Matches the structure that worked previously

### Optional Assets (Currently Commented Out)

The following assets are fetched but not included in the minimal pass:

- `icon@2x.png` - High-resolution icon (for Retina displays)
- `logo@2x.png` - High-resolution logo
- `strip.png`, `strip@2x.png`, `strip@3x.png` - Banner images (for storeCard type)
- `thumbnail.png`, `thumbnail@2x.png` - Thumbnail images

**Note**: These can be added back when upgrading to storeCard pass type or adding visual enhancements.

---

## Pass JSON Structure

### Minimal Generic Pass Structure

The working implementation uses a **generic pass type** with minimal required fields:

```json
{
  "formatVersion": 1,
  "serialNumber": "COFFEE{userId}",
  "passTypeIdentifier": "pass.com.dopecard.passmaker",
  "teamIdentifier": "DTWNQT4JQL",
  "description": "Coffee Loyalty Card",
  "organizationName": "Brew Rewards",
  "logoText": "Brew Rewards",
  "backgroundColor": "rgb(89, 52, 28)",
  "foregroundColor": "rgb(255, 255, 255)",
  "generic": {
    "primaryFields": [
      {
        "key": "stamps",
        "label": "Stamps Collected",
        "value": 0
      }
    ],
    "secondaryFields": [
      {
        "key": "reward",
        "label": "Reward Progress",
        "value": "0/10"
      }
    ]
  },
  "barcode": {
    "message": "{userId}",
    "format": "PKBarcodeFormatQR",
    "messageEncoding": "iso-8859-1"
  }
}
```

### Field Descriptions

#### Required Top-Level Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `formatVersion` | number | ✅ | Always `1` for current PassKit format |
| `serialNumber` | string | ✅ | Unique identifier: `COFFEE{userId}` |
| `passTypeIdentifier` | string | ✅ | Must match Apple Developer certificate: `pass.com.dopecard.passmaker` |
| `teamIdentifier` | string | ✅ | Apple Team ID: `DTWNQT4JQL` |
| `description` | string | ✅ | Short description shown in Wallet |
| `organizationName` | string | ✅ | Business name |
| `logoText` | string | ✅ | Text next to logo |
| `backgroundColor` | string | ✅ | RGB color: `rgb(89, 52, 28)` |
| `foregroundColor` | string | ✅ | RGB color: `rgb(255, 255, 255)` |

#### Generic Pass Type Structure

```typescript
generic: {
    primaryFields: [
        {
            key: 'stamps',           // Unique field identifier
            label: 'Stamps Collected', // Display label
            value: stampCount        // Current value (number)
        }
    ],
    secondaryFields: [
        {
            key: 'reward',
            label: 'Reward Progress',
            value: `${stampCount}/10` // Display value (string)
        }
    ]
}
```

**Field Types Available**:
- `primaryFields` - Large, prominent display (typically 1-2 fields)
- `secondaryFields` - Smaller, supporting information (typically 1-2 fields)
- `auxiliaryFields` - Additional details (optional)
- `backFields` - Information shown when pass is flipped (optional)
- `headerFields` - Header section fields (optional)

#### Barcode Configuration

```typescript
barcode: {
    message: userId,                    // Data encoded in QR code
    format: 'PKBarcodeFormatQR',        // QR code format
    messageEncoding: 'iso-8859-1'        // Character encoding
}
```

**Supported Barcode Formats**:
- `PKBarcodeFormatQR` - QR Code (recommended)
- `PKBarcodeFormatPDF417` - PDF417
- `PKBarcodeFormatAztec` - Aztec code
- `PKBarcodeFormat128` - Code 128

### Commented Out Fields (For Future Use)

The following fields are **intentionally commented out** for debugging:

```typescript
// webServiceURL: `${baseUrl}/api/passes/v1`,
// authenticationToken: process.env.PASS_AUTH_TOKEN || 'default-token-change-in-production',
```

**Why Commented Out**:
1. **HTTP URLs are rejected** - Apple Wallet requires HTTPS for webServiceURL
2. **Local testing** - webServiceURL not needed for basic pass functionality
3. **Debugging** - Removing webServiceURL eliminates potential validation issues

**When to Re-enable**:
- When deploying to production with HTTPS
- When implementing pass updates via web service
- When push notifications are required

---

## PKPass Instance Creation

### Creating the PKPass Instance

```typescript
const pass = new passkit.PKPass({
    "pass.json": Buffer.from(JSON.stringify(passJson)),
    "logo.png": logoBuffer,
    "icon.png": iconBuffer
}, {
    wwdr: wwdrBuffer,
    signerCert: p12Buffer,
    signerKey: privateKey,
    signerKeyPassphrase: 'sugoi'
});
```

### Parameters Explained

#### First Parameter: Files Object
- **`pass.json`** - The pass configuration as a Buffer
- **`logo.png`** - Business logo image
- **`icon.png`** - Notification icon

#### Second Parameter: Certificate Options
- **`wwdr`** - WWDR certificate buffer
- **`signerCert`** - P12 certificate buffer
- **`signerKey`** - Private key (PEM format string)
- **`signerKeyPassphrase`** - Password to decrypt P12: `'sugoi'`

### Critical Implementation Notes

1. **DO NOT call `setBarcodes()`** - Barcode is already in pass.json, calling setBarcodes() causes validation error:
   ```
   ValidationError: "value" must be of type object
   ```

2. **Localization is optional** - Can be safely skipped if not needed:
   ```typescript
   pass.localize("en", { description: 'Coffee Loyalty Card' });
   ```

3. **File names must match exactly** - `logo.png` and `icon.png` are required names

---

## Pass Generation Flow

### Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ 1. START: generatePass(userId, stampCount)                  │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 2. Fetch Certificates (Concurrent)                         │
│    - P12 Certificate (signerCert)                          │
│    - WWDR Certificate (wwdr)                               │
│    - Private Key (signerKey)                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 3. Validate Certificates                                    │
│    - Check HTTP status = 200                                │
│    - Check buffers not empty                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 4. Fetch Assets (Concurrent)                               │
│    - logo.png                                               │
│    - icon.png                                               │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 5. Validate Assets                                          │
│    - Check HTTP status = 200                                │
│    - Check Content-Type is image/*                          │
│    - Validate image magic bytes (PNG/JPEG)                  │
│    - Check buffers not empty                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 6. Build pass.json Structure                                │
│    - Required fields                                        │
│    - Generic pass type                                      │
│    - Barcode configuration                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 7. Validate pass.json                                       │
│    - Check required fields exist                            │
│    - Check generic structure                                │
│    - Check barcode fields                                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 8. Create PKPass Instance                                   │
│    - Pass files object                                      │
│    - Certificate options                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 9. Apply Localization (Optional)                            │
│    - pass.localize("en", {...})                            │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 10. Generate .pkpass Buffer                                 │
│     - pass.getAsBuffer()                                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 11. Validate Buffer                                         │
│     - Check buffer not empty                                │
│     - Check ZIP signature (PK = 0x50 0x4B)                 │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ 12. RETURN: Buffer                                          │
└─────────────────────────────────────────────────────────────┘
```

### Step-by-Step Code Flow

```typescript
export async function generatePass(userId: string, stampCount: number = 0) {
    // Step 1: Log start
    console.log('Starting to initiate the pass creation');

    // Step 2-3: Fetch and validate certificates
    const [certResponse, wwdrResponse, privateKeyResponse] = await Promise.all([...]);
    // ... validation ...

    // Step 4-5: Fetch and validate assets
    const responses = await Promise.all([...]);
    // ... validation ...

    // Step 6: Build pass.json
    const passJson = { ... };

    // Step 7: Validate pass.json
    if (!passJson.serialNumber || !passJson.passTypeIdentifier || ...) {
        throw new Error('...');
    }

    // Step 8: Create PKPass instance
    const pass = new passkit.PKPass({...}, {...});

    // Step 9: Apply localization (optional)
    pass.localize("en", { description: 'Coffee Loyalty Card' });

    // Step 10: Generate buffer
    const buffer = await pass.getAsBuffer();

    // Step 11: Validate buffer
    if (buffer[0] !== 0x50 || buffer[1] !== 0x4B) {
        throw new Error('Invalid ZIP signature');
    }

    // Step 12: Return
    return buffer;
}
```

---

## Integration with /admin/test-card

### tRPC Endpoint: `passes.generateTestPass`

**Location**: `server/routers/passesRouter.ts`

**Input Schema**:
```typescript
{
    cardType: "stamp" | "points" | "discount",
    stampCount?: number (2-50),
    initialStamps?: number (0+),
    pointsRate?: number (1-10),
    discountTiers?: number[],
    backgroundColor: string,
    textColor: string,
    accentColor: string,
    cardTitle: string,
    businessName: string,
    subtitle?: string,
    description?: string,
    expiration: "unlimited" | "timeRange",
    startDate?: string,
    endDate?: string,
    platform: "ios" | "android" | "unknown"
}
```

**Note**: Currently, the form data (cardType, colors, etc.) is **not used** in pass generation. The pass uses hardcoded values matching the minimal working structure. This is intentional for debugging.

### Endpoint Flow

```typescript
generateTestPass: adminProcedure
    .mutation(async ({ input, ctx }) => {
        // 1. Detect platform from User-Agent
        let detectedPlatform = input.platform;
        // ... platform detection logic ...

        // 2. Create test user
        const userResult = await db.insert(users).values({...});

        // 3. Create userPass record
        const [userPass] = await db.insert(userPasses).values({...});

        // 4. Generate pass (iOS)
        if (detectedPlatform === 'ios') {
            passBuffer = await generatePass(userId, input.initialStamps || 0);
            
            // 5. Validate buffer
            if (!passBuffer || !Buffer.isBuffer(passBuffer)) {
                throw new Error('Generated pass buffer is invalid');
            }

            // 6. Convert to base64
            const base64Pass = passBuffer.toString('base64');

            // 7. Return
            return {
                buffer: base64Pass,
                mimeType: "application/vnd.apple.pkpass"
            };
        }
    });
```

### Why Form Data Isn't Used Yet

The test-card form collects extensive customization data, but the current implementation:

1. **Focuses on core functionality** - Getting the pass to generate and open
2. **Uses proven structure** - Matches the old working version exactly
3. **Eliminates variables** - Hardcoded values reduce debugging complexity

**Future Enhancement**: Map form data to pass.json fields:
- `cardTitle` → `description` or custom field
- `businessName` → `organizationName`
- `backgroundColor` → `backgroundColor`
- `textColor` → `foregroundColor`
- `cardType` → Different pass structures (stamp vs points vs discount)

---

## Client-Side Download Handling

### Frontend Implementation: `/admin/test-card/page.tsx`

The client-side code handles downloading the base64-encoded pass:

```typescript
const generateTestPass = trpc.passes.generateTestPass.useMutation({
    onSuccess: (data) => {
        // 1. Decode base64 to binary
        const binaryData = atob(data.buffer);
        
        // 2. Convert to Uint8Array
        const bytes = new Uint8Array(binaryData.length);
        for (let i = 0; i < binaryData.length; i++) {
            bytes[i] = binaryData.charCodeAt(i);
        }
        
        // 3. Create Blob with correct MIME type
        const blob = new Blob([bytes], { type: data.mimeType });
        
        // 4. Create object URL
        const url = window.URL.createObjectURL(blob);
        
        // 5. Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = 'test-pass.pkpass';  // Critical: .pkpass extension
        a.setAttribute('download', 'test-pass.pkpass'); // Explicit attribute
        
        // 6. Append to DOM and click
        document.body.appendChild(a);
        setTimeout(() => {
            a.click();
            // Cleanup
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        }, 10);
    }
});
```

### Critical Download Details

1. **Base64 Decoding**: `atob()` converts base64 string to binary
2. **Uint8Array Conversion**: Ensures proper binary representation
3. **MIME Type**: `application/vnd.apple.pkpass` tells browser it's a pass file
4. **File Extension**: `.pkpass` extension is critical for iOS recognition
5. **Download Attribute**: Must be set before appending to DOM
6. **Timing**: Small delay ensures DOM is ready before click

### Why This Works

- **Proper MIME type** - Browser recognizes the file type
- **Correct extension** - iOS associates `.pkpass` with Wallet
- **Blob URL** - Creates temporary URL for download
- **Explicit download** - Forces download instead of navigation

---

## Critical Implementation Details

### 1. Generic Pass Type vs StoreCard

**Current Implementation**: Generic pass type
- ✅ **Works reliably** - Proven to open in Apple Wallet
- ✅ **Minimal structure** - Fewer fields = fewer failure points
- ✅ **Flexible** - Can display any information
- ❌ **Less visual** - No strip images or specialized layout

**StoreCard Type** (Future):
- ✅ **Better visuals** - Strip images, specialized layout
- ✅ **More fields** - Header, primary, secondary, auxiliary, back fields
- ❌ **More complex** - More validation requirements
- ❌ **Stricter** - More likely to fail validation

### 2. Why webServiceURL is Commented Out

**Problem**: HTTP URLs are rejected by Apple Wallet
- Local development uses `http://localhost:3000`
- Apple requires HTTPS for webServiceURL
- Invalid webServiceURL can cause pass to be rejected

**Solution**: Comment out for local testing
- Pass works without webServiceURL
- Can add back when deploying with HTTPS
- webServiceURL is only needed for pass updates/push notifications

### 3. Barcode Message Format

**Current**: `userId` (direct UUID)
```typescript
barcode: {
    message: userId,  // e.g., "ef9047f7-981e-4a61-8d9a-c11efb980776"
}
```

**Old Version**: Also used `userId` directly

**Why This Works**:
- UUID is unique per user
- Can be scanned to identify customer
- No special encoding needed

### 4. Asset Selection Strategy

**Minimal Assets** (Current - Working):
- `logo.png` - Required for display
- `icon.png` - Required for notifications

**Why Not More Assets**:
- Generic pass type doesn't require strip images
- Fewer assets = faster generation
- Matches old working version exactly

### 5. Error Handling Strategy

**Comprehensive Validation**:
1. HTTP status codes checked
2. Content-Type headers validated
3. Buffer sizes validated
4. Image magic bytes validated
5. Pass.json structure validated
6. ZIP signature validated

**Fail Fast**: Any validation failure throws error immediately

**Detailed Logging**: Every step logs success/failure for debugging

---

## Troubleshooting Guide

### Pass Downloads But Won't Open

**Symptoms**: File downloads successfully but Apple Wallet says "Invalid"

**Possible Causes**:

1. **Invalid Certificate**
   - Check certificate URLs are accessible
   - Verify certificates haven't expired
   - Ensure passTypeIdentifier matches certificate

2. **Invalid pass.json Structure**
   - Check all required fields are present
   - Verify field types are correct
   - Ensure no invalid characters

3. **Asset Issues**
   - Verify asset URLs return valid images
   - Check image formats are PNG/JPEG
   - Ensure buffers aren't corrupted

4. **ZIP Structure Issues**
   - Verify buffer starts with `PK` (0x50 0x4B)
   - Check buffer isn't corrupted during base64 encoding
   - Ensure proper MIME type on download

**Debugging Steps**:

1. Check server logs for validation errors
2. Verify pass.json content in logs
3. Test certificate URLs manually
4. Test asset URLs manually
5. Verify ZIP signature in buffer

### Pass Generation Fails

**Error**: "Failed to fetch one or more certificates"

**Solution**:
- Check certificate URLs are accessible
- Verify network connectivity
- Check certificate URLs haven't changed

**Error**: "Asset X: Invalid image format"

**Solution**:
- Verify asset URL returns actual image
- Check Content-Type header is `image/png` or `image/jpeg`
- Verify image magic bytes are correct

**Error**: "Pass JSON missing required fields"

**Solution**:
- Check pass.json structure matches documentation
- Verify all required fields are present
- Check for typos in field names

### Download Issues

**File downloads with UUID name instead of .pkpass**

**Solution**:
- Ensure `a.download = 'test-pass.pkpass'` is set
- Set attribute explicitly: `a.setAttribute('download', 'test-pass.pkpass')`
- Append to DOM before clicking
- Don't use `window.open()` fallback (causes UUID names)

**File downloads but is corrupted**

**Solution**:
- Verify base64 decoding is correct
- Check Uint8Array conversion
- Ensure MIME type is correct
- Verify buffer isn't modified after generation

---

## Best Practices

### 1. Always Validate

- ✅ Validate certificates before use
- ✅ Validate assets before use
- ✅ Validate pass.json structure
- ✅ Validate generated buffer

### 2. Use Minimal Structure

- ✅ Start with generic pass type
- ✅ Use only required assets
- ✅ Add complexity gradually

### 3. Comprehensive Logging

- ✅ Log every step
- ✅ Log validation results
- ✅ Log pass.json content
- ✅ Log buffer information

### 4. Error Handling

- ✅ Fail fast on validation errors
- ✅ Provide detailed error messages
- ✅ Include context in errors

### 5. Testing

- ✅ Test certificate fetching
- ✅ Test asset fetching
- ✅ Test pass generation
- ✅ Test pass opening in Wallet
- ✅ Test on multiple devices

---

## Future Enhancements

### Phase 1: Use Form Data
- Map test-card form fields to pass.json
- Support different card types (stamp, points, discount)
- Customize colors from form

### Phase 2: Add More Assets
- Add `@2x` versions for Retina displays
- Add strip images for visual enhancement
- Add thumbnail images

### Phase 3: Switch to StoreCard
- Migrate to storeCard pass type
- Add header, auxiliary, and back fields
- Implement more complex layouts

### Phase 4: Add webServiceURL
- Deploy with HTTPS
- Implement pass update endpoints
- Add push notification support

---

## Conclusion

This documentation captures the **exact working implementation** that successfully generates Apple Wallet passes. The key to success is:

1. **Minimal structure** - Generic pass type with only required fields
2. **Comprehensive validation** - Validate everything at every step
3. **Proven approach** - Match the old working version exactly
4. **Proper error handling** - Fail fast with detailed errors
5. **Extensive logging** - Log everything for debugging

By following this structure and implementation, you can reliably generate passes that open in Apple Wallet.

---

**Last Verified**: Working implementation after fixing validation errors and switching to generic pass type.

**Status**: ✅ **PRODUCTION READY** (for minimal generic passes)

