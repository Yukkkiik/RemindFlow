import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days
const EXAMPLE_SECRET = "your-super-secret-jwt-key-change-this-in-production";

/**
 * Read JWT_SECRET without any fallback. Throws when it is missing, or in
 * production when it is still the example value or too short.
 */
export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET belum diatur. Buat dengan: openssl rand -base64 32");
  }
  if (
    process.env.NODE_ENV === "production" &&
    (secret === EXAMPLE_SECRET || secret.length < 32)
  ) {
    throw new Error("JWT_SECRET di production harus nilai acak minimal 32 karakter");
  }
  return new TextEncoder().encode(secret);
}

export async function createSession(userId: string): Promise<void> {
  const token = await new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getJwtSecret());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Returns the user id from a valid token, or null for a missing/invalid/expired one. */
export async function verifySessionToken(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const secret = getJwtSecret(); // outside try: a config error must not look like "logged out"
  try {
    const { payload } = await jwtVerify(token, secret, { algorithms: ["HS256"] });
    return payload.sub ?? null;
  } catch {
    return null;
  }
}

export async function getSessionUserId(): Promise<string | null> {
  return verifySessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
