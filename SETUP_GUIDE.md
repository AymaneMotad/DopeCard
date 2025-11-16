# Setup Guide

Quick guide to get your project running.

## Prerequisites

- Node.js 18.17+ (you have 18.16, but should work)
- Neon PostgreSQL database account
- npm or pnpm installed

## Step 1: Environment Variables

Create or update `.env` file in project root:

```env
# Database (Neon PostgreSQL)
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-a-random-secret-key-here

# Pass Authentication Token (for Apple Wallet)
PASS_AUTH_TOKEN=generate-a-secure-random-token-here

# Base URL (optional - auto-detected on Vercel)
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### Generate Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate PASS_AUTH_TOKEN
openssl rand -hex 32
```

## Step 2: Install Dependencies

```bash
npm install
# or
pnpm install
```

## Step 3: Setup Neon Database

1. **Create Neon Database**:
   - Go to https://neon.tech
   - Create a new project
   - Copy the connection string
   - Add it to `.env` as `DATABASE_URL`

2. **Run Migrations**:
   ```bash
   # Generate migration (already done)
   npx drizzle-kit generate
   
   # Push to database
   npx drizzle-kit push
   ```
   
   This creates all tables in your Neon database.

3. **Verify Tables**:
   Check Neon dashboard - you should see:
   - users
   - clients
   - customer
   - managers
   - commercial_agents
   - pass_templates
   - user_passes
   - pass_registrations
   - pass_updates

## Step 4: Create Admin User

```bash
npm run create-admin
```

Follow prompts to create your first admin user.

## Step 5: Start Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## Step 6: Login and Start Using

1. **Login**: Go to http://localhost:3000/admin/login
   - Use the admin credentials you just created

2. **Create Your First Card**: 
   - After login, go to http://localhost:3000/cards/create
   - Follow the 5-step workflow
   - Generate QR code

3. **Test Registration**:
   - Copy the registration link from card details
   - Open in browser (or scan QR code)
   - Register a test customer
   - Download pass to wallet

4. **Test Scanner**:
   - Go to http://localhost:3000/scanner
   - Scan customer QR code (or enter manually)
   - Add stamps
   - Verify pass updates

## Routes Quick Reference

### Public Routes
- `/register/[cardId]` - Customer registration
- `/Registration` - Legacy registration

### Admin Routes (Login Required)
- `/admin/login` - Admin login
- `/homeDashboard` - Dashboard
- `/cards` - List cards
- `/cards/create` - Create card
- `/cards/[id]` - Card details
- `/scanner` - Scanner app
- `/customers` - Customer list
- `/customers/[id]` - Customer details
- `/createUsers` - Create users (admin only)

See `ROUTES_REFERENCE.md` for complete route documentation.

## Testing

### Run Tests
```bash
npm test
```

### Test Pass Generation Locally
- Generated passes are saved to `/output/` folder
- Download `.pkpass` files from `/output/`
- Open on Mac to preview in Wallet app
- Folder is kept for testing, files are gitignored

## Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Check Neon dashboard for connection status
- Ensure SSL mode is enabled (`?sslmode=require`)

### Migration Issues
- Run `npx drizzle-kit push` to sync schema
- Verify tables exist in Neon dashboard
- Check migration files in `/drizzle/` folder

### Authentication Issues
- Ensure `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Verify admin user exists in database

### Pass Generation Issues
- Check certificate URLs are accessible
- Verify environment variables are set
- Check console logs for errors

## Database Migration Status

To check if migrations are applied:

1. **Check Migration Files**:
   - Look in `/drizzle/` folder
   - Latest migration: `0000_young_black_tarantula.sql`

2. **Apply Migrations**:
   ```bash
   npx drizzle-kit push
   ```

3. **Verify in Neon Dashboard**:
   - Go to your Neon project
   - Check SQL Editor
   - Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
   - Should see all 9 tables

## Next Steps

1. ✅ Setup database (Neon)
2. ✅ Run migrations
3. ✅ Create admin user
4. ✅ Create first card
5. ✅ Test registration flow
6. ✅ Test scanner app
7. ✅ Deploy to Vercel

## Deployment to Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

Vercel will automatically:
- Run `npm run test:ci` before build
- Build the project
- Deploy to production
