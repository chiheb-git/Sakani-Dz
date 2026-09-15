import { pool } from "@workspace/db";
import { logger } from "./logger";

const REMINDER_DAYS = [7, 3, 1] as const;

export async function ensureReminderTables(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS vendor_push_tokens (
      vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      token TEXT PRIMARY KEY,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS vendor_subscription_reminders (
      vendor_id INTEGER NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
      reminder_days INTEGER NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      PRIMARY KEY (vendor_id, reminder_days, expires_at)
    );
  `);
}

export async function registerVendorPushToken(vendorId: number, token: string): Promise<void> {
  await pool.query(
    `INSERT INTO vendor_push_tokens (vendor_id, token) VALUES ($1, $2)
     ON CONFLICT (token) DO UPDATE SET vendor_id = EXCLUDED.vendor_id, updated_at = NOW()`,
    [vendorId, token],
  );
}

async function sendExpoNotification(token: string, days: number): Promise<void> {
  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      to: token,
      title: "Rappel Sakani Dz",
      body: `Votre abonnement vendeur expire dans ${days} jour${days > 1 ? "s" : ""}. Pensez à le renouveler.`,
      data: { type: "vendor_subscription_reminder", days },
    }),
  });
  if (!response.ok) throw new Error(`Expo push failed with status ${response.status}`);
}

export async function sendDueVendorSubscriptionReminders(now = new Date()): Promise<void> {
  for (const days of REMINDER_DAYS) {
    const result = await pool.query<{ vendorId: number; expiresAt: Date; token: string }>(
      `SELECT v.id AS "vendorId", v.subscription_expires_at AS "expiresAt", t.token
       FROM vendors v JOIN vendor_push_tokens t ON t.vendor_id = v.id
       WHERE v.status = 'active'
         AND v.subscription_expires_at > $1::timestamptz + ($2 * INTERVAL '1 day') - INTERVAL '1 hour'
         AND v.subscription_expires_at <= $1::timestamptz + ($2 * INTERVAL '1 day') + INTERVAL '1 hour'
         AND NOT EXISTS (
           SELECT 1 FROM vendor_subscription_reminders r
           WHERE r.vendor_id = v.id AND r.reminder_days = $2 AND r.expires_at = v.subscription_expires_at
         )`,
      [now, days],
    );

    for (const reminder of result.rows) {
      try {
        await sendExpoNotification(reminder.token, days);
        await pool.query(
          `INSERT INTO vendor_subscription_reminders (vendor_id, reminder_days, expires_at)
           VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
          [reminder.vendorId, days, reminder.expiresAt],
        );
      } catch (error) {
        logger.error({ error, vendorId: reminder.vendorId, days }, "Vendor subscription reminder failed");
      }
    }
  }
}

export function startVendorReminderJob(): NodeJS.Timeout {
  const run = () => sendDueVendorSubscriptionReminders().catch((error) => logger.error({ error }, "Reminder job failed"));
  void run();
  return setInterval(run, 60 * 60 * 1000);
}