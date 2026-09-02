#!/usr/bin/env node
/* eslint-disable no-console -- CLI script; its output is the point */
/**
 * Refreshes the long-lived Instagram token in .env.local (60-day lifetime).
 * Instagram only allows a refresh once the token is at least 24 hours old.
 *
 *   npm run instagram:refresh
 *
 * Writes the new token back to .env.local and prints the new expiry date.
 * Remember to paste the new value into the production host's environment
 * settings (Vercel → Project → Settings → Environment Variables) as well.
 */
import { readFile, writeFile } from "node:fs/promises";

const ENV_FILE = new URL("../.env.local", import.meta.url);
const KEY = "INSTAGRAM_ACCESS_TOKEN";

const env = await readFile(ENV_FILE, "utf8").catch(() => {
  throw new Error(".env.local not found. Put the current token there first.");
});
const match = env.match(new RegExp(`^${KEY}=(.+)$`, "m"));
if (!match) throw new Error(`${KEY} is not set in .env.local`);
const current = match[1].trim();

const url = new URL("https://graph.instagram.com/refresh_access_token");
url.searchParams.set("grant_type", "ig_refresh_token");
url.searchParams.set("access_token", current);

const response = await fetch(url);
const body = await response.json();
if (!response.ok || !body.access_token) {
  const message = body?.error?.message ?? `HTTP ${response.status}`;
  throw new Error(
    `Refresh failed: ${message}. If the token already expired, generate a new one (see docs/ guide).`,
  );
}

const updated = env.replace(match[0], `${KEY}=${body.access_token}`);
await writeFile(ENV_FILE, updated);

const expires = new Date(Date.now() + body.expires_in * 1000);
console.log(
  `Token refreshed. New expiry: ${expires.toISOString().slice(0, 10)} (${Math.round(body.expires_in / 86400)} days).`,
);
console.log(
  "Updated .env.local. Copy the new INSTAGRAM_ACCESS_TOKEN into the production environment too.",
);
