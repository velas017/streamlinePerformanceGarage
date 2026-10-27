import { z } from "zod";
import { env } from "@/lib/env";
import { isKvConfigured, kvGet, kvSet } from "@/lib/kv";

/**
 * The Instagram token rotates weekly (Vercel Cron → `refreshInstagramToken`),
 * so it lives in Redis: an environment variable cannot change while the site
 * runs. `INSTAGRAM_ACCESS_TOKEN` is the bootstrap value and the local fallback.
 */
export const INSTAGRAM_TOKEN_KEY = "instagram:token";
export const INSTAGRAM_TOKEN_RUN_KEY = "instagram:token:last-run";
/** A failed refresh with less than this left on the stored token is called out loudly. */
export const EXPIRY_WARNING_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;

const storedTokenSchema = z.object({
  token: z.string().min(1),
  refreshedAt: z.iso.datetime(),
  expiresAt: z.iso.datetime(),
});
export type StoredToken = z.infer<typeof storedTokenSchema>;

const refreshResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
});

const metaErrorSchema = z.object({ error: z.object({ message: z.string() }) });

export type RefreshResult =
  | { readonly ok: true; readonly expiresAt: string }
  | { readonly ok: false; readonly error: string };

async function readStoredToken(): Promise<StoredToken | null> {
  if (!isKvConfigured()) return null;
  try {
    const raw = await kvGet(INSTAGRAM_TOKEN_KEY);
    if (!raw) return null;
    const parsed = storedTokenSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : null;
  } catch (error) {
    console.error("[instagram-token] could not read the stored token:", error);
    return null;
  }
}

/** The freshest token available: the stored one, else the environment variable. Never throws. */
export async function getInstagramToken(): Promise<string | undefined> {
  const stored = await readStoredToken();
  return stored?.token ?? env.INSTAGRAM_ACCESS_TOKEN;
}

/**
 * Refreshes the token with Meta (allowed once it is 24 hours old; each refresh
 * is good for 60 days), stores it, and records the run. Running twice is
 * harmless. The result never contains the token.
 */
export async function refreshInstagramToken(now = new Date()): Promise<RefreshResult> {
  const result = await attemptRefresh(now);
  await recordRun(now, result);
  return result;
}

async function attemptRefresh(now: Date): Promise<RefreshResult> {
  if (!isKvConfigured()) return { ok: false, error: "The token store is not configured" };
  const current = await getInstagramToken();
  if (!current) return { ok: false, error: "No Instagram token to refresh" };

  const url = new URL("https://graph.instagram.com/refresh_access_token");
  url.searchParams.set("grant_type", "ig_refresh_token");
  url.searchParams.set("access_token", current);

  try {
    const response = await fetch(url);
    const body: unknown = await response.json().catch(() => null);
    const parsed = refreshResponseSchema.safeParse(body);
    if (!response.ok || !parsed.success) {
      const reason = metaErrorSchema.safeParse(body);
      return {
        ok: false,
        error: `Meta refresh failed (HTTP ${response.status}): ${
          reason.success ? reason.data.error.message : "unexpected response"
        }`,
      };
    }
    const stored: StoredToken = {
      token: parsed.data.access_token,
      refreshedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + parsed.data.expires_in * 1000).toISOString(),
    };
    await kvSet(INSTAGRAM_TOKEN_KEY, JSON.stringify(stored));
    return { ok: true, expiresAt: stored.expiresAt };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : "Unknown error" };
  }
}

/** Keeps the outcome in Redis: Hobby keeps runtime logs for an hour, the store keeps this. */
async function recordRun(now: Date, result: RefreshResult): Promise<void> {
  if (!result.ok) {
    console.error("[instagram-token] refresh failed:", result.error);
    const stored = await readStoredToken();
    const daysLeft = stored
      ? (Date.parse(stored.expiresAt) - now.getTime()) / DAY_MS
      : null;
    if (daysLeft !== null && daysLeft < EXPIRY_WARNING_DAYS) {
      console.error(
        `[instagram-token] the stored token expires in ${Math.max(0, Math.floor(daysLeft))} days: run npm run instagram:refresh or generate a new token`,
      );
    }
  }
  if (!isKvConfigured()) return;
  try {
    await kvSet(
      INSTAGRAM_TOKEN_RUN_KEY,
      JSON.stringify({ at: now.toISOString(), ...result }),
    );
  } catch (error) {
    console.error("[instagram-token] could not record the run:", error);
  }
}
