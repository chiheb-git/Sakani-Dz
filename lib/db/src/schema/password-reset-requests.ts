import { pgTable, serial, integer, text, timestamp } from "drizzle-orm/pg-core";
import { vendorsTable } from "./vendors";

export const passwordResetRequestsTable = pgTable("password_reset_requests", {
  id: serial("id").primaryKey(),
  vendorId: integer("vendor_id")
    .notNull()
    .references(() => vendorsTable.id),
  newPassword: text("new_password").notNull(),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PasswordResetRequest = typeof passwordResetRequestsTable.$inferSelect;
