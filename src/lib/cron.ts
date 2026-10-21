import { timingSafeEqual } from "node:crypto";
import { env } from "@/lib/env";

/**
 * True only for Vercel Cron invocations, which carry `Authorization: Bearer
 * <CRON_SECRET>`. Fails closed: with no secret configured nothing is allowed.
 */
export function isAuthorizedCronRequest(request: Request): boolean {
  const secret = env.CRON_SECRET;
  if (!secret) return false;
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(request.headers.get("authorization") ?? "");
  return received.length === expected.length && timingSafeEqual(received, expected);
}
