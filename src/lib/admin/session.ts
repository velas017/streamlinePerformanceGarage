import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { isAdminConfigured, isAdminEmail } from "@/lib/admin/config";
import {
  CHALLENGE_TTL_SECONDS,
  deleteSession,
  readSession,
  SESSION_TTL_SECONDS,
} from "@/lib/admin/store";
import { env } from "@/lib/env";

/**
 * The admin area's two cookies. Both hold a random token whose hash is looked
 * up in Redis on every request, so access ends the moment the stored session
 * is deleted (sign out, sign out everywhere, a new password) or the email
 * leaves ADMIN_EMAILS.
 *
 * HttpOnly keeps them from scripts; SameSite=Lax keeps them off cross-site
 * POSTs (every change is a POST) while a bookmark or emailed link still opens
 * the area signed in. In production they are Secure and carry the `__Host-`
 * prefix, which pins them to the admin hostname: the public site never
 * receives them.
 */
const secure = env.NODE_ENV === "production";
const prefix = secure ? "__Host-" : "";
const SESSION_COOKIE = `${prefix}spg-admin-session`;
const CHALLENGE_COOKIE = `${prefix}spg-admin-sign-in`;
const baseCookie = { httpOnly: true, secure, sameSite: "lax", path: "/" } as const;
/**
 * Removing a cookie means setting it again, expired, with the same attributes:
 * browsers ignore a `__Host-` cookie that arrives without Secure, which is
 * what a bare `cookies().delete(name)` sends.
 */
const expired = { ...baseCookie, maxAge: 0 } as const;

export interface AdminSession {
  readonly email: string;
  /** The raw session token, for actions that keep or end this very session. */
  readonly token: string;
}

/** The signed-in admin, or null. Looked up once per request however often it is asked for. */
export const getSession = cache(async (): Promise<AdminSession | null> => {
  if (!isAdminConfigured()) return null;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = await readSession(token);
  if (!session || !isAdminEmail(session.email)) return null;
  return { email: session.email, token };
});

/**
 * The access check. Every signed-in page and every signed-in action calls
 * this itself; nothing relies on a layout or the proxy having checked.
 */
export async function requireSession(): Promise<AdminSession> {
  const session = await getSession();
  if (!session) redirect("/admin/sign-in");
  return session;
}

export async function startSession(token: string): Promise<void> {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, { ...baseCookie, maxAge: SESSION_TTL_SECONDS });
  jar.set(CHALLENGE_COOKIE, "", expired);
}

/** Ends the session in the store and forgets the cookie. */
export async function endSession(session: AdminSession): Promise<void> {
  await deleteSession(session.token, session.email);
  (await cookies()).set(SESSION_COOKIE, "", expired);
}

/** Between the password and the code: proof that step 1 was passed in this browser. */
export async function setChallengeCookie(token: string): Promise<void> {
  (await cookies()).set(CHALLENGE_COOKIE, token, {
    ...baseCookie,
    maxAge: CHALLENGE_TTL_SECONDS,
  });
}

export async function getChallengeToken(): Promise<string | null> {
  return (await cookies()).get(CHALLENGE_COOKIE)?.value ?? null;
}

export async function clearChallengeCookie(): Promise<void> {
  (await cookies()).set(CHALLENGE_COOKIE, "", expired);
}
