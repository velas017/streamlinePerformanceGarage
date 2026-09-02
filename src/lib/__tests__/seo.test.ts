import { describe, expect, it } from "vitest";
import { services } from "@/content/services";
import {
  autoRepairSchema,
  breadcrumbSchema,
  buildMetadata,
  serviceSchema,
} from "@/lib/seo";
import { getLocation, siteConfig } from "@/lib/site-config";

describe("buildMetadata", () => {
  it("sets canonical, OG and Twitter consistently", () => {
    const meta = buildMetadata({ title: "Brakes", description: "d", path: "/services" });
    expect(meta.title).toBe("Brakes");
    expect(meta.alternates?.canonical).toBe(`${siteConfig.url}/services`);
    expect(meta.openGraph).toMatchObject({
      url: `${siteConfig.url}/services`,
      title: `Brakes | ${siteConfig.name}`,
    });
    expect(meta.twitter).toMatchObject({ card: "summary_large_image" });
    expect(meta.robots).toBeUndefined();
  });

  it("supports absolute titles and noIndex", () => {
    const meta = buildMetadata({
      title: "Home",
      absoluteTitle: true,
      description: "d",
      path: "/",
      noIndex: true,
    });
    expect(meta.title).toEqual({ absolute: "Home" });
    expect(meta.robots).toEqual({ index: false, follow: false });
  });
});

describe("JSON-LD builders", () => {
  it("AutoRepair carries NAP, geo and hours from site-config", () => {
    const location = getLocation("concord");
    const schema = autoRepairSchema(location);
    expect(schema).toMatchObject({
      "@type": "AutoRepair",
      telephone: location.phone,
      address: { "@type": "PostalAddress", postalCode: location.address.postalCode },
      geo: { latitude: location.geo.latitude },
    });
    expect(schema).toHaveProperty(
      "openingHoursSpecification.length",
      location.hours.length,
    );
  });

  it("Service references the organization and both shops", () => {
    const service = services[0];
    if (!service) throw new Error("no services");
    const schema = serviceSchema(service);
    expect(schema).toHaveProperty("provider", {
      "@id": `${siteConfig.url}/#organization`,
    });
    expect(schema).toHaveProperty("availableChannel.length", siteConfig.locations.length);
  });

  it("Breadcrumb positions are 1-based and absolute", () => {
    const schema = breadcrumbSchema([
      { name: "Home", href: "/" },
      { name: "About", href: "/about" },
    ]);
    expect(schema).toHaveProperty("itemListElement", [
      { "@type": "ListItem", position: 1, name: "Home", item: siteConfig.url },
      {
        "@type": "ListItem",
        position: 2,
        name: "About",
        item: `${siteConfig.url}/about`,
      },
    ]);
  });
});
