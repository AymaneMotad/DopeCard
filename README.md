# Dope Card - Digital Loyalty Card Platform

A comprehensive SaaS platform for creating and managing digital loyalty cards for Apple Wallet and Google Pay.

## 🚀 Quick Start

### 1. Setup Database

```bash
# Make sure DATABASE_URL is set in .env
npx drizzle-kit push
```

### 2. Create Admin User

```bash
npm run create-admin
```

### 3. Start Development

```bash
npm run dev
```

### 4. Login & Create Cards

- **Login**: http://localhost:3000/admin/login
- **Create Card**: http://localhost:3000/cards/create
- **Dashboard**: http://localhost:3000/homeDashboard
- **Scanner**: http://localhost:3000/scanner

## 📚 Documentation

- **Routes**: See [ROUTES_REFERENCE.md](./ROUTES_REFERENCE.md) - Complete route guide
- **Setup**: See [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Detailed setup instructions
- **Quick Start**: See [QUICK_START.md](./QUICK_START.md) - Get started fast
- **Database**: See [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Migration guide
- **Implementation**: See [IMPLEMENTATION_SUMMARY.md](./IMPLEMENTATION_SUMMARY.md) - What's built

## 🎯 Key Features

- ✅ Card Creation System (5-step workflow)
- ✅ Apple Wallet & Google Pay Integration
- ✅ Scanner App for Managers/Staff
- ✅ Customer Management
- ✅ Analytics Dashboard
- ✅ Push Notifications (structure ready)
- ✅ Apple Wallet Callbacks & Updates

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: tRPC, NextAuth
- **Database**: Neon PostgreSQL, Drizzle ORM
- **Testing**: Vitest, Testing Library
- **Deployment**: Vercel

## 📁 Project Structure

```
dope-card/
├── app/                    # Next.js pages
│   ├── admin/            # Admin routes
│   ├── cards/             # Card management
│   ├── scanner/           # Scanner app
│   ├── customers/         # Customer management
│   └── register/         # Customer registration
├── server/                # tRPC routers
├── db/                    # Database schema
├── modules/               # Modular structure
├── components/           # React components
├── .agentos/             # Spec-driven development
└── output/               # Test pass files (gitignored)
```

## 🧪 Testing

```bash
npm test              # Run tests
npm run test:watch    # Watch mode
npm run test:coverage # Coverage report
```

## 📝 Environment Variables

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for complete list.

Required:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `NEXTAUTH_SECRET` - NextAuth secret key
- `PASS_AUTH_TOKEN` - Apple Wallet auth token

## 🔒 Pre-commit Hooks

Pre-commit hooks run automatically:
- Linting (ESLint)
- Type checking (TypeScript)
- Code formatting

## 📦 Output Folder

The `/output/` folder is kept for testing `.pkpass` files locally:
- Generated passes are saved here
- Download and open on Mac to preview
- Files are gitignored, folder structure is kept

## 🎨 UI References

- **Scanner App**: See `/Scanner-App/` folder for UI inspiration
- **Card Designs**: See `/Different type of cards design/` folder
- **PDF Examples**: See `/Generated PDF once card created exampels/` folder

## 📖 Agent OS

This project uses spec-driven development with Agent OS:
- Standards: `.agentos/standards/`
- Product: `.agentos/product/`
- Specs: `.agentos/specs/`
- UI Elements: `.agentos/ui-elements/`

See [AGENTOS_INTEGRATION_GUIDE.md](./AGENTOS_INTEGRATION_GUIDE.md) for details.

## 🚢 Deployment

Deployed on Vercel with:
- Automatic builds on push
- Pre-commit hooks for quality
- Environment variables in Vercel dashboard

## 📞 Support

For issues or questions, check:
1. [ROUTES_REFERENCE.md](./ROUTES_REFERENCE.md) - Route documentation
2. [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Setup troubleshooting
3. [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md) - Database issues
