import { pgTable, serial, integer, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { vendorsTable } from "./vendors";
import { sitesTable } from "./sites";

export const propertiesTable = pgTable("properties", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendorsTable.id),
  type: text("type").notNull(), // apartment | villa
  apartmentType: text("apartment_type"), // F1 | F2 | F3 | F4 | F5
  description: text("description"),
  equipment: text("equipment").array().notNull().default([]),
  price: numeric("price", { precision: 12, scale: 2 }).notNull(),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  photos: text("photos").array().notNull().default([]),
  status: text("status").notNull().default("available"), // available | rented
  wilaya: text("wilaya").notNull(),
  siteId: integer("site_id").references(() => sitesTable.id),
  views: integer("views").notNull().default(0),
  isFeatured: boolean("is_featured").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertPropertySchema = createInsertSchema(propertiesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof propertiesTable.$inferSelect;
