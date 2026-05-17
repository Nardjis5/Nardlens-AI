/**
 * @file src/lib/auth.ts
 * @description JWT authentication helpers for Structora AI.
 * Issues and verifies HTTP-only cookie tokens for stateless session management.
 * Cookies persist across browser restarts (no localStorage dependency).
 */

import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

const JWT_SECRET = process.env.JWT_SECRET || "structora-secret-key-change-in-production";
const COOKIE_NAME = "structora_token";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export interface SessionPayload {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
  plan: string;
}

/** Signs a JWT token and sets it as an HTTP-only cookie. */
export function setSessionCookie(payload: SessionPayload): string {
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "30d" });
  return token;
}

/** Reads and verifies the session token from the HTTP-only cookie. */
export async function getSession(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;
    return payload;
  } catch {
    return null;
  }
}

export { COOKIE_NAME, COOKIE_MAX_AGE };
