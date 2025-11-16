-- Drop the auth table if it exists
DROP TABLE IF EXISTS "auth";

-- Remove clerk_id column from users table if it exists
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_id";

-- Ensure pass_id column exists in pass_registrations
ALTER TABLE "pass_registrations" 
  ADD COLUMN IF NOT EXISTS "pass_id" uuid REFERENCES "user_passes"("id");

-- Update any existing records if needed
UPDATE "pass_registrations" 
SET "pass_id" = "user_id" 
WHERE "pass_id" IS NULL AND "user_id" IS NOT NULL;

-- Drop the user_id column from pass_registrations if it exists
ALTER TABLE "pass_registrations" DROP COLUMN IF EXISTS "user_id"; 