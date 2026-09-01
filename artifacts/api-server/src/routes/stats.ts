import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { propertiesTable, vendorsTable, sitesTable, touristSpotsTable } from "@workspace/db";

const router: IRouter = Router();

// GET /stats/featured
router.get("/stats/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select({ property: propertiesTable, vendor: vendorsTable })
    .from(propertiesTable)
    .leftJoin(vendorsTable, eq(propertiesTable.vendorId, vendorsTable.id))
    .where(
      and(
        eq(propertiesTable.isFeatured, true),
        eq(propertiesTable.status, "available"),
      ),
    )
    .orderBy(desc(propertiesTable.views))
    .limit(20);

  // If no featured, return most-viewed available
  const data = rows.length > 0 ? rows : await db
    .select({ property: propertiesTable, vendor: vendorsTable })
    .from(propertiesTable)
    .leftJoin(vendorsTable, eq(propertiesTable.vendorId, vendorsTable.id))
    .where(eq(propertiesTable.status, "available"))
    .orderBy(desc(propertiesTable.views))
    .limit(20);

  res.json({
    data: data.map(({ property: p, vendor: v }) => ({
      id: p.id,
      vendorId: p.vendorId,
      type: p.type,
      apartmentType: p.apartmentType,
      description: p.description,
      equipment: p.equipment ?? [],
      price: Number(p.price),
      latitude: p.latitude ? Number(p.latitude) : null,
      longitude: p.longitude ? Number(p.longitude) : null,
      photos: p.photos ?? [],
      status: p.status,
      wilaya: p.wilaya,
      siteId: p.siteId,
      views: p.views,
      isFeatured: p.isFeatured,
      createdAt: p.createdAt,
      vendor: v
        ? { id: v.id, firstName: v.firstName, lastName: v.lastName, phone: v.phone, email: v.email, isVerified: v.isVerified }
        : null,
    })),
    pagination: { page: 1, limit: 20, total: data.length, totalPages: 1 },
  });
});

// GET /stats/dashboard
router.get("/stats/dashboard", async (_req, res): Promise<void> => {
  const [pStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      available: sql<number>`count(*) filter (where status = 'available')::int`,
      apartments: sql<number>`count(*) filter (where type = 'apartment')::int`,
      villas: sql<number>`count(*) filter (where type = 'villa')::int`,
    })
    .from(propertiesTable);

  const [sStats] = await db.select({ count: sql<number>`count(*)::int` }).from(sitesTable);
  const [tStats] = await db.select({ count: sql<number>`count(*)::int` }).from(touristSpotsTable);

  const wilayaCount = await db
    .selectDistinct({ wilaya: propertiesTable.wilaya })
    .from(propertiesTable);

  res.json({
    totalProperties: (pStats?.apartments ?? 0),
    totalVillas: pStats?.villas ?? 0,
    totalSites: sStats?.count ?? 0,
    totalTouristSpots: tStats?.count ?? 0,
    availableProperties: pStats?.available ?? 0,
    totalWilayas: wilayaCount.length,
  });
});

export default router;
