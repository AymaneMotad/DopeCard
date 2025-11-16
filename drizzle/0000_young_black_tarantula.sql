DO $$ BEGIN
 CREATE TYPE "public"."pass_type" AS ENUM('loyalty', 'coupon', 'eventTicket', 'boardingPass', 'generic');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."platform" AS ENUM('ios', 'android');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('admin', 'commercial', 'client', 'manager');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."subscription_pack" AS ENUM('basic', 'premium', 'enterprise');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"commercial_agent_id" uuid,
	"business_name" text NOT NULL,
	"business_type" text,
	"subscription_pack" "subscription_pack" NOT NULL,
	"max_managers" integer DEFAULT 1 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"settings" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "commercial_agents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"assigned_territory" text,
	"target_quota" integer,
	"commission_rate" integer,
	"total_deals" integer DEFAULT 0,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"phone_number" text,
	"username" text NOT NULL,
	"referral_code" text,
	"referred_by" uuid,
	"client_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customer_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "customer_email_unique" UNIQUE("email"),
	CONSTRAINT "customer_phone_number_unique" UNIQUE("phone_number"),
	CONSTRAINT "customer_username_unique" UNIQUE("username"),
	CONSTRAINT "customer_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "managers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pass_registrations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pass_id" uuid NOT NULL,
	"push_token" text NOT NULL,
	"device_library_identifier" text NOT NULL,
	"platform" "platform" NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pass_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"type" "pass_type" NOT NULL,
	"design" jsonb NOT NULL,
	"settings" jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pass_updates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pass_id" uuid NOT NULL,
	"metadata" jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_passes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"template_id" uuid,
	"serial_number" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_passes_serial_number_unique" UNIQUE("serial_number")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "role" NOT NULL,
	"email" text NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"phone_number" text,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_phone_number_unique" UNIQUE("phone_number")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clients" ADD CONSTRAINT "clients_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "clients" ADD CONSTRAINT "clients_commercial_agent_id_commercial_agents_id_fk" FOREIGN KEY ("commercial_agent_id") REFERENCES "public"."commercial_agents"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "commercial_agents" ADD CONSTRAINT "commercial_agents_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer" ADD CONSTRAINT "customer_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer" ADD CONSTRAINT "customer_referred_by_customer_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."customer"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "customer" ADD CONSTRAINT "customer_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "managers" ADD CONSTRAINT "managers_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "managers" ADD CONSTRAINT "managers_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pass_registrations" ADD CONSTRAINT "pass_registrations_pass_id_user_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."user_passes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pass_templates" ADD CONSTRAINT "pass_templates_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pass_updates" ADD CONSTRAINT "pass_updates_pass_id_user_passes_id_fk" FOREIGN KEY ("pass_id") REFERENCES "public"."user_passes"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_passes" ADD CONSTRAINT "user_passes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_passes" ADD CONSTRAINT "user_passes_template_id_pass_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."pass_templates"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
