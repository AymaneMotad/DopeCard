# Pass Generation Specification

## Overview

The pass generation system creates digital loyalty cards for Apple Wallet (iOS) and Google Pay (Android). This is a core feature that must remain stable and reliable.

## Current Implementation

**Location**: `app/utils/pass-generation/pass-generation.ts`

**Status**: ✅ Working - DO NOT MODIFY without extensive testing

### Key Functions

1. `generatePass(userId: string, stampCount: number)` - Generates Apple Wallet PKPass
2. `generateGooglePass(userId: string, stampCount: number)` - Generates Google Pay pass

### Dependencies

- `passkit-generator` - Apple Wallet pass generation
- `googleapis` - Google Pay API integration
- Certificate files stored securely (currently via URLs)

## Technical Details

### Apple Wallet (PKPass)

- Format: PKPass file (.pkpass)
- Serial Number: `COFFEE{userId}`
- Pass Type Identifier: `pass.com.dopecard.passmaker`
- Team Identifier: `DTWNQT4JQL`
- Assets: Icon, logo, strip images at multiple resolutions
- Fields: Balance (stamps), reward status, progress indicator

### Google Pay

- Format: JWT-based pass
- Service Account: Configured via environment variables
- Class/Object structure for loyalty cards
- Returns: Google Pay save URL

## Integration Points

### Current Usage

**tRPC Router**: `server/routers/users.ts`
- `create` procedure calls pass generation
- Platform detection (iOS/Android) determines which function to call
- Returns pass data (base64 for iOS, URL for Android)

### Database

- User passes stored in `userPasses` table
- Pass registrations in `passRegistrations` table
- Pass updates tracked in `passUpdates` table

## Future Enhancements

### Planned Improvements

1. **Modularization**: Wrap in abstraction layer without changing core
2. **Template System**: Support multiple card types (stamps, points, discount, etc.)
3. **Dynamic Customization**: Allow per-card design customization
4. **Certificate Management**: Better certificate storage and rotation
5. **Error Handling**: More robust error handling and retry logic
6. **Testing**: Comprehensive test coverage with mocked certificates

### Migration Strategy

When refactoring:
1. Create abstraction layer first
2. Keep existing functions working
3. Gradually migrate to new structure
4. Test thoroughly at each step
5. Never break production

## Testing Requirements

### Unit Tests Needed

- [ ] Test pass JSON structure generation
- [ ] Test certificate fetching (mocked)
- [ ] Test asset fetching (mocked)
- [ ] Test error handling
- [ ] Test platform detection

### Integration Tests Needed

- [ ] Test full pass generation flow
- [ ] Test tRPC integration
- [ ] Test database integration

## Security Considerations

- Certificates must be stored securely
- Never commit certificates to repository
- Use environment variables for sensitive data
- Validate all inputs before pass generation
- Rate limit pass generation endpoints

## Performance Requirements

- Pass generation: < 3 seconds
- Support concurrent generation
- Cache certificates when possible
- Optimize image assets

## Error Handling

Current error handling:
- Try-catch blocks around critical operations
- Console logging for debugging
- Error messages thrown to caller

Improvements needed:
- Structured error types
- Better error messages
- Retry logic for network failures
- Fallback mechanisms

