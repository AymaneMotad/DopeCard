import { text, pgTable, uuid, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  phoneNumber: text("phone_number").notNull().unique(), // Use text type for phone numbers
  createdAt: timestamp("created_at").notNull().defaultNow(),
});


export const passRegistrations = pgTable('pass_registrations', {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id), // gives me error
  serialNumber: text('serial_number').notNull(),
  pushToken: text('push_token').notNull(),
  deviceLibraryIdentifier: text('device_library_identifier').notNull(),
  platform: pgEnum('platform', ['ios', 'android'])(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});