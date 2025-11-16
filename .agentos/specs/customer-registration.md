# Customer Registration Specification

## Overview

The customer registration system allows end customers to sign up and receive loyalty cards.

## Current Implementation

**Location**: 
- `app/Registration/page.tsx` - Registration form
- `server/routers/users.ts` - User creation API

**Status**: ✅ Working

## Registration Flow

1. Customer scans QR code or clicks link
2. Registration form displayed
3. Customer fills required fields
4. System validates input
5. User account created
6. Pass generated (iOS or Android)
7. Pass download/installation link provided

## Form Fields

### Required Fields
- Username
- Email
- Phone number
- Platform (iOS/Android) - auto-detected

### Optional Fields
- Date of birth (future)
- Additional custom fields (future)

## Platform Detection

- Detects iOS vs Android from user agent
- Generates appropriate pass format
- Falls back to iOS if unknown

## Pass Generation Integration

After registration:
1. User created in database
2. Platform detected
3. Pass generated via `generatePass` or `generateGooglePass`
4. Pass data returned to client
5. Client handles download/installation

## Database

Uses `users` table:
- User account created
- Role set to appropriate type
- Active flag set to true

## API Endpoint

**tRPC Procedure**: `users.create`

**Input**:
```typescript
{
  username: string;
  email: string;
  phoneNumber: string;
  platform: 'ios' | 'android' | 'unknown';
}
```

**Output**:
```typescript
{
  user: User;
  passData: {
    buffer: string; // base64 for iOS, URL for Android
    mimeType?: string;
  };
}
```

## Validation

- Email format validation
- Phone number format validation
- Username uniqueness check
- Email uniqueness check
- Phone uniqueness check

## Error Handling

- Duplicate user errors
- Validation errors
- Pass generation errors
- Network errors

## Future Enhancements

- Custom form fields
- Referral code support
- Welcome bonus stamps
- Email verification
- SMS verification
- GDPR compliance checkboxes
- Terms acceptance

## Testing Requirements

- [ ] Form validation tests
- [ ] User creation tests
- [ ] Platform detection tests
- [ ] Pass generation integration tests
- [ ] Error handling tests

