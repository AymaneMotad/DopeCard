# Getting Started - Step by Step

## ✅ Step 1: Run Database Migration

**Your Neon database needs tables created. Run:**

```bash
npx drizzle-kit push
```

This will create all 9 tables in your Neon database.

**Verify it worked:**
- Go to Neon dashboard (https://console.neon.tech)
- Open SQL Editor
- Run: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
- Should see: users, clients, customer, managers, commercial_agents, pass_templates, user_passes, pass_registrations, pass_updates

## ✅ Step 2: Create Admin User

```bash
npm run create-admin
```

Enter:
- Email
- Username  
- Password

This creates your first admin account.

## ✅ Step 3: Start Server

```bash
npm run dev
```

Visit: http://localhost:3000

## ✅ Step 4: Login

**Go to:** http://localhost:3000/admin/login

- Enter the email and password you created
- Click "Sign in"
- You'll be redirected to the dashboard

## ✅ Step 5: Create Your First Card

**Go to:** http://localhost:3000/cards/create

Follow the 5 steps:
1. **Select Type** - Choose Stamps, Points, or Discount
2. **Settings** - Set expiration and language
3. **Design** - Add logo, colors
4. **Information** - Add card title, business name, reward details
5. **Save** - Generate QR code and activate

## ✅ Step 6: Test Registration

1. After creating card, go to card details page
2. Click "Generate QR Code & Link"
3. Copy the registration link
4. Open in browser (or scan QR)
5. Fill out registration form
6. Download pass to wallet

## ✅ Step 7: Test Scanner

1. **Go to:** http://localhost:3000/scanner
2. Enter the QR code data from customer's pass (format: `USER{userId}` or `COFFEE{userId}`)
3. Or search for customer by name
4. Add stamps
5. Verify pass updates

## 📍 All Important Routes

| Route | Purpose | Auth Required |
|-------|---------|---------------|
| `/admin/login` | Admin login | No |
| `/homeDashboard` | Dashboard | Yes |
| `/cards` | List cards | Yes |
| `/cards/create` | Create card | Yes |
| `/cards/[id]` | Card details | Yes |
| `/scanner` | Scanner app | Yes |
| `/customers` | Customer list | Yes |
| `/register/[cardId]` | Customer registration | No |
| `/createUsers` | Create users | Yes (admin) |

## 🧪 Testing Pass Files

The `/output/` folder is kept for testing:
- Generated `.pkpass` files are saved here
- Download files and open on Mac to preview
- Folder structure is kept, files are gitignored

## 🔍 Check Database Status

**To see if migrations ran:**

```bash
# Check if DATABASE_URL is set
echo $DATABASE_URL

# Or check .env file (if not gitignored)
cat .env | grep DATABASE_URL
```

**To apply migrations:**
```bash
npx drizzle-kit push
```

## ❓ Common Issues

### "Cannot connect to database"
- Check `DATABASE_URL` in `.env`
- Verify Neon database is running
- Check connection string format

### "Table doesn't exist"
- Run `npx drizzle-kit push`
- Check Neon dashboard for tables

### "Cannot login"
- Make sure admin user exists: `npm run create-admin`
- Check password is correct
- Verify user role is 'admin' in database

### "Tests failing"
- Run `npm install` to ensure all dependencies
- Check `vitest.config.mjs` exists (not `.ts`)

## 📚 More Help

- **Routes**: [ROUTES_REFERENCE.md](./ROUTES_REFERENCE.md)
- **Setup**: [SETUP_GUIDE.md](./SETUP_GUIDE.md)
- **Database**: [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md)

