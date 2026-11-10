import { z } from "zod";

/**
 * All environment access goes through this module. Values are validated once at
 * module load so a misconfigured deploy fails fast instead of rendering bad URLs.
 *
 * NEXT_PUBLIC_* variables are inlined at build time, so each one must be referenced
 * explicitly (no dynamic `process.env[key]` lookups).
 */
/** Empty strings in .env files mean "unset". */
const optionalString = z
  .string()
  .trim()
  .transform((value) => (value === "" ? undefined : value))
  .optional();

/** "a@x.com, b@y.com" -> ["a@x.com", "b@y.com"], lowercased; unset means none. */
const emailList = optionalString
  .transform((value) =>
    (value ?? "")
      .split(",")
      .map((entry) => entry.trim().toLowerCase())
      .filter((entry) => entry !== ""),
  )
  .pipe(z.array(z.email({ message: "ADMIN_EMAILS must be comma-separated emails" })));

const envSchema = z.object({
  NEXT_PUBLIC_SITE_URL: z
    .url({ message: "NEXT_PUBLIC_SITE_URL must be an absolute URL" })
    .transform((value) => value.replace(/\/+$/, ""))
    .default("http://localhost:3000"),
  NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY: optionalString,
  /** Server-only. Resend API key (Vercel Marketplace); booking-form requests are emailed with it. */
  RESEND_API_KEY: optionalString,
  /** Server-only. Long-lived Instagram API token for the business account's media feed. */
  INSTAGRAM_ACCESS_TOKEN: optionalString,
  /** "live" uses the token, "mock" renders local placeholders, "off" hides the carousel. */
  INSTAGRAM_FEED_MODE: z.enum(["live", "mock", "off"]).optional(),
  /** Server-only. Upstash Redis REST endpoint + token (Vercel Marketplace); holds the rotating Instagram token. */
  KV_REST_API_URL: optionalString.pipe(z.url().optional()),
  KV_REST_API_TOKEN: optionalString,
  /** Server-only. Vercel sends it as a Bearer header on cron invocations; anything else is rejected. */
  CRON_SECRET: optionalString.pipe(
    z.string().min(16, "CRON_SECRET must be at least 16 characters").optional(),
  ),
  /** Server-only. OAuth client + the shop owner's refresh token for the Business Profile API. */
  GOOGLE_BUSINESS_CLIENT_ID: optionalString,
  GOOGLE_BUSINESS_CLIENT_SECRET: optionalString,
  GOOGLE_BUSINESS_REFRESH_TOKEN: optionalString,
  /** "live" uses the API, "mock" renders sample reviews (never in production), "off" hides the section. */
  GOOGLE_REVIEWS_MODE: z.enum(["live", "mock", "off"]).optional(),
  /**
   * Server-only. The people who may sign in to the admin area (comma-separated
   * emails). Nobody else can get an account; with none, the admin area is off.
   */
  ADMIN_EMAILS: emailList,
  /** Server-only, 32+ random characters. Keys the hashes of admin sessions, codes and links. */
  ADMIN_SECRET: optionalString.pipe(
    z.string().min(32, "ADMIN_SECRET must be at least 32 characters").optional(),
  ),
  /** Set by Vercel: which deployment environment this is. */
  VERCEL_ENV: z.enum(["production", "preview", "development"]).optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

const parsed = envSchema.safeParse({
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY: process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  INSTAGRAM_ACCESS_TOKEN: process.env.INSTAGRAM_ACCESS_TOKEN,
  INSTAGRAM_FEED_MODE: process.env.INSTAGRAM_FEED_MODE,
  KV_REST_API_URL: process.env.KV_REST_API_URL,
  KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN,
  CRON_SECRET: process.env.CRON_SECRET,
  GOOGLE_BUSINESS_CLIENT_ID: process.env.GOOGLE_BUSINESS_CLIENT_ID,
  GOOGLE_BUSINESS_CLIENT_SECRET: process.env.GOOGLE_BUSINESS_CLIENT_SECRET,
  GOOGLE_BUSINESS_REFRESH_TOKEN: process.env.GOOGLE_BUSINESS_REFRESH_TOKEN,
  GOOGLE_REVIEWS_MODE: process.env.GOOGLE_REVIEWS_MODE,
  ADMIN_EMAILS: process.env.ADMIN_EMAILS,
  ADMIN_SECRET: process.env.ADMIN_SECRET,
  VERCEL_ENV: process.env.VERCEL_ENV,
  NODE_ENV: process.env.NODE_ENV,
});

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join(".")}: ${issue.message}`)
    .join("\n");
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
export type Env = typeof env;
