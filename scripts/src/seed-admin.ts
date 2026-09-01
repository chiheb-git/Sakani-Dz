import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../artifacts/api-server/.env") });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db, pool, adminUsersTable } = await import("@workspace/db");
  const bcrypt = await import("bcryptjs");

  const existing = await db.select().from(adminUsersTable);
  const passwordHash = await bcrypt.default.hash("Admin1234", 12);

  if (existing.length > 0) {
    await db.update(adminUsersTable).set({ passwordHash }).where(eq(adminUsersTable.id, existing[0].id));
    console.log("Mot de passe réinitialisé : Admin1234");
  } else {
    await db.insert(adminUsersTable).values({ passwordHash });
    console.log("Admin créé avec le mot de passe : Admin1234");
  }

  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur :", err);
  process.exit(1);
});