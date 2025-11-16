# Quick Start Guide

## 🚀 Getting Started

### 1. Database Setup (Neon)

**You need to run migrations to create tables in Neon:**

```bash
# Make sure DATABASE_URL is set in .env
npx drizzle-kit push
```

This will create all tables in your Neon database.

**To verify tables were created:**
- Go to your Neon dashboard (https://console.neon.tech)
- Open SQL Editor
- Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- You should see: users, clients, customer, managers, commercial_agents, pass_templates, user_passes, pass_registrations, pass_updates

### 2. Create Admin User

```bash
npm run create-admin
```

Follow the prompts to create your admin account.

### 3. Start Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

## 📍 Key Routes

### Login
**http://localhost:3000/admin/login**
- Login with admin credentials you created

### Dashboard (After Login)
**http://localhost:3000/homeDashboard**
- View metrics and analytics
- Quick access to all features

### Create Card
**http://localhost:3000/cards/create**
- 5-step card creation workflow
- Create stamps, points, or discount cards

### View Cards
**http://localhost:3000/cards**
- List all your cards
- Click to view details and generate QR codes

### Scanner App
**http://localhost:3000/scanner**
- For managers/staff to scan customer QR codes
- Add stamps and redeem rewards

### Customer Management
**http://localhost:3000/customers**
- View all registered customers
- Search and filter customers

## 🔄 Complete Flow

1. **Login** → `/admin/login`
2. **Create Card** → `/cards/create`
3. **Get QR Code** → `/cards/[id]` → Click "Generate QR Code"
4. **Share QR** → Customer scans or clicks link
5. **Customer Registers** → `/register/[cardId]`
6. **Pass Generated** → Customer downloads to wallet
7. **Staff Scans** → `/scanner` → Scan customer QR
8. **Add Stamps** → Stamps added, pass updates automatically

## 🧪 Testing Pass Files

The `/output/` folder is kept for testing:
- Generated `.pkpass` files are saved here
- Download and open on Mac to preview
- Files are gitignored, folder is kept

## 📚 Full Documentation

- **Routes**: See `ROUTES_REFERENCE.md`
- **Setup**: See `SETUP_GUIDE.md`
- **Implementation**: See `IMPLEMENTATION_SUMMARY.md`

