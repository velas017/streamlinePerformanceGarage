import Image from "next/image";
import { HoursTable } from "@/components/sections/HoursTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { locationHref } from "@/lib/routes";
import type { SiteLocation } from "@/lib/site-config";
import { formatPhone, telHref } from "@/lib/utils";

export interface LocationCardProps {
  readonly location: SiteLocation;
  /** Hide the "View shop" link when already on that location's page. */
  readonly showDetailsLink?: boolean;
  readonly headingLevel?: "h2" | "h3";
}

/** NAP + hours card for a location. Data comes exclusively from site-config. */
export function LocationCard({
  location,
  showDetailsLink = true,
  headingLevel: HeadingTag = "h3",
}: LocationCardProps) {
  return (
    <Card className="w-full p-0 sm:p-0">
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded-t-lg">
        <Image
          src={location.image.src}
          alt={location.image.alt}
          fill
          {...(location.image.blurDataURL
            ? { placeholder: "blur" as const, blurDataURL: location.image.blurDataURL }
            : {})}
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-4 p-6 sm:p-8">
        <HeadingTag className="text-display-md">
          {location.city}, {location.address.addressRegion}
        </HeadingTag>
        <address className="flex flex-col gap-3 not-italic">
          <p className="flex items-start gap-2 text-muted">
            <Icon name="map-pin" className="mt-1" />
            <span>
              {location.address.streetAddress}
              <br />
              {location.address.addressLocality}, {location.address.addressRegion}{" "}
              {location.address.postalCode}
            </span>
          </p>
          <p className="flex items-center gap-2">
            <Icon name="phone" className="text-muted" />
            <a
              href={telHref(location.phone)}
              className="inline-flex min-h-11 items-center rounded-md font-semibold text-fg focus-ring hover:text-accent"
            >
              {formatPhone(location.phone)}
            </a>
          </p>
          <div className="flex items-start gap-2">
            <Icon name="clock" className="mt-1 text-muted" />
            <HoursTable hours={location.hours} />
          </div>
        </address>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <Button
            href={location.mapsUrl}
            variant="secondary"
            size="sm"
            icon="map-pin"
            iconPosition="start"
            target="_blank"
            rel="noopener noreferrer"
          >
            Get directions
            <span className="sr-only">
              {" "}
              to the {location.city} shop (opens in a new tab)
            </span>
          </Button>
          {showDetailsLink ? (
            <Button
              href={locationHref(location.id)}
              variant="ghost"
              size="sm"
              icon="arrow-right"
            >
              View {location.city} shop
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
