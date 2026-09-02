import { describe, expect, it } from "vitest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";
import { serviceAreas } from "@/content/service-areas";
import { services } from "@/content/services";
import { siteConfig } from "@/lib/site-config";

describe("sitemap + robots", () => {
  const entries = sitemap();
  const urls = entries.map((entry) => entry.url);

  it("lists every service and location exactly once", () => {
    expect(new Set(urls).size).toBe(urls.length);
    for (const service of services) {
      expect(urls).toContain(`${siteConfig.url}/services/${service.slug}`);
    }
    for (const location of siteConfig.locations) {
      expect(urls).toContain(`${siteConfig.url}/locations/${location.id}`);
    }
    for (const area of serviceAreas) {
      expect(urls).toContain(`${siteConfig.url}/service-areas/${area.slug}`);
    }
  });

  it("uses absolute URLs without trailing slashes", () => {
    for (const url of urls) {
      expect(url.startsWith("http")).toBe(true);
      expect(url === siteConfig.url || !url.endsWith("/")).toBe(true);
    }
  });

  it("robots points at the sitemap", () => {
    expect(robots().sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});
