import { pgTable, serial, text, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const touristSpotsTable = pgTable("tourist_spots", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  wilaya: text("wilaya").notNull(),
  description: text("description"),
  latitude: numeric("latitude", { precision: 10, scale: 7 }),
  longitude: numeric("longitude", { precision: 10, scale: 7 }),
  photos: text("photos").array().notNull().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertTouristSpotSchema = createInsertSchema(touristSpotsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTouristSpot = z.infer<typeof insertTouristSpotSchema>;
export type TouristSpot = typeof touristSpotsTable.$inferSelect;
