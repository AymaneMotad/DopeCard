import { 
  text, 
  pgTable, 
  uuid, 
  timestamp, 
  pgEnum, 
  integer,
  boolean,
  jsonb,
  unique,
  primaryKey,
  type PgTableWithColumns
} from "drizzle-orm/pg-core";

// Enhanced Enums
export const roleEnum = pgEnum('role', ['admin', 'commercial', 'client', 'manager']);
export const platformEnum = pgEnum('platform', ['ios', 'android']);
export const passTypeEnum = pgEnum('pass_type', ['loyalty', 'coupon', 'eventTicket', 'boardingPass', 'generic']);
export const subscriptionPackEnum = pgEnum('subscription_pack', ['basic', 'premium', 'enterprise']);

// Enhanced Users table with role management
export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  role: roleEnum("role").notNull(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  password: text("password"),
  phoneNumber: text("phone_number").unique(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Customer table
export const customer: PgTableWithColumns<any> = pgTable("customer", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().unique().references(() => users.id),
  email: text("email").notNull().unique(),
  phoneNumber: text("phone_number").unique(),
  username: text("username").notNull().unique(),
  referralCode: text("referral_code").unique(),
  referredBy: uuid("referred_by").references(() => customer.id),
  clientId: uuid("client_id").references(() => client.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Commercial Agents table
export const commercialAgent = pgTable("commercial_agents", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  assignedTerritory: text("assigned_territory"),
  targetQuota: integer("target_quota"),
  commissionRate: integer("commission_rate"),
  totalDeals: integer("total_deals").default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Enhanced Clients table
export const client = pgTable("clients", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  commercialAgentId: uuid("commercial_agent_id").references(() => commercialAgent.id),
  businessName: text("business_name").notNull(),
  businessType: text("business_type"),
  subscriptionPack: subscriptionPackEnum("subscription_pack").notNull(),
  maxManagers: integer("max_managers").notNull().default(1),
  active: boolean("active").notNull().default(true),
  settings: jsonb("settings"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Managers table (for client staff)
export const managers = pgTable("managers", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  clientId: uuid("client_id").notNull().references(() => client.id),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pass Templates (Different types of passes for each client)
export const passTemplates = pgTable("pass_templates", {
  id: uuid().primaryKey().defaultRandom(),
  clientId: uuid("client_id").notNull().references(() => client.id),
  name: text("name").notNull(),
  type: passTypeEnum("type").notNull(),
  design: jsonb("design").notNull(),
  settings: jsonb("settings"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// User Passes (Actual passes issued to users)
export const userPasses = pgTable("user_passes", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  templateId: uuid("template_id").references(() => passTemplates.id), // Nullable for now - will be set when templates are created
  serialNumber: text("serial_number").notNull().unique(),
  status: text("status").notNull().default('active'),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pass Registrations (Device-specific registrations)
export const passRegistrations = pgTable('pass_registrations', {
  id: uuid().primaryKey().defaultRandom(),
  passId: uuid("pass_id").notNull().references(() => userPasses.id),
  pushToken: text("push_token").notNull(),
  deviceLibraryIdentifier: text("device_library_identifier").notNull(),
  platform: platformEnum("platform").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Pass Updates (Track pass update history)
export const passUpdates = pgTable("pass_updates", {
  id: uuid().primaryKey().defaultRandom(),
  passId: uuid("pass_id").notNull().references(() => userPasses.id),
  metadata: jsonb("metadata").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

