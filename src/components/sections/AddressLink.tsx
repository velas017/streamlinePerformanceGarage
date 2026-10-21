import { Icon } from "@/components/ui/Icon";
import type { SiteLocation } from "@/lib/site-config";
import { cn } from "@/lib/utils";

export interface AddressLinkProps {
  readonly location: SiteLocation;
  readonly className?: string;
}

/**
 * A location's street address as a link that opens it in Google Maps (new tab),
 * so visitors get directions in one tap. Every rendered address uses this, so the
 * NAP text stays identical to site-config wherever it appears.
 */
export function AddressLink({ location, className }: AddressLinkProps) {
  const { address } = location;
  return (
    <a
      href={location.mapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "flex min-h-11 items-start gap-2 rounded-md text-muted focus-ring hover:text-fg",
        className,
      )}
    >
      <Icon name="map-pin" className="mt-1" />
      <span className="underline underline-offset-4">
        {address.streetAddress} <br />
        {address.addressLocality}, {address.addressRegion} {address.postalCode}
      </span>
      <span className="sr-only"> (opens Google Maps in a new tab)</span>
    </a>
  );
}
