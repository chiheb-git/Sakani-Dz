import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  vendorsTable,
  propertiesTable,
  sitesTable,
  passwordResetRequestsTable,
} from "@workspace/db";
import {
  RegisterVendorBody,
  UpdateVendorProfileBody,
} from "@workspace/api-zod";
import { authenticate, requireRole } from "../middlewares/authenticate";

const router: IRouter = Router();

function formatVendor(v: typeof vendorsTable.$inferSelect) {
  return {
    id: v.id,
    firstName: v.firstName,
    lastName: v.lastName,
    address: v.address,
    phone: v.phone,
    email: v.email,
    code: v.code,
    status: v.status,
    allowedPropertyTypes: v.allowedPropertyTypes ?? [],
    isVerified: v.isVerified,
    lastAccessAt: v.lastAccessAt,
    blockedAt: v.blockedAt,
    subscriptionExpiresAt: v.subscriptionExpiresAt,
    totalViews: v.totalViews,
    totalProperties: 0,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

// POST /vendors/register (public — sends application to admin)
router.post("/vendors/register", async (req, res): Promise<void> => {
  const parsed = RegisterVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const data = parsed.data;
  const [vendor] = await db
    .insert(vendorsTable)
    .values({
      firstName: data.firstName,
      lastName: data.lastName,
      address: data.address,
      phone: data.phone,
      email: data.email,
      status: "pending",
      allowedPropertyTypes: data.propertyType ? [data.propertyType] : [],
    })
    .returning();
  res.status(201).json(formatVendor(vendor));
});

// GET /vendors/me
router.get(
  "/vendors/me",
  authenticate,
  requireRole("vendor"),
  async (req, res): Promise<void> => {
    const [vendor] = await db
      .select()
      .from(vendorsTable)
      .where(eq(vendorsTable.id, req.user!.userId));
    if (!vendor) {
      res.status(404).json({ error: "Vendor not found" });
      return;
    }
    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(propertiesTable)
      .where(eq(propertiesTable.vendorId, vendor.id));
    res.json({ ...formatVendor(vendor), totalProperties: countRow?.count ?? 0 });
  },
);

// PATCH /vendors/me
router.patch(
  "/vendors/me",
  authenticate,
  requireRole("vendor"),
  async (req, res): Promise<void> => {
    const parsed = UpdateVendorProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [vendor] = await db
      .update(vendorsTable)
      .set(parsed.data)
      .where(eq(vendorsTable.id, req.user!.userId))
      .returning();
    if (!vendor) {
      res.status(404).json({ error: "Vendor not found" });
      return;
    }
    res.json(formatVendor(vendor));
  },
);

// GET /vendors/me/properties
router.get(
  "/vendors/me/properties",
  authenticate,
  requireRole("vendor"),
  async (req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.vendorId, req.user!.userId))
      .orderBy(desc(propertiesTable.createdAt));
    const total = rows.length;
    res.json({
      data: rows.map((p) => ({
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
        vendor: null,
      })),
      pagination: { page: 1, limit: total, total, totalPages: 1 },
    });
  },
);

// GET /vendors/me/sites
router.get(
  "/vendors/me/sites",
  authenticate,
  requireRole("vendor"),
  async (req, res): Promise<void> => {
    const rows = await db
      .select()
      .from(sitesTable)
      .where(eq(sitesTable.vendorId, req.user!.userId))
      .orderBy(desc(sitesTable.createdAt));
    const total = rows.length;
    res.json({
      data: rows.map((s) => ({
        id: s.id,
        vendorId: s.vendorId,
        name: s.name,
        description: s.description,
        latitude: s.latitude ? Number(s.latitude) : null,
        longitude: s.longitude ? Number(s.longitude) : null,
        photos: s.photos ?? [],
        wilaya: s.wilaya,
        propertyCount: 0,
        createdAt: s.createdAt,
        vendor: null,
      })),
      pagination: { page: 1, limit: total, total, totalPages: 1 },
    });
  },
);

// GET /vendors/me/stats
router.get(
  "/vendors/me/stats",
  authenticate,
  requireRole("vendor"),
  async (req, res): Promise<void> => {
    const vendorId = req.user!.userId;

    const properties = await db
      .select()
      .from(propertiesTable)
      .where(eq(propertiesTable.vendorId, vendorId));

    const sites = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(sitesTable)
      .where(eq(sitesTable.vendorId, vendorId));

    const totalViews = properties.reduce((s, p) => s + p.views, 0);
    const available = properties.filter((p) => p.status === "available").length;
    const rented = properties.filter((p) => p.status === "rented").length;

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const monthAgo = new Date(now.getTime() - 30 * 86400000);

    res.json({
      totalProperties: properties.length,
      totalViews,
      totalSites: sites[0]?.count ?? 0,
      availableProperties: available,
      rentedProperties: rented,
      viewsThisWeek: totalViews, // simplified
      viewsThisMonth: totalViews,
    });
  },
);

export default router;
