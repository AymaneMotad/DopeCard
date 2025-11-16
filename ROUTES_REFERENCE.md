# Routes Reference Guide

Complete guide to all routes and pages in the application.

## Public Routes (No Authentication Required)

### Customer Registration
- **`/register/[cardId]`** - Dynamic registration page for customers
  - Example: `/register/123e4567-e89b-12d3-a456-426614174000`
  - Customers scan QR code or click link to register
  - Collects: name, email, phone number
  - Generates and downloads pass (iOS/Android)

- **`/Registration`** - Legacy registration page (still works)
  - Generic registration without card template
  - Same functionality as above

### Pass Download
- **`/passes/[filename]`** - Download generated .pkpass files
  - Used for testing pass files locally
  - Example: `/passes/test-pass.pkpass`

## Admin Routes (Authentication Required)

### Authentication
- **`/admin/login`** - Admin login page
  - Only admin users can login
  - Uses NextAuth credentials provider
  - Redirects to `/homeDashboard` after login

### Dashboard
- **`/homeDashboard`** - Main admin dashboard
  - Overview metrics (customers, cards, activity)
  - Customer statistics
  - Recent activity feed
  - Quick links to create cards and scanner

### Card Management
- **`/cards`** - List all cards
  - View all created card templates
  - Filter and search cards
  - Quick actions (view, edit, delete)

- **`/cards/create`** - Create new card (5-step workflow)
  1. Select Card Type (Stamps, Points, Discount)
  2. Configure Settings (Expiration, Language)
  3. Customize Design (Logo, Colors, Icons)
  4. Add Information (Title, Business Name, Rewards)
  5. Save & Preview (Generate QR, Activate)

- **`/cards/[id]`** - Card details page
  - View card information
  - Generate QR code and distribution link
  - Activate/deactivate card
  - Edit card settings

### Scanner App
- **`/scanner`** - Scanner app for managers/staff
  - Scan customer QR codes
  - Search customers by name/phone
  - Add stamps/points
  - Redeem rewards
  - View transaction history

### Customer Management
- **`/customers`** - Customer list
  - View all registered customers
  - Search by name, email, or phone
  - Filter and sort options

- **`/customers/[id]`** - Customer details
  - View customer information
  - See all passes for customer
  - View transaction history
  - Edit customer details

### User Management (Admin Only)
- **`/createUsers`** - Create users (admin only)
  - Create admin, client, commercial, or manager users
  - Role-specific fields
  - Password management

## API Routes

### Authentication API
- **`/api/auth/[...nextauth]`** - NextAuth endpoints
  - GET/POST `/api/auth/signin` - Sign in
  - GET/POST `/api/auth/signout` - Sign out
  - GET `/api/auth/session` - Get session
  - GET/POST `/api/auth/callback` - OAuth callback

### tRPC API
- **`/api/trpc/[trpc]`** - tRPC endpoint
  - All tRPC procedures accessible here
  - Type-safe API calls

### Apple Wallet API (Web Service)
- **`/api/passes/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]/[serialNumber]`**
  - POST - Register device for pass updates
  - DELETE - Unregister device

- **`/api/passes/v1/devices/[deviceLibraryIdentifier]/registrations/[passTypeIdentifier]`**
  - GET - Get list of updated passes

- **`/api/passes/v1/passes/[passTypeIdentifier]/[serialNumber]`**
  - GET - Get latest version of pass

- **`/api/passes/v1/log`**
  - POST - Receive error logs from Apple devices

### Upload API
- **`/api/uploadthing/[...slug]`** - File upload endpoint
  - Used for logo/icon uploads

## tRPC Procedures Reference

### Users Router (`trpc.users.*`)
- `create` - Create customer and generate pass
- `addPass` - Register pass on device

### Cards Router (`trpc.cards.*`)
- `create` - Create new card template
- `getAll` - Get all cards for client
- `getById` - Get card by ID
- `update` - Update card template
- `delete` - Delete card template
- `activate` - Activate card
- `generateDistribution` - Generate QR code and link

### Scanner Router (`trpc.scanner.*`)
- `scanQR` - Scan QR code and get customer
- `lookupCustomer` - Search customers
- `addStamps` - Add stamps/points to pass
- `redeemReward` - Redeem reward
- `getRecentTransactions` - Get transaction history

### Passes Router (`trpc.passes.*`)
- `updatePass` - Update pass metadata
- `getPassBySerial` - Get pass by serial number
- `getUserPasses` - Get all passes for user
- `getPassRegistrations` - Get device registrations

### Analytics Router (`trpc.analytics.*`)
- `getOverview` - Get dashboard overview metrics
- `getCustomerStats` - Get customer statistics
- `getRecentActivity` - Get recent activity

### Notifications Router (`trpc.notifications.*`)
- `sendManual` - Send push notification to specific pass
- `sendToAll` - Send push notification to all customers
- `getHistory` - Get notification history

### Customers Router (`trpc.customers.*`)
- `getAll` - Get all customers (with search)
- `getById` - Get customer by ID
- `update` - Update customer
- `delete` - Delete customer
- `getCustomerPass` - Get customer's passes

### Admin Router (`trpc.admin.*`)
- `createUser` - Create user (admin only)
- `getAllUsers` - Get all users (admin only)
- `deleteUser` - Delete user (admin only)
- `getAllClients` - Get all clients
- `getAllManagers` - Get all managers

## Quick Start Guide

### For Admin Users

1. **Login**: Go to `/admin/login`
   - Use admin credentials
   - Only admin role can login

2. **Create Your First Card**: Go to `/cards/create`
   - Follow 5-step workflow
   - Generate QR code
   - Share with customers

3. **View Dashboard**: Go to `/homeDashboard`
   - See metrics and analytics
   - Monitor activity

4. **Manage Customers**: Go to `/customers`
   - View all registered customers
   - Search and filter

5. **Use Scanner**: Go to `/scanner`
   - Scan customer QR codes
   - Add stamps/redeem rewards

### For Customers

1. **Register**: Scan QR code or visit `/register/[cardId]`
   - Enter name, email, phone
   - Download pass to wallet

2. **Use Pass**: Show QR code to staff
   - Staff scans at `/scanner`
   - Stamps added automatically
   - Pass updates in wallet

## Testing Routes

### Local Testing
- **`/output/`** - Test pass files folder (kept for testing)
  - Generated `.pkpass` files are saved here
  - Download and open on Mac to preview in Wallet app
  - Folder is kept in git, files are gitignored
  - Example: `/output/ADSK2D-sdsds-pass.pkpass`

### Development
- **`/createPass`** - Legacy test page (can be removed)
- **`/createUsers`** - Create test users

## Environment Variables

Required in `.env`:
```env
# Database
DATABASE_URL=your-neon-database-url

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Pass Authentication
PASS_AUTH_TOKEN=your-secure-token

# Base URL (optional - auto-detected on Vercel)
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

## Navigation Flow

```
Admin Login → Dashboard → Create Card → Generate QR → Share
                                    ↓
                            Customer Scans QR
                                    ↓
                            Customer Registers
                                    ↓
                            Pass Added to Wallet
                                    ↓
                            Staff Scans at Scanner
                                    ↓
                            Stamps Added → Pass Updates
```
