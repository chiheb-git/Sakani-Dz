import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../artifacts/api-server/.env") });

async function main() {
  const { sql } = await import("drizzle-orm");
  const { db, pool } = await import("@workspace/db");

  console.log("Nettoyage des donnees applicatives...");
  await db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE TABLE history_entries, favorites, reports, properties, sites, tourist_spots RESTART IDENTITY`);
  });
  console.log("Tables videes : history_entries, favorites, reports, properties, sites, tourist_spots.");
  console.log("Tables preservees : vendors, clients, admin_users, subscriptions.");

  await pool.end();
}

main().catch((error) => {
  console.error("Erreur pendant le nettoyage :", error);
  process.exitCode = 1;
});
