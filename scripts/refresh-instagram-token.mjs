#!/usr/bin/env node
/* eslint-disable no-console -- CLI script; its output is the point */
/**
 * Refreshes the long-lived Instagram token by hand. The weekly cron job in
 * vercel.json normally does this; use the script when that job has failed.
 * Instagram only allows a refresh once the token is at least 24 hours old, and
 * each refresh is good for 60 days.
 *
 *   npm run instagram:refresh
 *
 * Refreshes the freshest token available: the Redis copy when KV_REST_API_URL
 * and KV_REST_API_TOKEN are in .env.local (`vercel env pull` adds them), else
 * INSTAGRAM_ACCESS_TOKEN. The new token goes to Redis, which production reads,
 * and to .env.local.
 */
import { readFile, writeFile } from "node:fs/promises";

const ENV_FILE = new URL("../.env.local", import.meta.url);
const KEY = "INSTAGRAM_ACCESS_TOKEN";
/** Keep in sync with INSTAGRAM_TOKEN_KEY in src/lib/instagram-token.ts. */
const STORE_KEY = "instagram:token";

const env = await readFile(ENV_FILE, "utf8").catch(() => {
  throw new Error(".env.local not found. Put the current token there first.");
});
/** `vercel env pull` writes values in double quotes; hand-written lines may not. */
const read = (name) =>
  env
    .match(new RegExp(`^${name}=(.*)$`, "m"))?.[1]
    ?.trim()
    .replace(/^"(.*)"$/, "$1") || undefined;

const kvUrl = read("KV_REST_API_URL");
const kvToken = read("KV_REST_API_TOKEN");
const hasStore = Boolean(kvUrl && kvToken);

async function kv(args) {
  const response = await fetch(kvUrl, {
    method: "POST",
    headers: { authorization: `Bearer ${kvToken}`, "content-type": "application/json" },
    body: JSON.stringify(args),
  });
  const body = await response.json();
  if (!response.ok || body.error)
    throw new Error(`KV error: ${body.error ?? response.status}`);
  return body.result;
}

let current = read(KEY);
if (hasStore) {
  const raw = await kv(["GET", STORE_KEY]);
  if (typeof raw === "string") current = JSON.parse(raw).token ?? current;
}
if (!current)
  throw new Error(`No token: ${KEY} is not in .env.local and the store is empty.`);

const url = new URL("https://graph.instagram.com/refresh_access_token");
url.searchParams.set("grant_type", "ig_refresh_token");
url.searchParams.set("access_token", current);

const response = await fetch(url);
const body = await response.json();
if (!response.ok || !body.access_token) {
  const message = body?.error?.message ?? `HTTP ${response.status}`;
  throw new Error(
    `Refresh failed: ${message}. If the token already expired, generate a new one (README → Instagram feed).`,
  );
}

const now = new Date();
const expires = new Date(now.getTime() + body.expires_in * 1000);
if (hasStore) {
  await kv([
    "SET",
    STORE_KEY,
    JSON.stringify({
      token: body.access_token,
      refreshedAt: now.toISOString(),
      expiresAt: expires.toISOString(),
    }),
  ]);
}

const line = `${KEY}=${body.access_token}`;
const pattern = new RegExp(`^${KEY}=.*$`, "m");
await writeFile(
  ENV_FILE,
  pattern.test(env) ? env.replace(pattern, line) : `${env.trimEnd()}\n${line}\n`,
);

console.log(
  `Token refreshed. New expiry: ${expires.toISOString().slice(0, 10)} (${Math.round(body.expires_in / 86400)} days).`,
);
console.log(
  hasStore
    ? "Updated Redis (production reads it) and .env.local."
    : "Updated .env.local only: add the KV_REST_API_* values to update production's copy.",
);
