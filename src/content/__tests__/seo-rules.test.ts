import { describe, expect, it } from "vitest";
import { locationContent } from "@/content/locations";
import { serviceAreas } from "@/content/service-areas";
import { services, serviceSlugs } from "@/content/services";

/** Enforces CLAUDE.md §7: unique titles ≤ 55 chars, descriptions 120–160 chars, a city in each. */
const seoEntries = [
  ...services.map((service) => ({ id: service.slug, ...service.seo })),
  ...Object.entries(locationContent).map(([id, content]) => ({ id, ...content.seo })),
  ...serviceAreas.map((area) => ({ id: `area:${area.slug}`, ...area.seo })),
];

describe("SEO content rules", () => {
  it.each(seoEntries)(
    "$id has a compliant title and description",
    ({ title, description }) => {
      expect(title.length).toBeLessThanOrEqual(55);
      expect(description.length).toBeGreaterThanOrEqual(120);
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description).toMatch(/Concord|Charlotte/);
    },
  );

  it("titles are unique", () => {
    const titles = seoEntries.map((entry) => entry.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("every service slug has exactly one service and related slugs never self-reference", () => {
    expect(services.map((service) => service.slug).sort()).toEqual(
      [...serviceSlugs].sort(),
    );
    for (const service of services) {
      expect(service.related).not.toContain(service.slug);
      expect(service.faqs.length).toBeGreaterThan(0);
    }
  });
});
