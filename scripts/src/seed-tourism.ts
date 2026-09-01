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
      photos: ["https://images.unsplash.com/photo-1570939274-4f1d5a6a5f77?w=800"],
    },
    {
      name: "Jardin d'Essai du Hamma",
      description: "Magnifique jardin botanique historique avec allées de palmiers et espaces verts.",
      wilaya: "Alger",
      latitude: "36.7469000",
      longitude: "3.0781000",
      photos: ["https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800"],
    },
    {
      name: "Grande Mosquée d'Oran",
      description: "Architecture impressionnante en plein cœur de la ville, vue panoramique sur la baie.",
      wilaya: "Oran",
      latitude: "35.6987000",
      longitude: "-0.6349000",
      photos: ["https://images.unsplash.com/photo-1564769625392-651b2c0e5fb2?w=800"],
    },
    {
      name: "Fort de Santa Cruz",
      description: "Fort historique surplombant la ville d'Oran, panorama exceptionnel sur la Méditerranée.",
      wilaya: "Oran",
      latitude: "35.7089000",
      longitude: "-0.6467000",
      photos: ["https://images.unsplash.com/photo-1533105079780-92b9be482077?w=800"],
    },
    {
      name: "Grande Mosquée de Tlemcen",
      description: "Chef-d'œuvre de l'architecture almoravide datant du XIIe siècle.",
      wilaya: "Tlemcen",
      latitude: "34.8828000",
      longitude: "-1.3167000",
      photos: ["https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800"],
    },
    {
      name: "Grottes de Beni Add",
      description: "Grottes naturelles spectaculaires avec formations calcaires, à quelques kilomètres de Tlemcen.",
      wilaya: "Tlemcen",
      latitude: "34.8567000",
      longitude: "-1.4008000",
      photos: ["https://images.unsplash.com/photo-1544819667-4b6c2e0f7b5e?w=800"],
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