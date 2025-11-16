# Scanner App UI Patterns

## Overview

The scanner app is used by managers and staff (e.g., coffee shop employees) to scan customer loyalty cards and add stamps/points.

## UI Reference

**Location**: `/Scanner-App/` folder contains 9 reference images showing UI patterns and designs.

## Key UI Elements

### Home Screen
- Large "Scan" button (center, prominent)
- Recent scans list (quick access)
- Customer search bar
- Settings icon

### Scan Flow
1. Tap "Scan" button
2. Camera activates (full screen)
3. Point at customer's QR code
4. Card appears with customer name
5. Select action: Add stamps/points or Redeem reward
6. Confirm transaction
7. Success feedback

### Customer Card Display
- Customer name
- Current balance/stamps
- Last visit date
- Quick action buttons

### Actions
- Add stamps/points
- Redeem rewards
- View transaction history
- Manual entry (if scan fails)

## Design Principles

1. **Large Touch Targets**: Buttons should be easy to tap
2. **High Contrast**: Readable in various lighting conditions
3. **Simple Navigation**: Minimal steps to complete action
4. **Visual Feedback**: Clear success/error states
5. **Offline Support**: Visual indicator when offline

## Technical Implementation

### Page Location
`app/scanner/page.tsx`

### Key Features
- Camera access (WebRTC)
- QR code scanning
- Offline mode with sync
- Transaction history
- Customer lookup

### Components Needed
- `Scanner` - Camera and QR scanning
- `CustomerCard` - Display customer info
- `TransactionForm` - Add stamps/points
- `RecentScans` - List of recent transactions
- `OfflineIndicator` - Show offline status

## Responsive Design

- Mobile-first design
- Optimized for tablet use
- Landscape orientation support
- Touch-friendly interface

## Accessibility

- Large text sizes
- High contrast colors
- Voice feedback (optional)
- Keyboard navigation support

## Performance

- Fast camera activation (< 1 second)
- Quick scan recognition (< 2 seconds)
- Smooth animations
- Optimized for low-end devices

