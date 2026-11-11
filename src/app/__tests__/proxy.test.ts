import { NextRequest } from "next/server";
import { describe, expect, it, vi } from "vitest";
import { images } from "@/content/images";
import { config, proxy } from "@/proxy";

vi.mock("@/lib/env", () => ({
  env: { NEXT_PUBLIC_SITE_URL: "https://shop.example", ADMIN_EMAILS: [] },
}));

const SITE = "shop.example";
const ADMIN = "admin.shop.example";

function visit(host: string, path: string, headers: Record<string, string> = {}) {
  return proxy(
    new NextRequest(`https://${host}${path}`, { headers: { host, ...headers } }),
  );
}

/** Where Next will render from, when the proxy rewrote the request. */
function rewrittenTo(response: Response): string | null {
  const target = response.headers.get("x-middleware-rewrite");
  return target ? new URL(target).pathname : null;
}

describe("admin host proxy", () => {
  it("hides /admin on the public site as an ordinary 404", () => {
    for (const path of [
      "/admin",
      "/admin/sign-in",
      "/admin/account",
      "/admin/anything/else",
    ]) {
      const response = visit(SITE, path);
      expect(response.status).toBe(404);
      expect(rewrittenTo(response)).toBe("/_hidden");
    }
  });

  it("hides it on every other hostname too, such as a preview address", () => {
    expect(visit("shop-git-branch.vercel.app", "/admin/sign-in").status).toBe(404);
    expect(visit("www.shop.example", "/admin").status).toBe(404);
    expect(visit("admin.someone-else.example", "/admin/sign-in").status).toBe(404);
  });

  it("leaves the public site's own pages alone", () => {
    const response = visit(SITE, "/gallery");
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("x-robots-tag")).toBeNull();
    // "/administration" is not under "/admin".
    expect(visit(SITE, "/administration").headers.get("x-middleware-next")).toBe("1");
  });

  it("serves the admin pages on the admin host, private and uncached", () => {
    for (const host of [ADMIN, `${ADMIN}:3000`, ADMIN.toUpperCase()]) {
      const response = visit(host, "/admin/sign-in");
      expect(response.headers.get("x-middleware-next")).toBe("1");
      expect(response.headers.get("cache-control")).toBe("private, no-store");
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
      expect(response.headers.get("x-frame-options")).toBe("DENY");
      expect(response.headers.get("content-security-policy")).toBe(
        "frame-ancestors 'none'",
      );
    }
  });

  it("sends the admin host's front door to the admin home, on the same host", () => {
    const response = visit(`${ADMIN}:3000`, "/");
    expect(response.status).toBe(307);
    const location = new URL(response.headers.get("location") ?? "");
    expect(location.host).toBe(`${ADMIN}:3000`);
    expect(location.pathname).toBe("/admin");
  });

  it("does not serve the public site on the admin host", () => {
    for (const path of [
      "/gallery",
      "/contact",
      "/sitemap.xml",
      "/api/cron/refresh-instagram-token",
    ]) {
      const response = visit(ADMIN, path);
      expect(response.status).toBe(404);
      expect(rewrittenTo(response)).toBe("/admin/_missing");
      expect(response.headers.get("x-robots-tag")).toContain("noindex");
    }
  });

  it("lets the admin header's logo through, and no other site image", () => {
    // Vercel's image optimizer fetches the original over the admin hostname.
    for (const path of [images.logoMarkWhite.src, "/icon.png", "/apple-icon.png"]) {
      expect(visit(ADMIN, path).headers.get("x-middleware-next")).toBe("1");
    }
    expect(visit(ADMIN, images.hero.src).status).toBe(404);
  });

  it("goes by the forwarded host when a platform proxy sets one", () => {
    expect(
      visit("internal.host", "/admin", { "x-forwarded-host": ADMIN }).headers.get(
        "x-middleware-next",
      ),
    ).toBe("1");
    expect(visit(ADMIN, "/admin", { "x-forwarded-host": SITE }).status).toBe(404);
  });

  it("runs for /admin anywhere and for any path on an admin.* host, nothing else", () => {
    expect(config.matcher).toEqual([
      "/admin/:path*",
      {
        source: "/((?!_next/static|_next/image).*)",
        has: [{ type: "host", value: "admin\\..*" }],
      },
    ]);
  });
});
