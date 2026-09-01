import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  clientsTable,
  favoritesTable,
  historyEntriesTable,
  propertiesTable,
  vendorsTable,
  touristSpotsTable,
} from "@workspace/db";
import {
  UpdateClientProfileBody,
  AddFavoriteBody,
  AddHistoryEntryBody,
  RemoveFavoriteParams,
  DeleteHistoryEntryParams,
} from "@workspace/api-zod";
import { authenticate, requireRole } from "../middlewares/authenticate";

const router: IRouter = Router();

// GET /clients/me
router.get(
  "/clients/me",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const [client] = await db
      .select()
      .from(clientsTable)
      .where(eq(clientsTable.id, req.user!.userId));
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      preferredWilaya: client.preferredWilaya,
      createdAt: client.createdAt,
    });
  },
);

// PATCH /clients/me
router.patch(
  "/clients/me",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const parsed = UpdateClientProfileBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [client] = await db
      .update(clientsTable)
      .set(parsed.data)
      .where(eq(clientsTable.id, req.user!.userId))
      .returning();
    if (!client) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      preferredWilaya: client.preferredWilaya,
      createdAt: client.createdAt,
    });
  },
);

// ── Favorites ──────────────────────────────────────────────────────────────

// GET /clients/me/favorites
router.get(
  "/clients/me/favorites",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const rows = await db
      .select({ fav: favoritesTable, property: propertiesTable, vendor: vendorsTable })
      .from(favoritesTable)
      .leftJoin(propertiesTable, eq(favoritesTable.propertyId, propertiesTable.id))
      .leftJoin(vendorsTable, eq(propertiesTable.vendorId, vendorsTable.id))
      .where(eq(favoritesTable.clientId, req.user!.userId))
      .orderBy(desc(favoritesTable.createdAt));

    const data = rows.map(({ fav, property, vendor }) => ({
      id: fav.id,
      clientId: fav.clientId,
      propertyId: fav.propertyId,
      createdAt: fav.createdAt,
      property: property
        ? {
            ...property,
            price: Number(property.price),
            latitude: property.latitude ? Number(property.latitude) : null,
            longitude: property.longitude ? Number(property.longitude) : null,
            vendor: vendor
              ? { id: vendor.id, firstName: vendor.firstName, lastName: vendor.lastName, phone: vendor.phone, email: vendor.email, isVerified: vendor.isVerified }
              : null,
          }
        : null,
    }));
    res.json({ data });
  },
);

// POST /clients/me/favorites
router.post(
  "/clients/me/favorites",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const parsed = AddFavoriteBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const { propertyId } = parsed.data;
    const [existing] = await db
      .select({ id: favoritesTable.id })
      .from(favoritesTable)
      .where(
        eq(favoritesTable.clientId, req.user!.userId),
      );
    const [fav] = await db
      .insert(favoritesTable)
      .values({ clientId: req.user!.userId, propertyId })
      .returning();
    res.status(201).json({
      id: fav.id,
      clientId: fav.clientId,
      propertyId: fav.propertyId,
      createdAt: fav.createdAt,
    });
  },
);

// DELETE /clients/me/favorites/:propertyId
router.delete(
  "/clients/me/favorites/:propertyId",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const params = RemoveFavoriteParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db
      .delete(favoritesTable)
      .where(eq(favoritesTable.propertyId, params.data.propertyId));
    res.sendStatus(204);
  },
);

// ── History ────────────────────────────────────────────────────────────────

// GET /clients/me/history
router.get(
  "/clients/me/history",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const rows = await db
      .select({ entry: historyEntriesTable, property: propertiesTable, spot: touristSpotsTable })
      .from(historyEntriesTable)
      .leftJoin(propertiesTable, eq(historyEntriesTable.propertyId, propertiesTable.id))
      .leftJoin(touristSpotsTable, eq(historyEntriesTable.touristSpotId, touristSpotsTable.id))
      .where(eq(historyEntriesTable.clientId, req.user!.userId))
      .orderBy(desc(historyEntriesTable.viewedAt));

    const data = rows.map(({ entry, property, spot }) => ({
      id: entry.id,
      clientId: entry.clientId,
      propertyId: entry.propertyId,
      touristSpotId: entry.touristSpotId,
      entryType: entry.entryType,
      viewedAt: entry.viewedAt,
      property: property
        ? { ...property, price: Number(property.price), latitude: property.latitude ? Number(property.latitude) : null, longitude: property.longitude ? Number(property.longitude) : null }
        : null,
      touristSpot: spot
        ? { ...spot, latitude: spot.latitude ? Number(spot.latitude) : null, longitude: spot.longitude ? Number(spot.longitude) : null }
        : null,
    }));
    res.json({ data });
  },
);

// POST /clients/me/history
router.post(
  "/clients/me/history",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const parsed = AddHistoryEntryBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    const [entry] = await db
      .insert(historyEntriesTable)
      .values({ clientId: req.user!.userId, ...parsed.data })
      .returning();
    res.status(201).json({
      id: entry.id,
      clientId: entry.clientId,
      propertyId: entry.propertyId,
      touristSpotId: entry.touristSpotId,
      entryType: entry.entryType,
      viewedAt: entry.viewedAt,
    });
  },
);

// DELETE /clients/me/history/:id
router.delete(
  "/clients/me/history/:id",
  authenticate,
  requireRole("client"),
  async (req, res): Promise<void> => {
    const params = DeleteHistoryEntryParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    await db
      .delete(historyEntriesTable)
      .where(eq(historyEntriesTable.id, params.data.id));
    res.sendStatus(204);
  },
);

export default router;
