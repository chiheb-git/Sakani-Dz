import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db } from "@workspace/db";
import { touristSpotsTable } from "@workspace/db";
import {
  ListTouristSpotsQueryParams,
  CreateTouristSpotBody,
  GetTouristSpotParams,
  UpdateTouristSpotParams,
  UpdateTouristSpotBody,
  DeleteTouristSpotParams,
} from "@workspace/api-zod";
import { authenticate, requireRole } from "../middlewares/authenticate";

const router: IRouter = Router();

function formatSpot(s: typeof touristSpotsTable.$inferSelect) {
  return {
    id: s.id,
    name: s.name,
    wilaya: s.wilaya,
    description: s.description,
    latitude: s.latitude ? Number(s.latitude) : null,
    longitude: s.longitude ? Number(s.longitude) : null,
    photos: s.photos ?? [],
    createdAt: s.createdAt,
  };
}

// GET /tourist-spots
router.get("/tourist-spots", async (req, res): Promise<void> => {
  const params = ListTouristSpotsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const { wilaya, page = 1, limit = 20 } = params.data;
  const where = wilaya ? eq(touristSpotsTable.wilaya, wilaya) : undefined;
  const offset = (page - 1) * limit;

  const rows = await db
    .select()
    .from(touristSpotsTable)
    .where(where)
    .orderBy(desc(touristSpotsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(touristSpotsTable)
    .where(where);

  res.json({
    data: rows.map(formatSpot),
    pagination: { page, limit, total: countRow?.count ?? 0, totalPages: Math.ceil((countRow?.count ?? 0) / limit) },
  });
});

// POST /tourist-spots
router.post(
  "/tourist-spots",
  authenticate,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const parsed = CreateTouristSpotBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [spot] = await db
      .insert(touristSpotsTable)
      .values({
        name: parsed.data.name,
        wilaya: parsed.data.wilaya,
        description: parsed.data.description,
        latitude: parsed.data.latitude != null ? String(parsed.data.latitude) : null,
        longitude: parsed.data.longitude != null ? String(parsed.data.longitude) : null,
        photos: parsed.data.photos ?? [],
      })
      .returning();
    res.status(201).json(formatSpot(spot));
  },
);

// GET /tourist-spots/:id
router.get("/tourist-spots/:id", async (req, res): Promise<void> => {
  const params = GetTouristSpotParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [spot] = await db
    .select()
    .from(touristSpotsTable)
    .where(eq(touristSpotsTable.id, params.data.id));
  if (!spot) {
    res.status(404).json({ error: "Tourist spot not found" });
    return;
  }
  res.json(formatSpot(spot));
});

// PATCH /tourist-spots/:id
router.patch(
  "/tourist-spots/:id",
  authenticate,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const params = UpdateTouristSpotParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const body = UpdateTouristSpotBody.safeParse(req.body);
    if (!body.success) {
      res.status(400).json({ error: body.error.message });
      return;
    }
    const updates: Record<string, unknown> = {};
    const d = body.data as Record<string, unknown>;
    if (d.name != null) updates.name = d.name;
    if (d.wilaya != null) updates.wilaya = d.wilaya;
    if (d.description != null) updates.description = d.description;
    if (d.latitude != null) updates.latitude = String(d.latitude);
    if (d.longitude != null) updates.longitude = String(d.longitude);
    if (d.photos != null) updates.photos = d.photos;

    const [spot] = await db
      .update(touristSpotsTable)
      .set(updates as any)
      .where(eq(touristSpotsTable.id, params.data.id))
      .returning();
    if (!spot) {
      res.status(404).json({ error: "Tourist spot not found" });
      return;
    }
    res.json(formatSpot(spot));
  },
);

// DELETE /tourist-spots/:id
router.delete(
  "/tourist-spots/:id",
  authenticate,
  requireRole("admin"),
  async (req, res): Promise<void> => {
    const params = DeleteTouristSpotParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db.delete(touristSpotsTable).where(eq(touristSpotsTable.id, params.data.id));
    res.sendStatus(204);
  },
);

export default router;
