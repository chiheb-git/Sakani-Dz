import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { propertiesTable } from "./properties";
import { clientsTable } from "./clients";

export const reportsTable = pgTable("reports", {
  id: serial("id").primaryKey(),
  propertyId: integer("property_id")
    .notNull()
    .references(() => propertiesTable.id),
  clientId: integer("client_id").references(() => clientsTable.id),
  reason: text("reason").notNull(),
  details: text("details"),
  status: text("status").notNull().default("pending"), // pending | resolved | dismissed
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Report = typeof reportsTable.$inferSelect;
