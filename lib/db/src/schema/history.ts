import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { clientsTable } from "./clients";
import { propertiesTable } from "./properties";
import { touristSpotsTable } from "./tourist-spots";

export const historyEntriesTable = pgTable("history_entries", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clientsTable.id),
  propertyId: integer("property_id").references(() => propertiesTable.id),
  touristSpotId: integer("tourist_spot_id").references(() => touristSpotsTable.id),
  entryType: text("entry_type").notNull(), // property | tourist_spot
  viewedAt: timestamp("viewed_at", { withTimezone: true }).notNull().defaultNow(),
});

export type HistoryEntry = typeof historyEntriesTable.$inferSelect;
