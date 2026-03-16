import { SignJWT, jwtVerify } from "jose";
import type { User } from "../schema";
import * as db from "../db";
import { ENV } from "./env";

const COOKIE_NAME = "app_session_id";
const ONE_YEAR_MS = 1000 * 60 * 60 * 24 * 365;

function parseCookies(cookieHeader: string | null): Map<string, string> {
  if (!cookieHeader) return new Map();
  const map = new Map<string, string>();
  for (const part of cookieHeader.split(";")) {
    const [k, ...rest] = part.trim().split("=");
    if (k) map.set(k.trim(), decodeURIComponent(rest.join("=").trim()));
  }
  return map;
}

function getSecretKey() {
  return new TextEncoder().encode(ENV.cookieSecret);
}

export async function createSessionToken(
  openId: string,
  name: string = ""
): Promise<string> {
  const secretKey = getSecretKey();
  const expiresAt = Math.floor((Date.now() + ONE_YEAR_MS) / 1000);
  return new SignJWT({ openId, name, appId: "linkup" })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setExpirationTime(expiresAt)
    .sign(secretKey);
}

export async function verifySession(
  cookieValue: string | undefined | null
): Promise<{ openId: string; name: string } | null> {
  if (!cookieValue) return null;
  try {
    const { payload } = await jwtVerify(cookieValue, getSecretKey(), {
      algorithms: ["HS256"],
    });
    const { openId, name } = payload as Record<string, unknown>;
    if (typeof openId !== "string" || !openId) return null;
    return { openId, name: typeof name === "string" ? name : "" };
  } catch {
    return null;
  }
}

export async function authenticateRequest(req: Request): Promise<User> {
  const cookies = parseCookies(req.headers.get("cookie"));
  const sessionCookie = cookies.get(COOKIE_NAME);
  const session = await verifySession(sessionCookie);
  if (!session) throw new Error("Invalid session");

  let user = await db.getUserByOpenId(session.openId);
  if (!user) throw new Error("User not found");

  await db.upsertUser({ openId: user.openId, lastSignedIn: new Date() });
  return user;
}

export function buildSessionCookie(token: string): string {
  const maxAge = Math.floor(ONE_YEAR_MS / 1000);
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=${maxAge}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=None; Secure; Max-Age=0`;
}

export { COOKIE_NAME, ONE_YEAR_MS };
