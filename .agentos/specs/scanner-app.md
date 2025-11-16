# Scanner App Specification

## Overview

The scanner app is a web-based application used by managers and staff to scan customer loyalty cards, add stamps/points, and redeem rewards. It's designed for use in-store (e.g., coffee shops, restaurants).

## Target Users

- Store managers
- Staff members
- Cashiers
- Service providers

## Core Features

### 1. QR Code Scanning
- Camera-based QR code scanning
- Real-time code recognition
- Support for multiple QR code formats
- Error handling for invalid codes

### 2. Customer Lookup
- Manual search by name
- Search by phone number
- Recent customers list
- Customer card display

### 3. Transaction Management
- Add stamps/points
- Redeem rewards
- Enter transaction amount (optional)
- Transaction confirmation
- Success/error feedback

### 4. Offline Support
- Offline mode with local storage
- Queue transactions when offline
- Auto-sync when connection restored
- Conflict resolution

### 5. Transaction History
- View recent transactions
- Filter by date/customer
- Search functionality
- Export capabilities (future)

## Technical Implementation

### Page Location
`app/scanner/page.tsx`

### Technology Stack
- Next.js App Router
- WebRTC for camera access
- IndexedDB for offline storage
- Service Worker for background sync
- tRPC for API calls

### API Endpoints (tRPC)

**Router**: `server/routers/scannerRouter.ts` (to be created)

Procedures:
- `scanQR`: Process QR code scan
- `lookupCustomer`: Find customer by name/phone
- `addStamps`: Add stamps/points to customer
- `redeemReward`: Redeem customer reward
- `getRecentTransactions`: Get transaction history
- `syncOfflineTransactions`: Sync queued transactions

### Database

Uses existing tables:
- `users` - Customer information
- `userPasses` - Customer passes
- `passUpdates` - Transaction history (to be enhanced)

## UI Design

### Reference Images
See `/Scanner-App/` folder for UI inspiration (9 images).

### Key UI Components

1. **Scanner Component**
   - Full-screen camera view
   - Scan button overlay
   - Flash toggle
   - Close/cancel button

2. **Customer Card Component**
   - Customer name
   - Current balance/stamps
   - Last visit date
   - Quick actions

3. **Transaction Form**
   - Stamps/points input
   - Transaction amount (optional)
   - Notes field (optional)
   - Confirm button

4. **Recent Scans List**
   - Customer name
   - Transaction type
   - Timestamp
   - Quick actions

5. **Offline Indicator**
   - Banner showing offline status
   - Queued transactions count
   - Sync status

## User Flow

### Scanning Flow
1. User opens scanner app
2. Taps "Scan" button
3. Camera activates
4. Points at customer's QR code
5. System recognizes code
6. Customer card appears
7. User selects action (add stamps/redeem)
8. Confirms transaction
9. Success feedback shown
10. Returns to home screen

### Manual Lookup Flow
1. User taps search bar
2. Enters customer name/phone
3. Results displayed
4. Selects customer
5. Customer card appears
6. Continues with transaction flow

## Security & Authentication

### Access Control
- Manager/staff authentication required
- Role-based permissions
- Session management
- Activity logging

### Data Protection
- Encrypt sensitive data
- Secure API calls
- Validate all inputs
- Rate limiting

## Performance Requirements

- Camera activation: < 1 second
- QR code recognition: < 2 seconds
- Transaction processing: < 2 seconds
- Offline sync: Background process

## Error Handling

### Common Errors
- Invalid QR code
- Customer not found
- Network error
- Camera permission denied
- Offline mode

### Error Messages
- Clear, user-friendly messages
- Actionable error handling
- Retry mechanisms
- Fallback options

## Testing Requirements

### Unit Tests
- [ ] QR code parsing
- [ ] Customer lookup logic
- [ ] Transaction validation
- [ ] Offline queue management

### Integration Tests
- [ ] Full scan flow
- [ ] Transaction processing
- [ ] Offline sync
- [ ] Error scenarios

### E2E Tests (Future)
- [ ] Complete user journey
- [ ] Offline/online transitions
- [ ] Error recovery

## Future Enhancements

- Batch scanning
- Voice commands
- Biometric authentication
- Advanced analytics
- Multi-language support
- Tablet optimization
- Receipt printing integration

