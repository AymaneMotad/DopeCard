# Database Migration Guide

## Current Status

Your database schema is defined in `db/schema.ts`. To apply it to your Neon database, you need to run migrations.

## Migration Files

Migration files are in `/drizzle/` folder:
- `0001_add_password_to_users.sql` - Added password field
- `0002_remove_clerk_and_fix_references.sql` - Removed Clerk
- `0000_young_black_tarantula.sql` - Initial schema (latest)

## Apply Migrations to Neon

### Option 1: Using Drizzle Kit Push (Recommended)

```bash
# This will sync your schema to the database
npx drizzle-kit push
```

**What this does:**
- Compares your schema with database
- Creates missing tables
- Adds missing columns
- Updates constraints

### Option 2: Manual SQL Execution

1. Go to Neon Dashboard: https://console.neon.tech
2. Open SQL Editor
3. Copy contents of migration files from `/drizzle/` folder
4. Execute them in order

### Option 3: Using Drizzle Migrate (For Production)

```bash
# Generate migration
npx drizzle-kit generate

# Apply migration
npx drizzle-kit migrate
```

## Verify Migration

After running migrations, verify tables exist:

```sql
-- Run in Neon SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Expected Tables:**
1. clients
2. commercial_agents
3. customer
4. managers
5. pass_registrations
6. pass_templates
7. pass_updates
8. user_passes
9. users

## Schema Changes Made

### Latest Changes
- `user_passes.template_id` - Made nullable (can be null until templates are created)

### To Apply This Change

If you already have the database, you may need to run:

```sql
ALTER TABLE user_passes 
ALTER COLUMN template_id DROP NOT NULL;
```

Or use `drizzle-kit push` which will handle it automatically.

## Troubleshooting

### "Table already exists" Error
- This is normal if tables were created before
- Drizzle will skip existing tables
- Check that all tables exist

### Connection Issues
- Verify `DATABASE_URL` in `.env`
- Check Neon dashboard for connection status
- Ensure SSL mode is enabled: `?sslmode=require`

### Migration Fails
- Check Neon dashboard logs
- Verify you have write permissions
- Try running migrations one at a time

## Next Steps After Migration

1. ✅ Verify all 9 tables exist
2. ✅ Create admin user: `npm run create-admin`
3. ✅ Test login: `/admin/login`
4. ✅ Create first card: `/cards/create`
5. ✅ Test registration flow

