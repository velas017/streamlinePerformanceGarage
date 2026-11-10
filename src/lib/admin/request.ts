import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { isAdminHost, requestHost } from "@/lib/admin/config";
import type { RequestOrigin } from "@/lib/admin/auth";

/**
 * First line of every admin page and action. A server action can be posted to
 * any address of the app, the public site included, where the proxy never
 * runs; this keeps the admin area answering on its own hostname only. It is
 * not the access check: that is the session (lib/admin/session.ts).
 */
export async function adminRequest(): Promise<RequestOrigin> {
  const requestHeaders = await headers();
  if (!isAdminHost(requestHost(requestHeaders))) notFound();
  return {
    ip: requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown",
  };
}
