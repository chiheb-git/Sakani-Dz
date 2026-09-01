import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const vendorsTable = pgTable("vendors", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address"),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  code: text("code").unique(),
  passwordHash: text("password_hash"),
  // pending | active | renewal_required | blocked | rejected
  status: text("status").notNull().default("pending"),
  allowedPropertyTypes: text("allowed_property_types").array().notNull().default([]),
  isVerified: boolean("is_verified").notNull().default(false),
  lastAccessAt: timestamp("last_access_at", { withTimezone: true }),
  blockedAt: timestamp("blocked_at", { withTimezone: true }),
  subscriptionExpiresAt: timestamp("subscription_expires_at", { withTimezone: true }),
  totalViews: integer("total_views").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertVendorSchema = createInsertSchema(vendorsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type Vendor = typeof vendorsTable.$inferSelect;
