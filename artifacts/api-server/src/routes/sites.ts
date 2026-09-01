import { Router, type IRouter } from "express";
import { eq, and, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { sitesTable, vendorsTable, propertiesTable } from "@workspace/db";
import {
  ListSitesQueryParams,
  CreateSiteBody,
  GetSiteParams,
  UpdateSiteParams,
  UpdateSiteBody,
  DeleteSiteParams,
  ListSitePropertiesParams,
} from "@workspace/api-zod";
import { authenticate, requireRole } from "../middlewares/authenticate";

const router: IRouter = Router();

function formatSite(s: typeof sitesTable.$inferSelect, v?: typeof vendorsTable.$inferSelect | null, count = 0) {
  return {
    id: s.id,
    vendorId: s.vendorId,
    name: s.name,
    description: s.description,
    latitude: s.latitude ? Number(s.latitude) : null,
    longitude: s.longitude ? Number(s.longitude) : null,
    photos: s.photos ?? [],
    wilaya: s.wilaya,
    propertyCount: count,
    createdAt: s.createdAt,
    vendor: v
      ? { id: v.id, firstName: v.firstName, lastName: v.lastName, phone: v.phone, email: v.email, isVerified: v.isVerified }
      : null,
  };
}

// GET /sites
router.get("/sites", async (req, res): Promise<void> => {
  const params = ListSitesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { wilaya, page = 1, limit = 20 } = params.data;
  const where = wilaya ? eq(sitesTable.wilaya, wilaya) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select({ site: sitesTable, vendor: vendorsTable })
    .from(sitesTable)
    .leftJoin(vendorsTable, eq(sitesTable.vendorId, vendorsTable.id))
    .where(where)
    .orderBy(desc(sitesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sitesTable)
    .where(where);

  const total = countRow?.count ?? 0;

  // Get property counts per site
  const siteIds = rows.map((r) => r.site.id);
  const propCounts: Record<number, number> = {};
  if (siteIds.length > 0) {
    const counts = await db
      .select({ siteId: propertiesTable.siteId, count: sql<number>`count(*)::int` })
      .from(propertiesTable)
      .where(sql`${propertiesTable.siteId} = ANY(${sql.raw(`ARRAY[${siteIds.join(",")}]::int[]`)})`)
      .groupBy(propertiesTable.siteId);
    counts.forEach((c) => { if (c.siteId) propCounts[c.siteId] = c.count; });
  }

  res.json({
    data: rows.map(({ site, vendor }) => formatSite(site, vendor, propCounts[site.id] ?? 0)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// POST /sites
router.post(
  "/sites",
  authenticate,
  requireRole("vendor", "admin"),
  async (req, res): Promise<void> => {
    const parsed = CreateSiteBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const vendorId = req.user!.role === "vendor" ? req.user!.userId : (req.body as any).vendorId ?? req.user!.userId;
    const [site] = await db
      .insert(sitesTable)
      .values({
        vendorId,
        name: parsed.data.name,
        description: parsed.data.description,
        latitude: parsed.data.latitude != null ? String(parsed.data.latitude) : null,
        longitude: parsed.data.longitude != null ? String(parsed.data.longitude) : null,
        photos: parsed.data.photos ?? [],
        wilaya: parsed.data.wilaya,
      })
      .returning();
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, site.vendorId));
    res.status(201).json(formatSite(site, vendor, 0));
  },
);

// GET /sites/:id
router.get("/sites/:id", async (req, res): Promise<void> => {
  const params = GetSiteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({ site: sitesTable, vendor: vendorsTable })
    .from(sitesTable)
    .leftJoin(vendorsTable, eq(sitesTable.vendorId, vendorsTable.id))
    .where(eq(sitesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Site not found" });
    return;
  }
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(propertiesTable)
    .where(eq(propertiesTable.siteId, params.data.id));
  res.json(formatSite(row.site, row.vendor, countRow?.count ?? 0));
});

// PATCH /sites/:id
router.patch(
  "/sites/:id",
  authenticate,
  requireRole("vendor", "admin"),
  async (req, res): Promise<void> => {
    const params = UpdateSiteParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateSiteBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const updates: Record<string, unknown> = {};
    const d = body.data as Record<string, unknown>;
    if (d.name != null) updates.name = d.name;
    if (d.description != null) updates.description = d.description;
    if (d.latitude != null) updates.latitude = String(d.latitude);
    if (d.longitude != null) updates.longitude = String(d.longitude);
    if (d.photos != null) updates.photos = d.photos;
    if (d.wilaya != null) updates.wilaya = d.wilaya;

    const [site] = await db
      .update(sitesTable)
      .set(updates as any)
      .where(eq(sitesTable.id, params.data.id))
      .returning();
    if (!site) {
      res.status(404).json({ error: "Site not found" });
      return;
    }
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, site.vendorId));
    res.json(formatSite(site, vendor, 0));
  },
);

// DELETE /sites/:id
router.delete(
  "/sites/:id",
  authenticate,
  requireRole("vendor", "admin"),
  async (req, res): Promise<void> => {
    const params = DeleteSiteParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db.delete(sitesTable).where(eq(sitesTable.id, params.data.id));
    res.sendStatus(204);
  },
);

// GET /sites/:id/properties
router.get("/sites/:id/properties", async (req, res): Promise<void> => {
  const params = ListSitePropertiesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select({ property: propertiesTable, vendor: vendorsTable })
    .from(propertiesTable)
    .leftJoin(vendorsTable, eq(propertiesTable.vendorId, vendorsTable.id))
    .where(eq(propertiesTable.siteId, params.data.id))
    .orderBy(desc(propertiesTable.createdAt));

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(propertiesTable)
    .where(eq(propertiesTable.siteId, params.data.id));

  const total = countRow?.count ?? 0;
  res.json({
    data: rows.map(({ property, vendor }) => ({
      id: property.id,
      vendorId: property.vendorId,
      type: property.type,
      apartmentType: property.apartmentType,
      description: property.description,
      equipment: property.equipment ?? [],
      price: Number(property.price),
      latitude: property.latitude ? Number(property.latitude) : null,
      longitude: property.longitude ? Number(property.longitude) : null,
      photos: property.photos ?? [],
      status: property.status,
      wilaya: property.wilaya,
      siteId: property.siteId,
      views: property.views,
      isFeatured: property.isFeatured,
      createdAt: property.createdAt,
      vendor: vendor
        ? { id: vendor.id, firstName: vendor.firstName, lastName: vendor.lastName, phone: vendor.phone, email: vendor.email, isVerified: vendor.isVerified }
        : null,
    })),
    pagination: { page: 1, limit: total, total, totalPages: 1 },
  });
});

export default router;
