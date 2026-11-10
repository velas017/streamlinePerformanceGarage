import { env } from "@/lib/env";
import { isKvConfigured } from "@/lib/kv";

/**
 * The admin area lives on its own hostname, "admin." + the site's own (so
 * admin.streamlineperformancellc.com in production and admin.localhost in
 * development). src/proxy.ts serves the /admin routes on that host only and
 * hides them everywhere else. Its matcher has to be a constant, so the
 * "admin." prefix is fixed rather than configurable.
 */
const ADMIN_SUBDOMAIN = "admin";

export function adminHostname(): string {
  const site = new URL(env.NEXT_PUBLIC_SITE_URL).hostname.replace(/^www\./, "");
  return `${ADMIN_SUBDOMAIN}.${site}`;
}

/** True when a Host header (with or without a port) names the admin hostname. */
export function isAdminHost(host: string | null | undefined): boolean {
  if (!host) return false;
  return host.trim().toLowerCase().replace(/:\d+$/, "") === adminHostname();
}

/** The host a request was made to: Vercel's forwarded host first, then the Host header. */
export function requestHost(source: Headers): string | null {
  return source.get("x-forwarded-host") ?? source.get("host");
}

/** Absolute address of a page on the admin host, for emailed links. */
export function adminUrl(path: `/admin${string}`): string {
  const url = new URL(env.NEXT_PUBLIC_SITE_URL);
  url.hostname = adminHostname();
  return new URL(path, url.origin).toString();
}

export function isAdminEmail(email: string): boolean {
  return env.ADMIN_EMAILS.includes(email);
}

/**
 * The admin area fails closed: without an allowed email, the secret and the
 * store, nobody can sign in and every form says it is not set up.
 */
export function isAdminConfigured(): boolean {
  return env.ADMIN_EMAILS.length > 0 && Boolean(env.ADMIN_SECRET) && isKvConfigured();
}
