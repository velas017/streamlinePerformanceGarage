import { env } from "@/lib/env";

/**
 * SINGLE SOURCE OF TRUTH for business identity, NAP (Name / Address / Phone),
 * hours, socials and brand defaults. Every component, metadata builder and
 * JSON-LD schema reads from here. Never hard-code any of these values elsewhere.
 *
 * Verified 2026-09-01 against the public Google/Apple Maps, Facebook and
 * directory listings for Streamline Performance Garage, LLC. Items marked
 * TODO(owner) could not be verified from public sources.
 */

export const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
export type DayOfWeek = (typeof DAYS)[number];

export interface OpeningHours {
  readonly dayOfWeek: readonly DayOfWeek[];
  /** 24h "HH:MM" */
  readonly opens: string;
  /** 24h "HH:MM" */
  readonly closes: string;
}

export interface PostalAddress {
  readonly streetAddress: string;
  readonly addressLocality: string;
  readonly addressRegion: string;
  readonly postalCode: string;
  readonly addressCountry: string;
}

export interface GeoPoint {
  readonly latitude: number;
  readonly longitude: number;
}

export interface Location {
  readonly id: string;
  /** Short city name used in headings and CTAs, e.g. "Concord". */
  readonly city: string;
  /** Full display name for schema and page titles. */
  readonly name: string;
  /** E.164 formatted phone number. */
  readonly phone: string;
  readonly address: PostalAddress;
  readonly geo: GeoPoint;
  readonly hours: readonly OpeningHours[];
  /** Google Maps place link used for "Get directions". */
  readonly mapsUrl: string;
  /** Google Maps embed query (address or place id) used by the map iframe. */
  readonly mapsEmbedQuery: string;
  readonly image: string;
}

export interface SocialLink {
  readonly label: string;
  readonly href: string;
}

const weekdayHours: OpeningHours = {
  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
  opens: "09:00",
  closes: "18:00",
};

export const siteConfig = {
  name: "Streamline Performance Garage",
  legalName: "Streamline Performance Garage, LLC",
  /** Two-line wordmark used by the Logo component. */
  wordmark: { primary: "Streamline", secondary: "Performance Garage" },
  tagline: "Japanese Automotive Specialists",
  description:
    "Streamline Performance Garage is an independent Japanese automotive specialist in Concord, NC serving the Charlotte metro. Alignments, suspension, brakes, wheels and tires, maintenance, diagnostics, engine work and dyno tuning for Subaru, Nissan, Honda and other Japanese platforms.",
  url: env.NEXT_PUBLIC_SITE_URL,
  email: "streamlineperformancellc@gmail.com",
  primaryPhone: "+17042775099",
  /** TODO(owner): confirm the year the shop opened; null hides "since" copy and schema. */
  foundingYear: null as number | null,
  priceRange: "$$",
  logo: "/images/logo.svg",
  locale: "en_US",
  instagramHandle: "streamline_performance_garage",
  socials: [
    {
      label: "Instagram",
      href: "https://www.instagram.com/streamline_performance_garage/",
    },
    { label: "Facebook", href: "https://www.facebook.com/StreamlinePerformanceGarage/" },
  ] as const satisfies readonly SocialLink[],
  /** Physical shops. Adding a second shop = adding one object here. */
  locations: [
    {
      id: "concord",
      city: "Concord",
      name: "Streamline Performance Garage – Concord, NC",
      phone: "+17042775099",
      address: {
        streetAddress: "5978 Grand National Ln SW",
        addressLocality: "Concord",
        addressRegion: "NC",
        postalCode: "28027",
        addressCountry: "US",
      },
      /** Geocoded from the street address (OpenStreetMap). TODO(owner): confirm pin. */
      geo: { latitude: 35.3452, longitude: -80.6762 },
      hours: [weekdayHours],
      mapsUrl:
        "https://www.google.com/maps/search/?api=1&query=Streamline+Performance+Garage+5978+Grand+National+Ln+SW+Concord+NC+28027",
      mapsEmbedQuery:
        "Streamline Performance Garage, 5978 Grand National Ln SW, Concord, NC 28027",
      image: "/images/locations/concord-shop.svg",
    },
  ] as const satisfies readonly Location[],
  /** Makes the shop is known for; drives hero copy, schema and content ordering. */
  primaryMakes: ["Subaru", "Nissan", "Honda"] as const,
  /** Cities/areas used for areaServed schema and service-area copy. */
  serviceAreas: [
    "Concord",
    "Charlotte",
    "Kannapolis",
    "Harrisburg",
    "Huntersville",
    "Mooresville",
    "Cornelius",
    "Davidson",
    "Matthews",
    "Mint Hill",
    "Mount Pleasant",
    "Salisbury",
  ] as const,
  counties: ["Cabarrus County", "Mecklenburg County"] as const,
} as const;

export type SiteConfig = typeof siteConfig;
export type LocationId = SiteConfig["locations"][number]["id"];
export type SiteLocation = SiteConfig["locations"][number];

export function getLocation(id: LocationId): SiteLocation {
  const location = siteConfig.locations.find((candidate) => candidate.id === id);
  if (!location) {
    // Unreachable given the LocationId type, but keeps the function total.
    throw new Error(`Unknown location id: ${id}`);
  }
  return location;
}

export function isLocationId(value: string): value is LocationId {
  return siteConfig.locations.some((location) => location.id === value);
}

/** The shop customers call by default (first location). */
export const primaryLocation: SiteLocation = siteConfig.locations[0];
