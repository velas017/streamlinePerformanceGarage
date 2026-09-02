import { Logo } from "@/components/layout/Logo";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { InternalLink } from "@/components/ui/Link";
import { HoursTable } from "@/components/sections/HoursTable";
import { footerNavigation } from "@/content/navigation";
import { locationHref } from "@/lib/routes";
import { siteConfig } from "@/lib/site-config";
import { formatPhone, joinWithAnd, telHref } from "@/lib/utils";

const footerLinkClasses =
  "focus-ring inline-flex min-h-11 items-center rounded-md text-muted hover:text-fg";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_2fr]">
          <div className="flex flex-col gap-6">
            <Logo />
            <p className="max-w-sm text-muted">
              {siteConfig.tagline}. {siteConfig.description.split(". ")[0]}.
            </p>
            <ul className="flex gap-2" aria-label="Social media">
              {siteConfig.socials.map((social) => (
                <li key={social.href}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${footerLinkClasses} px-2`}
                  >
                    {social.label}
                    <span className="sr-only"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* NAP blocks — identical data to site-config everywhere (CLAUDE.md §7). */}
          <div className="grid gap-10 sm:grid-cols-2">
            {siteConfig.locations.map((location) => (
              <address key={location.id} className="flex flex-col gap-3 not-italic">
                <h2 className="font-display text-xl font-bold tracking-wide uppercase">
                  <InternalLink
                    href={locationHref(location.id)}
                    className="rounded-md focus-ring hover:text-accent"
                  >
                    {location.city}, {location.address.addressRegion}
                  </InternalLink>
                </h2>
                <p className="flex items-start gap-2 text-muted">
                  <Icon name="map-pin" className="mt-1" />
                  <span>
                    {location.address.streetAddress}
                    <br />
                    {location.address.addressLocality}, {location.address.addressRegion}{" "}
                    {location.address.postalCode}
                  </span>
                </p>
                <a
                  href={telHref(location.phone)}
                  className={`${footerLinkClasses} gap-2`}
                >
                  <Icon name="phone" />
                  {formatPhone(location.phone)}
                </a>
                <HoursTable hours={location.hours} compact />
              </address>
            ))}
          </div>
        </div>

        <nav
          aria-label="Footer"
          className="mt-14 grid gap-10 border-t border-border pt-12 sm:grid-cols-3"
        >
          {footerNavigation.map((group) => (
            <div key={group.heading}>
              <h2 className="mb-3 font-display text-lg font-bold tracking-wide uppercase">
                {group.heading}
              </h2>
              <ul className="flex flex-col">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <InternalLink href={link.href} className={footerLinkClasses}>
                      {link.label}
                    </InternalLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 text-sm text-muted">
          <p>
            Serving {joinWithAnd(siteConfig.serviceAreas)} and the greater{" "}
            {joinWithAnd(siteConfig.counties)} area.
          </p>
          <p>
            © {year} {siteConfig.legalName}. All rights reserved.{" "}
            <a
              href={`mailto:${siteConfig.email}`}
              className="rounded-md underline-offset-4 focus-ring hover:text-fg hover:underline"
            >
              {siteConfig.email}
            </a>
          </p>
        </div>
      </Container>
    </footer>
  );
}
