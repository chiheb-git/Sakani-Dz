import { Router, type IRouter } from "express";
import { eq, and, gte, lte, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { propertiesTable, vendorsTable, reportsTable } from "@workspace/db";
import {
  ListPropertiesQueryParams,
  CreatePropertyBody,
  GetPropertyParams,
  UpdatePropertyParams,
  UpdatePropertyBody,
  DeletePropertyParams,
  ReportPropertyParams,
  ReportPropertyBody,
  RecordPropertyViewParams,
} from "@workspace/api-zod";
import { authenticate, requireRole } from "../middlewares/authenticate";

const router: IRouter = Router();

function formatProperty(p: typeof propertiesTable.$inferSelect, v?: typeof vendorsTable.$inferSelect | null) {
  return {
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
  };
}

// GET /properties
router.get("/properties", async (req, res): Promise<void> => {
  const params = ListPropertiesQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { wilaya, type, apartmentType, vendorId, minPrice, maxPrice, status, featured, page = 1, limit = 20 } = params.data;

  const conditions = [];
  if (wilaya) conditions.push(eq(propertiesTable.wilaya, wilaya));
  if (type) conditions.push(eq(propertiesTable.type, type));
  if (vendorId != null) conditions.push(eq(propertiesTable.vendorId, vendorId));
  if (apartmentType) conditions.push(eq(propertiesTable.apartmentType, apartmentType));
  if (minPrice != null) conditions.push(gte(propertiesTable.price, String(minPrice)));
  if (maxPrice != null) conditions.push(lte(propertiesTable.price, String(maxPrice)));
  if (status) conditions.push(eq(propertiesTable.status, status));
  if (featured) conditions.push(eq(propertiesTable.isFeatured, true));

  const where = conditions.length > 0 ? and(...conditions) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select({ property: propertiesTable, vendor: vendorsTable })
    .from(propertiesTable)
    .leftJoin(vendorsTable, eq(propertiesTable.vendorId, vendorsTable.id))
    .where(where)
    .orderBy(desc(propertiesTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(propertiesTable)
    .where(where);

  const total = countRow?.count ?? 0;
  res.json({
    data: rows.map(({ property, vendor }) => formatProperty(property, vendor)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// POST /properties
router.post(
  "/properties",
  authenticate,
  requireRole("vendor", "admin"),
  async (req, res): Promise<void> => {
    const parsed = CreatePropertyBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const vendorId = req.user!.role === "vendor" ? req.user!.userId : (parsed.data as any).vendorId;
    const [property] = await db
      .insert(propertiesTable)
      .values({
        vendorId,
        type: parsed.data.type,
        apartmentType: parsed.data.apartmentType,
        description: parsed.data.description,
        equipment: parsed.data.equipment ?? [],
        price: String(parsed.data.price),
        latitude: parsed.data.latitude != null ? String(parsed.data.latitude) : null,
        longitude: parsed.data.longitude != null ? String(parsed.data.longitude) : null,
        photos: parsed.data.photos ?? [],
        status: parsed.data.status ?? "available",
        wilaya: parsed.data.wilaya,
        siteId: parsed.data.siteId,
      })
      .returning();
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, property.vendorId));
    res.status(201).json(formatProperty(property, vendor));
  },
);

// GET /properties/:id
router.get("/properties/:id", async (req, res): Promise<void> => {
  const params = GetPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({ property: propertiesTable, vendor: vendorsTable })
    .from(propertiesTable)
    .leftJoin(vendorsTable, eq(propertiesTable.vendorId, vendorsTable.id))
    .where(eq(propertiesTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.json(formatProperty(row.property, row.vendor));
});

// PATCH /properties/:id
router.patch(
  "/properties/:id",
  authenticate,
  requireRole("vendor", "admin"),
  async (req, res): Promise<void> => {
    const params = UpdatePropertyParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdatePropertyBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const updates: Record<string, unknown> = {};
    const d = body.data as Record<string, unknown>;
    if (d.type != null) updates.type = d.type;
    if (d.apartmentType != null) updates.apartmentType = d.apartmentType;
    if (d.description != null) updates.description = d.description;
    if (d.equipment != null) updates.equipment = d.equipment;
    if (d.price != null) updates.price = String(d.price);
    if (d.latitude != null) updates.latitude = String(d.latitude);
    if (d.longitude != null) updates.longitude = String(d.longitude);
    if (d.photos != null) updates.photos = d.photos;
    if (d.status != null) updates.status = d.status;
    if (d.wilaya != null) updates.wilaya = d.wilaya;
    if (d.siteId != null) updates.siteId = d.siteId;
    if (d.isFeatured != null) updates.isFeatured = d.isFeatured;

    const [property] = await db
      .update(propertiesTable)
      .set(updates as Partial<typeof propertiesTable.$inferInsert>)
      .where(eq(propertiesTable.id, params.data.id))
      .returning();
    if (!property) {
      res.status(404).json({ error: "Property not found" });
      return;
    }
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, property.vendorId));
    res.json(formatProperty(property, vendor));
  },
);

// DELETE /properties/:id
router.delete(
  "/properties/:id",
  authenticate,
  requireRole("vendor", "admin"),
  async (req, res): Promise<void> => {
    const params = DeletePropertyParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db.delete(propertiesTable).where(eq(propertiesTable.id, params.data.id));
    res.sendStatus(204);
  },
);

// POST /properties/:id/report
router.post("/properties/:id/report", async (req, res): Promise<void> => {
  const params = ReportPropertyParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = ReportPropertyBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [report] = await db
    .insert(reportsTable)
    .values({
      propertyId: params.data.id,
      reason: body.data.reason,
      details: body.data.details,
      clientId: req.user?.userId ?? null,
    })
    .returning();
  res.status(201).json({
    id: report.id,
    propertyId: report.propertyId,
    clientId: report.clientId,
    reason: report.reason,
    details: report.details,
    status: report.status,
    createdAt: report.createdAt,
  });
});

// POST /properties/:id/view
router.post("/properties/:id/view", async (req, res): Promise<void> => {
  const params = RecordPropertyViewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [property] = await db
    .update(propertiesTable)
    .set({ views: sql`${propertiesTable.views} + 1` })
    .where(eq(propertiesTable.id, params.data.id))
    .returning({ views: propertiesTable.views });
  if (!property) {
    res.status(404).json({ error: "Property not found" });
    return;
  }
  res.json({ views: property.views });
});

export default router;
