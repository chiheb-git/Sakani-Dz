import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { randomBytes, createHash } from "crypto";

const JWT_SECRET = process.env.SESSION_SECRET ?? "sakani-dz-fallback-secret";
const ACCESS_TOKEN_EXPIRY = "2h";
const REFRESH_TOKEN_EXPIRY = "30d";

export interface TokenPayload {
  userId: number;
  role: "client" | "vendor" | "admin";
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Generates a readable 8-char uppercase hex vendor code like "A1B2C3D4" */
export function generateVendorCode(): string {
  return randomBytes(4).toString("hex").toUpperCase();
}

/** SHA-256 hash of a token for safe storage */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function generateRefreshTokenValue(): string {
  return randomBytes(32).toString("hex");
}

/** 30 days from now */
export function refreshTokenExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}

/** Subscription expiry: 30 days from now */
export function subscriptionExpiresAt(): Date {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d;
}
