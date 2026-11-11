import { NextResponse, type NextRequest } from "next/server";
import { isAdminHost, requestHost } from "@/lib/admin/config";

/**
 * Puts the admin area on its own hostname and nowhere else.
 *
 * - On the admin host (admin.<site>) only the /admin pages exist; "/" goes to
 *   the admin home and every other address is the admin 404.
 * - On every other host, "/admin" and everything under it is a plain 404,
 *   exactly like any address that does not exist.
 *
 * The admin pages keep their real "/admin/…" paths on the admin host. Mapping
 * shorter addresses onto them with a rewrite was tried and dropped: when a
 * server action redirects, Next renders the target by its real path, so a
 * redirect to "/" rendered the public home page.
 *
 * This only decides which pages a hostname shows. Access is decided by the
 * session, which every admin page and action checks itself (lib/admin/session.ts).
 */
const ADMIN_PREFIX = "/admin";
/** Files the admin pages share with the site (tab icons). */
const SHARED_FILES = new Set(["/icon.png", "/apple-icon.png", "/favicon.ico"]);
/**
 * The brand mark in the admin header. Vercel's image optimizer fetches the
 * original over the same hostname the page was opened on, so on the admin host
 * this folder has to be reachable or the logo is a broken image. (A local
 * server reads the file from disk and never shows the problem.)
 */
const SHARED_FOLDER = "/images/logo/";
/** No route lives here, so rewriting to it renders the public site's normal 404. */
const PUBLIC_MISSING_PATH = "/_hidden";
/** Caught by admin/[...rest], which renders the admin area's own 404. */
const ADMIN_MISSING_PATH = `${ADMIN_PREFIX}/_missing`;

const PRIVATE_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow, noarchive",
  "Content-Security-Policy": "frame-ancestors 'none'",
  "X-Frame-Options": "DENY",
} as const;

function isUnderAdmin(pathname: string): boolean {
  return pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
}

function asPrivate(response: NextResponse): NextResponse {
  for (const [name, value] of Object.entries(PRIVATE_HEADERS)) {
    response.headers.set(name, value);
  }
  return response;
}

export function proxy(request: NextRequest): NextResponse {
  const url = request.nextUrl.clone();
  const { pathname } = url;
  const host = requestHost(request.headers);

  if (!isAdminHost(host)) {
    if (!isUnderAdmin(pathname)) return NextResponse.next();
    url.pathname = PUBLIC_MISSING_PATH;
    return NextResponse.rewrite(url, { status: 404 });
  }

  if (SHARED_FILES.has(pathname) || pathname.startsWith(SHARED_FOLDER)) {
    return NextResponse.next();
  }
  if (isUnderAdmin(pathname)) return asPrivate(NextResponse.next());

  if (pathname === "/") {
    // The redirect must name the host the visitor used, not the server's own.
    if (host) url.host = host;
    url.pathname = ADMIN_PREFIX;
    return asPrivate(NextResponse.redirect(url, 307));
  }

  url.pathname = ADMIN_MISSING_PATH;
  return asPrivate(NextResponse.rewrite(url, { status: 404 }));
}

export const config = {
  // Constants only (Next reads this at build time). The public site's own
  // pages never reach the proxy: it runs for "/admin" addresses and for hosts
  // that start with "admin.", minus build assets and optimized images.
  matcher: [
    "/admin/:path*",
    {
      source: "/((?!_next/static|_next/image).*)",
      has: [{ type: "host", value: "admin\\..*" }],
    },
  ],
};
