import "dotenv/config";
import app from "./app";
import { logger } from "./lib/logger";
import { ensureReminderTables, startVendorReminderJob } from "./lib/vendor-reminders";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

void ensureReminderTables().then(() => app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
  startVendorReminderJob();
})).catch((error) => {
  logger.error({ error }, "Unable to initialize reminder tables");
  process.exit(1);
});
