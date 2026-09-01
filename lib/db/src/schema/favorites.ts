import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients";
import { propertiesTable } from "./properties";

export const favoritesTable = pgTable("favorites", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clientsTable.id),
  propertyId: integer("property_id")
    .notNull()
    .references(() => propertiesTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Favorite = typeof favoritesTable.$inferSelect;
