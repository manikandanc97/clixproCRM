import { SignJWT, jwtVerify } from "jose";
import { JWTPayload } from "./utils";
import crypto from "crypto";

const JWT_SECRET_RAW = process.env.JWT_SECRET;

if (!JWT_SECRET_RAW) {
  throw new Error("CRITICAL: JWT_SECRET environment variable is not defined. Application cannot start.");
}

const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_RAW);

export async function signJWT(payload: JWTPayload, expiresIn: string = "15m"): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
   
  } catch (_error) {
    return null;
  }
}

export function generateRefreshToken(): string {
  return crypto.randomBytes(40).toString("hex");
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
