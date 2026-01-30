BEGIN;

-- Prepare updated role enum and move role column to text for safe updates
DO $$ BEGIN
  CREATE TYPE "public"."role_new" AS ENUM ('admin', 'commercial', 'business', 'manager', 'customer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "users"
  ALTER COLUMN "role" TYPE text USING "role"::text;

-- Rename clients table to businesses
ALTER TABLE "clients" RENAME TO "businesses";

-- Rename foreign key columns to business_id
ALTER TABLE "customer" RENAME COLUMN "client_id" TO "business_id";
ALTER TABLE "managers" RENAME COLUMN "client_id" TO "business_id";
ALTER TABLE "pass_templates" RENAME COLUMN "client_id" TO "business_id";

-- Map existing client roles to business/customer using business ownership
UPDATE "users"
SET "role" = 'business'
WHERE "role" = 'client' AND "id" IN (SELECT "user_id" FROM "businesses");

UPDATE "users"
SET "role" = 'customer'
WHERE "role" = 'client' AND "id" NOT IN (SELECT "user_id" FROM "businesses");

ALTER TABLE "users"
  ALTER COLUMN "role" TYPE "role_new" USING "role"::text::role_new;

DROP TYPE IF EXISTS "public"."role";
ALTER TYPE "public"."role_new" RENAME TO "role";

-- Drop old foreign key constraints (if they exist)
ALTER TABLE "customer" DROP CONSTRAINT IF EXISTS "customer_client_id_clients_id_fk";
ALTER TABLE "managers" DROP CONSTRAINT IF EXISTS "managers_client_id_clients_id_fk";
ALTER TABLE "pass_templates" DROP CONSTRAINT IF EXISTS "pass_templates_client_id_clients_id_fk";
ALTER TABLE "businesses" DROP CONSTRAINT IF EXISTS "clients_user_id_users_id_fk";
ALTER TABLE "businesses" DROP CONSTRAINT IF EXISTS "clients_commercial_agent_id_commercial_agents_id_fk";

-- Recreate foreign key constraints with new names
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_user_id_users_id_fk"
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "businesses" ADD CONSTRAINT "businesses_commercial_agent_id_commercial_agents_id_fk"
  FOREIGN KEY ("commercial_agent_id") REFERENCES "public"."commercial_agents"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "customer" ADD CONSTRAINT "customer_business_id_businesses_id_fk"
  FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "managers" ADD CONSTRAINT "managers_business_id_businesses_id_fk"
  FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;

ALTER TABLE "pass_templates" ADD CONSTRAINT "pass_templates_business_id_businesses_id_fk"
  FOREIGN KEY ("business_id") REFERENCES "public"."businesses"("id") ON DELETE no action ON UPDATE no action;

COMMIT;
