import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db } from "@workspace/db";
import {
  clientsTable,
  vendorsTable,
  adminUsersTable,
  refreshTokensTable,
  passwordResetRequestsTable,
} from "@workspace/db";
import {
  RegisterClientBody,
  LoginClientBody,
  LoginVendorBody,
  LoginAdminBody,
  RefreshTokenBody,
  VendorForgotPasswordBody,
  LoginAnonymousClientBody,
} from "@workspace/api-zod";
import {
  signAccessToken,
  signRefreshToken,
  verifyToken,
  hashPassword,
  comparePassword,
  generateRefreshTokenValue,
  hashToken,
  refreshTokenExpiresAt,
} from "../lib/auth";

const router: IRouter = Router();

// POST /auth/client/register
router.post("/auth/client/register", async (req, res): Promise<void> => {
  const parsed = RegisterClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { name, email, password, phone, preferredWilaya } = parsed.data;

  const [existing] = await db
    .select({ id: clientsTable.id })
    .from(clientsTable)
    .where(eq(clientsTable.email, email));
  if (existing) {
    res.status(409).json({ error: "Email already registered" });
    return;
  }

  const passwordHash = await hashPassword(password);
  const [client] = await db
    .insert(clientsTable)
    .values({ name, email, passwordHash, phone, preferredWilaya })
    .returning();

  const payload = { userId: client.id, role: "client" as const };
  const accessToken = signAccessToken(payload);
  const refreshValue = generateRefreshTokenValue();
  await db.insert(refreshTokensTable).values({
    userId: client.id,
    role: "client",
    tokenHash: hashToken(refreshValue),
    expiresAt: refreshTokenExpiresAt(),
  });

  res.status(201).json({
    accessToken,
    refreshToken: refreshValue,
    role: "client",
    userId: client.id,
    name: client.name,
  });
});

// POST /auth/client/login
router.post("/auth/client/login", async (req, res): Promise<void> => {
  const parsed = LoginClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { email, password } = parsed.data;

  const [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.email, email));
  if (!client || !client.passwordHash || !(await comparePassword(password, client.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { userId: client.id, role: "client" as const };
  const accessToken = signAccessToken(payload);
  const refreshValue = generateRefreshTokenValue();
  await db.insert(refreshTokensTable).values({
    userId: client.id,
    role: "client",
    tokenHash: hashToken(refreshValue),
    expiresAt: refreshTokenExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken: refreshValue,
    role: "client",
    userId: client.id,
    name: client.name,
  });
});

// POST /auth/client/anonymous
router.post("/auth/client/anonymous", async (req, res): Promise<void> => {
  const parsed = LoginAnonymousClientBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { deviceId } = parsed.data;

  let [client] = await db
    .select()
    .from(clientsTable)
    .where(eq(clientsTable.deviceId, deviceId));

  if (!client) {
    [client] = await db
      .insert(clientsTable)
      .values({ name: "Client anonyme", deviceId })
      .returning();
  }

  const payload = { userId: client.id, role: "client" as const };
  const accessToken = signAccessToken(payload);
  const refreshValue = generateRefreshTokenValue();
  await db.insert(refreshTokensTable).values({
    userId: client.id,
    role: "client",
    tokenHash: hashToken(refreshValue),
    expiresAt: refreshTokenExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken: refreshValue,
    role: "client",
    userId: client.id,
    name: client.name,
  });
});

// POST /auth/vendor/login
router.post("/auth/vendor/login", async (req, res): Promise<void> => {
  const parsed = LoginVendorBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { code, password } = parsed.data;

  const [vendor] = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.code, code));
  if (!vendor || !vendor.passwordHash) {
    res.status(401).json({ error: "Invalid code or password" });
    return;
  }
  if (vendor.status === "blocked") {
    res.status(403).json({ error: "Account blocked" });
    return;
  }
  if (!(await comparePassword(password, vendor.passwordHash))) {
    res.status(401).json({ error: "Invalid code or password" });
    return;
  }

  // Update last access
  await db
    .update(vendorsTable)
    .set({ lastAccessAt: new Date() })
    .where(eq(vendorsTable.id, vendor.id));

  const payload = { userId: vendor.id, role: "vendor" as const };
  const accessToken = signAccessToken(payload);
  const refreshValue = generateRefreshTokenValue();
  await db.insert(refreshTokensTable).values({
    userId: vendor.id,
    role: "vendor",
    tokenHash: hashToken(refreshValue),
    expiresAt: refreshTokenExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken: refreshValue,
    role: "vendor",
    userId: vendor.id,
    name: `${vendor.firstName} ${vendor.lastName}`,
  });
});

// POST /auth/admin/login
router.post("/auth/admin/login", async (req, res): Promise<void> => {
  const parsed = LoginAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { password } = parsed.data;

  const [admin] = await db.select().from(adminUsersTable).limit(1);
  if (!admin || !(await comparePassword(password, admin.passwordHash))) {
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const payload = { userId: admin.id, role: "admin" as const };
  const accessToken = signAccessToken(payload);
  const refreshValue = generateRefreshTokenValue();
  await db.insert(refreshTokensTable).values({
    userId: admin.id,
    role: "admin",
    tokenHash: hashToken(refreshValue),
    expiresAt: refreshTokenExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken: refreshValue,
    role: "admin",
    userId: admin.id,
    name: "Admin",
  });
});

// POST /auth/refresh
router.post("/auth/refresh", async (req, res): Promise<void> => {
  const parsed = RefreshTokenBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { refreshToken } = parsed.data;

  const tokenHash = hashToken(refreshToken);
  const [stored] = await db
    .select()
    .from(refreshTokensTable)
    .where(eq(refreshTokensTable.tokenHash, tokenHash));
  if (!stored || stored.revoked || stored.expiresAt < new Date()) {
    res.status(401).json({ error: "Refresh token expired or revoked" });
    return;
  }

  // Rotate token
  await db
    .update(refreshTokensTable)
    .set({ revoked: true })
    .where(eq(refreshTokensTable.id, stored.id));

  // Refresh tokens are deliberately opaque random values, not JWTs. Their
  // database record is the source of truth for identity and revocation.
  const role = stored.role as "client" | "vendor" | "admin";
  const newPayload = { userId: stored.userId, role };
  const accessToken = signAccessToken(newPayload);
  const newRefreshValue = generateRefreshTokenValue();
  await db.insert(refreshTokensTable).values({
    userId: stored.userId,
    role,
    tokenHash: hashToken(newRefreshValue),
    expiresAt: refreshTokenExpiresAt(),
  });

  res.json({
    accessToken,
    refreshToken: newRefreshValue,
    role,
    userId: stored.userId,
    name: null,
  });
});

// POST /auth/vendor/forgot-password
router.post("/auth/vendor/forgot-password", async (req, res): Promise<void> => {
  const parsed = VendorForgotPasswordBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { code } = parsed.data;

  const [vendor] = await db
    .select()
    .from(vendorsTable)
    .where(eq(vendorsTable.code, code));
  if (!vendor) {
    res.status(404).json({ error: "Vendor code not found" });
    return;
  }

  // Generate a temporary password
  const newPassword = Math.random().toString(36).slice(2, 10).toUpperCase();
  const newPasswordHash = await hashPassword(newPassword);

  await db.insert(passwordResetRequestsTable).values({
    vendorId: vendor.id,
    newPassword,
    status: "pending",
  });
  await db
    .update(vendorsTable)
    .set({ passwordHash: newPasswordHash })
    .where(eq(vendorsTable.id, vendor.id));

  res.json({ message: "Password reset request submitted" });
});

export default router;
