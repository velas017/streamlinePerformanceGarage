import type { Metadata } from "next";
import type {
  AutoRepair,
  BreadcrumbList,
  FAQPage,
  Organization,
  Service as ServiceSchema,
  WebSite,
  WithContext,
} from "schema-dts";
import type { Faq } from "@/content/types";
import type { Service } from "@/content/services";
import { locationHref, serviceHref, type AppHref } from "@/lib/routes";
import { siteConfig, type SiteLocation } from "@/lib/site-config";
import { absoluteUrl } from "@/lib/utils";

/* ----------------------------- Metadata builder ---------------------------- */

export interface BuildMetadataInput {
  /** Page title without the brand; the root template appends " | {siteConfig.name}". */
  readonly title: string;
  readonly description: string;
  /** Route path, e.g. "/services/engine-builds". Used for canonical + og:url. */
  readonly path: AppHref;
  readonly keywords?: readonly string[];
  /** Use the title verbatim (home page only). */
  readonly absoluteTitle?: boolean;
  readonly noIndex?: boolean;
}

/**
 * The only way pages should produce Metadata. Guarantees a canonical URL,
 * Open Graph + Twitter cards, and consistent title handling on every route.
 * OG images come from the opengraph-image.tsx file conventions.
 */
export function buildMetadata(input: BuildMetadataInput): Metadata {
  const url = absoluteUrl(input.path);
  const title = input.absoluteTitle ? { absolute: input.title } : input.title;
  const fullTitle = input.absoluteTitle
    ? input.title
    : `${input.title} | ${siteConfig.name}`;

  return {
    title,
    description: input.description,
    ...(input.keywords ? { keywords: [...input.keywords] } : {}),
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      title: fullTitle,
      description: input.description,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description: input.description,
    },
    ...(input.noIndex ? { robots: { index: false, follow: false } } : {}),
  };
}

/* ------------------------------ JSON-LD builders ---------------------------- */

const ORGANIZATION_ID = absoluteUrl("/#organization");
const WEBSITE_ID = absoluteUrl("/#website");

function locationId(location: SiteLocation): string {
  return absoluteUrl(`${locationHref(location.id)}#location`);
}

function areaServed() {
  return siteConfig.serviceAreas.map((name) => ({ "@type": "City" as const, name }));
}

export function organizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": ORGANIZATION_ID,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: siteConfig.url,
    logo: absoluteUrl(siteConfig.logo),
    email: siteConfig.email,
    telephone: siteConfig.primaryPhone,
    ...(siteConfig.foundingYear ? { foundingDate: String(siteConfig.foundingYear) } : {}),
    sameAs: siteConfig.socials.map((social) => social.href),
    subOrganization: siteConfig.locations.map((location) => ({
      "@id": locationId(location),
    })),
  };
}

export function webSiteSchema(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": ORGANIZATION_ID },
    inLanguage: "en-US",
  };
}

/** AutoRepair is the schema.org LocalBusiness subtype for mechanic shops. */
export function autoRepairSchema(location: SiteLocation): WithContext<AutoRepair> {
  return {
    "@context": "https://schema.org",
    "@type": "AutoRepair",
    "@id": locationId(location),
    name: location.name,
    image: absoluteUrl(location.image.src),
    url: absoluteUrl(locationHref(location.id)),
    telephone: location.phone,
    email: siteConfig.email,
    priceRange: siteConfig.priceRange,
    address: {
      "@type": "PostalAddress",
      ...location.address,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: location.geo.latitude,
      longitude: location.geo.longitude,
    },
    hasMap: location.mapsUrl,
    openingHoursSpecification: location.hours.map((entry) => ({
      "@type": "OpeningHoursSpecification" as const,
      dayOfWeek: [...entry.dayOfWeek],
      opens: entry.opens,
      closes: entry.closes,
    })),
    areaServed: areaServed(),
    parentOrganization: { "@id": ORGANIZATION_ID },
    sameAs: siteConfig.socials.map((social) => social.href),
  };
}

export function serviceSchema(service: Service): WithContext<ServiceSchema> {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": absoluteUrl(`${serviceHref(service.slug)}#service`),
    name: service.name,
    serviceType: service.name,
    description: service.summary,
    url: absoluteUrl(serviceHref(service.slug)),
    provider: { "@id": ORGANIZATION_ID },
    areaServed: areaServed(),
    availableChannel: siteConfig.locations.map((location) => ({
      "@type": "ServiceChannel" as const,
      serviceLocation: { "@id": locationId(location) },
      servicePhone: { "@type": "ContactPoint" as const, telephone: location.phone },
    })),
  };
}

export function faqSchema(faqs: readonly Faq[]): WithContext<FAQPage> {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question" as const,
      name: faq.question,
      acceptedAnswer: { "@type": "Answer" as const, text: faq.answer },
    })),
  };
}

export interface BreadcrumbItem {
  readonly name: string;
  readonly href: AppHref;
}

export function breadcrumbSchema(
  items: readonly BreadcrumbItem[],
): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem" as const,
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}
