import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../artifacts/api-server/.env") });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db, pool, touristSpotsTable } = await import("@workspace/db");

  console.log("Seeding tourist spots...");

  const spotsData = [
    {
      name: "Casbah d'Alger",
      description: "Site classé au patrimoine mondial de l'UNESCO, ruelles labyrinthiques et architecture ottomane.",
      wilaya: "Alger",
      latitude: "36.7850000",
      longitude: "3.0608000",
      // No verified, place-specific Commons file has been registered for this legacy seed.
      photos: [],
    },
    {
      name: "Jardin d'Essai du Hamma",
      description: "Magnifique jardin botanique historique avec allées de palmiers et espaces verts.",
      wilaya: "Alger",
      latitude: "36.7469000",
      longitude: "3.0781000",
      photos: [],
    },
    {
      name: "Grande Mosquée d'Oran",
      description: "Architecture impressionnante en plein cœur de la ville, vue panoramique sur la baie.",
      wilaya: "Oran",
      latitude: "35.6987000",
      longitude: "-0.6349000",
      photos: [],
    },
    {
      name: "Fort de Santa Cruz",
      description: "Fort historique surplombant la ville d'Oran, panorama exceptionnel sur la Méditerranée.",
      wilaya: "Oran",
      latitude: "35.7089000",
      longitude: "-0.6467000",
      photos: [],
    },
    {
      name: "Grande Mosquée de Tlemcen",
      description: "Chef-d'œuvre de l'architecture almoravide datant du XIIe siècle.",
      wilaya: "Tlemcen",
      latitude: "34.8828000",
      longitude: "-1.3167000",
      photos: [],
    },
    {
      name: "Grottes de Beni Add",
      description: "Grottes naturelles spectaculaires avec formations calcaires, à quelques kilomètres de Tlemcen.",
      wilaya: "Tlemcen",
      latitude: "34.8567000",
      longitude: "-1.4008000",
      photos: [],
    },
  ];

  for (const s of spotsData) {
    const [existing] = await db.select().from(touristSpotsTable).where(eq(touristSpotsTable.name, s.name));
    if (existing) {
      console.log(`Lieu "${s.name}" déjà existant, ignoré`);
      continue;
    }
    const [spot] = await db.insert(touristSpotsTable).values(s).returning();
    console.log(`Lieu créé : ${spot.name} (id=${spot.id}) - ${spot.wilaya}`);
  }

  console.log("Seed terminé avec succès !");
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur pendant le seed :", err);
  process.exit(1);
});
