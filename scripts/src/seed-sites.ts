import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../artifacts/api-server/.env") });

async function main() {
  const { eq } = await import("drizzle-orm");
  const { db, pool, sitesTable, propertiesTable, vendorsTable } = await import("@workspace/db");

  console.log("Seeding sites & properties...");

  const testEmail = "vendeur.demo@sakani.dz";
  let [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.email, testEmail));

  if (!vendor) {
    [vendor] = await db
      .insert(vendorsTable)
      .values({
        firstName: "Karim",
        lastName: "Benali",
        address: "Cité 500 logements, Alger",
        phone: "0555123456",
        email: testEmail,
        code: "VEND-DEMO-01",
        status: "active",
        isVerified: true,
        allowedPropertyTypes: ["apartment", "villa"],
      })
      .returning();
    console.log(`Vendeur de test créé (id=${vendor.id})`);
  } else {
    console.log(`Vendeur de test déjà existant (id=${vendor.id})`);
  }

  const sitesData = [
    {
      name: "Résidence Les Oliviers",
      description: "Résidence moderne avec espaces verts, proche du centre-ville, sécurité 24h/24.",
      wilaya: "Alger",
      latitude: "36.7538000",
      longitude: "3.0588000",
      photos: ["https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800"],
    },
    {
      name: "Lotissement El Bahia",
      description: "Ensemble de villas jumelées avec jardins privatifs, quartier calme et résidentiel.",
      wilaya: "Oran",
      latitude: "35.6969000",
      longitude: "-0.6331000",
      photos: ["https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800"],
    },
    {
      name: "Résidence Tlemcen Center",
      description: "Nouvelle résidence proche de l'université, idéale pour étudiants et jeunes actifs.",
      wilaya: "Tlemcen",
      latitude: "34.8786000",
      longitude: "-1.3150000",
      photos: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800"],
    },
  ];

  const createdSites: (typeof sitesTable.$inferSelect)[] = [];

  for (const s of sitesData) {
    const [existing] = await db.select().from(sitesTable).where(eq(sitesTable.name, s.name));
    if (existing) {
      console.log(`Site "${s.name}" déjà existant, réutilisation`);
      createdSites.push(existing);
      continue;
    }
    const [site] = await db
      .insert(sitesTable)
      .values({ ...s, vendorId: vendor.id })
      .returning();
    createdSites.push(site);
    console.log(`Site créé : ${site.name} (id=${site.id})`);
  }

  const propertyTemplates = [
    { type: "apartment", apartmentType: "F3", price: "8500000", description: "Appartement F3 lumineux avec balcon, cuisine équipée." },
    { type: "apartment", apartmentType: "F2", price: "6200000", description: "Appartement F2 idéal premier achat, proche commerces." },
    { type: "villa", apartmentType: null, price: "22000000", description: "Villa avec jardin, garage double, finitions haut standing." },
  ];

  for (const site of createdSites) {
    const existingProps = await db.select().from(propertiesTable).where(eq(propertiesTable.siteId, site.id));
    if (existingProps.length > 0) {
      console.log(`Site "${site.name}" a déjà ${existingProps.length} logement(s), ignoré`);
      continue;
    }

    for (const [i, tmpl] of propertyTemplates.entries()) {
      const [prop] = await db
        .insert(propertiesTable)
        .values({
          vendorId: vendor.id,
          siteId: site.id,
          type: tmpl.type,
          apartmentType: tmpl.apartmentType,
          description: tmpl.description,
          equipment: ["Climatisation", "Cuisine équipée", "Parking"],
          price: tmpl.price,
          wilaya: site.wilaya,
          latitude: site.latitude,
          longitude: site.longitude,
          photos: ["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"],
          status: "available",
          isFeatured: i === 0,
        })
        .returning();
      console.log(`  Logement créé : ${prop.type} ${prop.apartmentType ?? ""} pour "${site.name}" (id=${prop.id})`);
    }
  }

  console.log("Seed terminé avec succès !");
  await pool.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Erreur pendant le seed :", err);
  process.exit(1);
});