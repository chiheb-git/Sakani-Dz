import { Router, type IRouter } from "express";
import { eq, and, ilike, desc, sql, gte } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  vendorsTable,
  propertiesTable,
  sitesTable,
  touristSpotsTable,
  subscriptionsTable,
  reportsTable,
  passwordResetRequestsTable,
} from "@workspace/db";
import {
  ListAdminVendorsQueryParams,
  GetAdminVendorParams,
  ApproveVendorParams,
  RejectVendorParams,
  BlockVendorParams,
  ReactivateVendorParams,
  UpdateVendorPermissionsParams,
  UpdateVendorPermissionsBody,
  ListSubscriptionsQueryParams,
  CreateSubscriptionBody,
  GetSubscriptionParams,
  GetAdminStatsQueryParams,
  ApprovePasswordResetRequestParams,
  ListAdminReportsQueryParams,
  ResolveReportParams,
  DismissReportParams,
} from "@workspace/api-zod";
import { authenticate, requireRole } from "../middlewares/authenticate";
import { generateVendorCode, hashPassword, subscriptionExpiresAt } from "../lib/auth";

const router: IRouter = Router();

function formatVendor(v: typeof vendorsTable.$inferSelect, totalProperties = 0) {
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
    totalProperties,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
  };
}

const adminAuth = [authenticate, requireRole("admin")];

// GET /admin/vendors
router.get("/admin/vendors", ...adminAuth, async (req, res): Promise<void> => {
  const params = ListAdminVendorsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { status, search, page = 1, limit = 20 } = params.data;
  const offset = (page - 1) * limit;

  const conditions = [];
  if (status) conditions.push(eq(vendorsTable.status, status));
  if (search) {
    conditions.push(
      sql`(${vendorsTable.firstName} ILIKE ${`%${search}%`} OR ${vendorsTable.lastName} ILIKE ${`%${search}%`} OR ${vendorsTable.phone} ILIKE ${`%${search}%`})`,
    );
  }
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const vendors = await db
    .select()
    .from(vendorsTable)
    .where(where)
    .orderBy(desc(vendorsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(vendorsTable)
    .where(where);

  const total = countRow?.count ?? 0;

  // Get property counts
  const vendorIds = vendors.map((v) => v.id);
  const propCounts: Record<number, number> = {};
  if (vendorIds.length > 0) {
    const counts = await db
      .select({ vendorId: propertiesTable.vendorId, count: sql<number>`count(*)::int` })
      .from(propertiesTable)
      .where(sql`${propertiesTable.vendorId} = ANY(ARRAY[${sql.raw(vendorIds.join(","))}]::int[])`)
      .groupBy(propertiesTable.vendorId);
    counts.forEach((c) => { propCounts[c.vendorId] = c.count; });
  }

  res.json({
    data: vendors.map((v) => formatVendor(v, propCounts[v.id] ?? 0)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /admin/vendors/:id
router.get("/admin/vendors/:id", ...adminAuth, async (req, res): Promise<void> => {
  const params = GetAdminVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, params.data.id));
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(propertiesTable)
    .where(eq(propertiesTable.vendorId, params.data.id));
  res.json(formatVendor(vendor, countRow?.count ?? 0));
});

// POST /admin/vendors/:id/approve
router.post("/admin/vendors/:id/approve", ...adminAuth, async (req, res): Promise<void> => {
  const params = ApproveVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  // Generate unique code
  let code = generateVendorCode();
  // Ensure uniqueness
  const existing = await db.select({ id: vendorsTable.id }).from(vendorsTable).where(eq(vendorsTable.code, code));
  if (existing.length > 0) code = generateVendorCode() + Math.random().toString(36).slice(2, 4).toUpperCase();

  // Generate initial password (same as code)
  const passwordHash = await hashPassword(code);
  const expiresAt = subscriptionExpiresAt();

  const [vendor] = await db
    .update(vendorsTable)
    .set({
      status: "active",
      code,
      passwordHash,
      isVerified: true,
      subscriptionExpiresAt: expiresAt,
    })
    .where(eq(vendorsTable.id, params.data.id))
    .returning();

  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  res.json(formatVendor(vendor, 0));
});

// POST /admin/vendors/:id/reject
router.post("/admin/vendors/:id/reject", ...adminAuth, async (req, res): Promise<void> => {
  const params = RejectVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [vendor] = await db
    .update(vendorsTable)
    .set({ status: "rejected" })
    .where(eq(vendorsTable.id, params.data.id))
    .returning();
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  res.json(formatVendor(vendor, 0));
});

// POST /admin/vendors/:id/block
router.post("/admin/vendors/:id/block", ...adminAuth, async (req, res): Promise<void> => {
  const params = BlockVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [vendor] = await db
    .update(vendorsTable)
    .set({ status: "blocked", blockedAt: new Date() })
    .where(eq(vendorsTable.id, params.data.id))
    .returning();
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  res.json(formatVendor(vendor, 0));
});

// POST /admin/vendors/:id/reactivate
router.post("/admin/vendors/:id/reactivate", ...adminAuth, async (req, res): Promise<void> => {
  const params = ReactivateVendorParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [vendor] = await db
    .update(vendorsTable)
    .set({ status: "active", blockedAt: null, subscriptionExpiresAt: subscriptionExpiresAt() })
    .where(eq(vendorsTable.id, params.data.id))
    .returning();
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  res.json(formatVendor(vendor, 0));
});

// PATCH /admin/vendors/:id/permissions
router.patch("/admin/vendors/:id/permissions", ...adminAuth, async (req, res): Promise<void> => {
  const params = UpdateVendorPermissionsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const body = UpdateVendorPermissionsBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [vendor] = await db
    .update(vendorsTable)
    .set({ allowedPropertyTypes: body.data.allowedPropertyTypes })
    .where(eq(vendorsTable.id, params.data.id))
    .returning();
  if (!vendor) {
    res.status(404).json({ error: "Vendor not found" });
    return;
  }
  res.json(formatVendor(vendor, 0));
});

// ── Subscriptions ────────────────────────────────────────────────────────────

// GET /admin/subscriptions
router.get("/admin/subscriptions", ...adminAuth, async (req, res): Promise<void> => {
  const params = ListSubscriptionsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { status, vendorId, page = 1, limit = 20 } = params.data;
  const offset = (page - 1) * limit;
  const conditions = [];
  if (status) conditions.push(eq(subscriptionsTable.status, status));
  if (vendorId) conditions.push(eq(subscriptionsTable.vendorId, vendorId));
  const where = conditions.length > 0 ? and(...conditions) : undefined;

  const rows = await db
    .select({ sub: subscriptionsTable, vendor: vendorsTable })
    .from(subscriptionsTable)
    .leftJoin(vendorsTable, eq(subscriptionsTable.vendorId, vendorsTable.id))
    .where(where)
    .orderBy(desc(subscriptionsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(subscriptionsTable)
    .where(where);

  res.json({
    data: rows.map(({ sub, vendor }) => ({
      id: sub.id,
      vendorId: sub.vendorId,
      amount: Number(sub.amount),
      propertyType: sub.propertyType,
      paidAt: sub.paidAt,
      expiresAt: sub.expiresAt,
      status: sub.status,
      createdAt: sub.createdAt,
      vendor: vendor
        ? { id: vendor.id, firstName: vendor.firstName, lastName: vendor.lastName, phone: vendor.phone, email: vendor.email, isVerified: vendor.isVerified }
        : null,
    })),
    pagination: { page, limit, total: countRow?.count ?? 0, totalPages: Math.ceil((countRow?.count ?? 0) / limit) },
  });
});

// POST /admin/subscriptions
router.post("/admin/subscriptions", ...adminAuth, async (req, res): Promise<void> => {
  const parsed = CreateSubscriptionBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const expiresAt = subscriptionExpiresAt();
  const [sub] = await db
    .insert(subscriptionsTable)
    .values({
      vendorId: parsed.data.vendorId,
      amount: String(parsed.data.amount),
      propertyType: parsed.data.propertyType,
      expiresAt,
      status: "active",
    })
    .returning();

  // Update vendor subscription expiry
  await db
    .update(vendorsTable)
    .set({ status: "active", subscriptionExpiresAt: expiresAt })
    .where(eq(vendorsTable.id, parsed.data.vendorId));

  const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, sub.vendorId));
  res.status(201).json({
    id: sub.id,
    vendorId: sub.vendorId,
    amount: Number(sub.amount),
    propertyType: sub.propertyType,
    paidAt: sub.paidAt,
    expiresAt: sub.expiresAt,
    status: sub.status,
    createdAt: sub.createdAt,
    vendor: vendor
      ? { id: vendor.id, firstName: vendor.firstName, lastName: vendor.lastName, phone: vendor.phone, email: vendor.email, isVerified: vendor.isVerified }
      : null,
  });
});

// GET /admin/subscriptions/:id
router.get("/admin/subscriptions/:id", ...adminAuth, async (req, res): Promise<void> => {
  const params = GetSubscriptionParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db
    .select({ sub: subscriptionsTable, vendor: vendorsTable })
    .from(subscriptionsTable)
    .leftJoin(vendorsTable, eq(subscriptionsTable.vendorId, vendorsTable.id))
    .where(eq(subscriptionsTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Subscription not found" });
    return;
  }
  res.json({
    id: row.sub.id,
    vendorId: row.sub.vendorId,
    amount: Number(row.sub.amount),
    propertyType: row.sub.propertyType,
    paidAt: row.sub.paidAt,
    expiresAt: row.sub.expiresAt,
    status: row.sub.status,
    createdAt: row.sub.createdAt,
    vendor: row.vendor
      ? { id: row.vendor.id, firstName: row.vendor.firstName, lastName: row.vendor.lastName, phone: row.vendor.phone, email: row.vendor.email, isVerified: row.vendor.isVerified }
      : null,
  });
});

// ── Stats ────────────────────────────────────────────────────────────────────

// GET /admin/stats
router.get("/admin/stats", ...adminAuth, async (req, res): Promise<void> => {
  const params = GetAdminStatsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const period = params.data.period ?? "month";

  const [vStats] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where status = 'active')::int`,
      pending: sql<number>`count(*) filter (where status = 'pending')::int`,
      blocked: sql<number>`count(*) filter (where status = 'blocked')::int`,
      renewal: sql<number>`count(*) filter (where status = 'renewal_required')::int`,
    })
    .from(vendorsTable);

  const [pStats] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(propertiesTable);

  const [sStats] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(sitesTable);

  const [tStats] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(touristSpotsTable);

  const [revRow] = await db
    .select({ total: sql<number>`coalesce(sum(amount::numeric), 0)::numeric` })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.status, "active"));

  // New vendors in period
  const periodStart = new Date();
  if (period === "week") periodStart.setDate(periodStart.getDate() - 7);
  else if (period === "month") periodStart.setMonth(periodStart.getMonth() - 1);
  else periodStart.setFullYear(periodStart.getFullYear() - 1);

  const [newVendors] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(vendorsTable)
    .where(gte(vendorsTable.createdAt, periodStart));

  res.json({
    totalVendors: vStats?.total ?? 0,
    activeVendors: vStats?.active ?? 0,
    pendingVendors: vStats?.pending ?? 0,
    blockedVendors: vStats?.blocked ?? 0,
    renewalRequired: vStats?.renewal ?? 0,
    totalProperties: pStats?.count ?? 0,
    totalSites: sStats?.count ?? 0,
    totalTouristSpots: tStats?.count ?? 0,
    totalRevenue: Number(revRow?.total ?? 0),
    newVendorsCount: newVendors?.count ?? 0,
    period,
  });
});

// GET /admin/stats/top-vendors
router.get("/admin/stats/top-vendors", ...adminAuth, async (req, res): Promise<void> => {
  const topVendors = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.status, "active"))
    .orderBy(desc(vendorsTable.totalViews))
    .limit(5);

  const vendorIds = topVendors.map((v) => v.id);
  const propCounts: Record<number, number> = {};
  if (vendorIds.length > 0) {
    const counts = await db
      .select({ vendorId: propertiesTable.vendorId, count: sql<number>`count(*)::int` })
      .from(propertiesTable)
      .where(sql`${propertiesTable.vendorId} = ANY(ARRAY[${sql.raw(vendorIds.join(","))}]::int[])`)
      .groupBy(propertiesTable.vendorId);
    counts.forEach((c) => { propCounts[c.vendorId] = c.count; });
  }

  res.json({
    data: topVendors.map((v, i) => ({
      rank: i + 1,
      totalViews: v.totalViews,
      totalProperties: propCounts[v.id] ?? 0,
      vendor: { id: v.id, firstName: v.firstName, lastName: v.lastName, phone: v.phone, email: v.email, isVerified: v.isVerified },
    })),
  });
});

// GET /admin/stats/by-wilaya
router.get("/admin/stats/by-wilaya", ...adminAuth, async (req, res): Promise<void> => {
  const propByWilaya = await db
    .select({ wilaya: propertiesTable.wilaya, count: sql<number>`count(*)::int` })
    .from(propertiesTable)
    .groupBy(propertiesTable.wilaya);

  const sitesByWilaya = await db
    .select({ wilaya: sitesTable.wilaya, count: sql<number>`count(*)::int` })
    .from(sitesTable)
    .groupBy(sitesTable.wilaya);

  const spotsByWilaya = await db
    .select({ wilaya: touristSpotsTable.wilaya, count: sql<number>`count(*)::int` })
    .from(touristSpotsTable)
    .groupBy(touristSpotsTable.wilaya);

  const wilayaMap: Record<string, { propertyCount: number; siteCount: number; touristSpotCount: number }> = {};
  propByWilaya.forEach(({ wilaya, count }) => {
    if (!wilayaMap[wilaya]) wilayaMap[wilaya] = { propertyCount: 0, siteCount: 0, touristSpotCount: 0 };
    wilayaMap[wilaya].propertyCount = count;
  });
  sitesByWilaya.forEach(({ wilaya, count }) => {
    if (!wilayaMap[wilaya]) wilayaMap[wilaya] = { propertyCount: 0, siteCount: 0, touristSpotCount: 0 };
    wilayaMap[wilaya].siteCount = count;
  });
  spotsByWilaya.forEach(({ wilaya, count }) => {
    if (!wilayaMap[wilaya]) wilayaMap[wilaya] = { propertyCount: 0, siteCount: 0, touristSpotCount: 0 };
    wilayaMap[wilaya].touristSpotCount = count;
  });

  res.json({
    data: Object.entries(wilayaMap)
      .map(([wilaya, stats]) => ({ wilaya, ...stats }))
      .sort((a, b) => b.propertyCount - a.propertyCount),
  });
});

// ── Password reset requests ──────────────────────────────────────────────────

// GET /admin/password-reset-requests
router.get("/admin/password-reset-requests", ...adminAuth, async (req, res): Promise<void> => {
  const rows = await db
    .select({ req: passwordResetRequestsTable, vendor: vendorsTable })
    .from(passwordResetRequestsTable)
    .leftJoin(vendorsTable, eq(passwordResetRequestsTable.vendorId, vendorsTable.id))
    .where(eq(passwordResetRequestsTable.status, "pending"))
    .orderBy(desc(passwordResetRequestsTable.createdAt));

  res.json({
    data: rows.map(({ req, vendor }) => ({
      id: req.id,
      vendorId: req.vendorId,
      newPassword: req.newPassword,
      status: req.status,
      createdAt: req.createdAt,
      vendor: vendor ? formatVendor(vendor, 0) : null,
    })),
  });
});

// POST /admin/password-reset-requests/:id/approve
router.post(
  "/admin/password-reset-requests/:id/approve",
  ...adminAuth,
  async (req, res): Promise<void> => {
    const params = ApprovePasswordResetRequestParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const [request] = await db
      .update(passwordResetRequestsTable)
      .set({ status: "approved" })
      .where(eq(passwordResetRequestsTable.id, params.data.id))
      .returning();
    if (!request) {
      res.status(404).json({ error: "Request not found" });
      return;
    }
    const [vendor] = await db.select().from(vendorsTable).where(eq(vendorsTable.id, request.vendorId));
    res.json({
      id: request.id,
      vendorId: request.vendorId,
      newPassword: request.newPassword,
      status: request.status,
      createdAt: request.createdAt,
      vendor: vendor ? formatVendor(vendor, 0) : null,
    });
  },
);

// ── Reports ──────────────────────────────────────────────────────────────────

// GET /admin/reports
router.get("/admin/reports", ...adminAuth, async (req, res): Promise<void> => {
  const params = ListAdminReportsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { status, page = 1, limit = 20 } = params.data;
  const offset = (page - 1) * limit;
  const where = status ? eq(reportsTable.status, status) : undefined;

  const rows = await db
    .select({ report: reportsTable, property: propertiesTable })
    .from(reportsTable)
    .leftJoin(propertiesTable, eq(reportsTable.propertyId, propertiesTable.id))
    .where(where)
    .orderBy(desc(reportsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(reportsTable)
    .where(where);

  res.json({
    data: rows.map(({ report, property }) => ({
      id: report.id,
      propertyId: report.propertyId,
      clientId: report.clientId,
      reason: report.reason,
      details: report.details,
      status: report.status,
      createdAt: report.createdAt,
      property: property
        ? {
            id: property.id,
            vendorId: property.vendorId,
            type: property.type,
            description: property.description,
            price: Number(property.price),
            wilaya: property.wilaya,
            status: property.status,
            photos: property.photos ?? [],
            equipment: property.equipment ?? [],
            apartmentType: property.apartmentType,
            latitude: property.latitude ? Number(property.latitude) : null,
            longitude: property.longitude ? Number(property.longitude) : null,
            siteId: property.siteId,
            views: property.views,
            isFeatured: property.isFeatured,
            createdAt: property.createdAt,
            vendor: null,
          }
        : null,
    })),
    pagination: { page, limit, total: countRow?.count ?? 0, totalPages: Math.ceil((countRow?.count ?? 0) / limit) },
  });
});

// POST /admin/reports/:id/resolve
router.post("/admin/reports/:id/resolve", ...adminAuth, async (req, res): Promise<void> => {
  const params = ResolveReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db
    .update(reportsTable)
    .set({ status: "resolved" })
    .where(eq(reportsTable.id, params.data.id))
    .returning();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json({ id: report.id, propertyId: report.propertyId, clientId: report.clientId, reason: report.reason, details: report.details, status: report.status, createdAt: report.createdAt });
});

// POST /admin/reports/:id/dismiss
router.post("/admin/reports/:id/dismiss", ...adminAuth, async (req, res): Promise<void> => {
  const params = DismissReportParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [report] = await db
    .update(reportsTable)
    .set({ status: "dismissed" })
    .where(eq(reportsTable.id, params.data.id))
    .returning();
  if (!report) {
    res.status(404).json({ error: "Report not found" });
    return;
  }
  res.json({ id: report.id, propertyId: report.propertyId, clientId: report.clientId, reason: report.reason, details: report.details, status: report.status, createdAt: report.createdAt });
});

export default router;
