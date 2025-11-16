-- Drop the auth table
DROP TABLE IF EXISTS "auth";

-- Remove clerk_id column from users table
ALTER TABLE "users" DROP COLUMN IF EXISTS "clerk_id"; 