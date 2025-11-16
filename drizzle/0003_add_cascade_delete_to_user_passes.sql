-- Add CASCADE delete to user_passes foreign key constraint
-- This allows deleting users even if they have related passes
-- The passes will be automatically deleted when the user is deleted

-- Drop the existing foreign key constraint
ALTER TABLE "user_passes" 
  DROP CONSTRAINT IF EXISTS "user_passes_user_id_users_id_fk";

-- Re-add the foreign key constraint with CASCADE delete
ALTER TABLE "user_passes" 
  ADD CONSTRAINT "user_passes_user_id_users_id_fk" 
  FOREIGN KEY ("user_id") 
  REFERENCES "users"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

-- Also add CASCADE to pass_registrations and pass_updates for consistency
-- Drop existing constraints
ALTER TABLE "pass_registrations" 
  DROP CONSTRAINT IF EXISTS "pass_registrations_pass_id_user_passes_id_fk";

ALTER TABLE "pass_updates" 
  DROP CONSTRAINT IF EXISTS "pass_updates_pass_id_user_passes_id_fk";

-- Re-add with CASCADE
ALTER TABLE "pass_registrations" 
  ADD CONSTRAINT "pass_registrations_pass_id_user_passes_id_fk" 
  FOREIGN KEY ("pass_id") 
  REFERENCES "user_passes"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

ALTER TABLE "pass_updates" 
  ADD CONSTRAINT "pass_updates_pass_id_user_passes_id_fk" 
  FOREIGN KEY ("pass_id") 
  REFERENCES "user_passes"("id") 
  ON DELETE CASCADE 
  ON UPDATE CASCADE;

