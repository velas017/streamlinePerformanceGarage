import { serviceAreas } from "@/content/service-areas";
import { services } from "@/content/services";
import { visibility } from "@/content/visibility";
import { type AppHref, locationHref, serviceAreaHref, serviceHref } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";

export interface NavLink {
  readonly label: string;
  readonly href: AppHref;
}

export interface NavItem extends NavLink {
  readonly children?: readonly NavLink[];
}

const serviceLinks: readonly NavLink[] = services.map((service) => ({
  label: service.shortName,
  href: serviceHref(service.slug),
}));

const locationLinks: readonly NavLink[] = [
  ...siteConfig.locations.map((location) => ({
    label: `${location.city} shop`,
    href: locationHref(location.id),
  })),
  ...serviceAreas.map((area) => ({
    label: `Serving ${area.name}`,
    href: serviceAreaHref(area.slug),
  })),
];

const locationItem: NavItem = {
  label: "Location",
  href: "/locations",
  children: locationLinks,
};

/** Drives both the desktop nav and the mobile menu. */
export const mainNavigation: readonly NavItem[] = [
  {
    label: "Services",
    href: "/services",
    children: visibility.servicePages ? serviceLinks : undefined,
  },
  ...(visibility.locationPages ? [locationItem] : []),
  { label: "Gallery", href: "/gallery" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export const primaryCta: NavLink = { label: "Book now", href: "/contact" };
