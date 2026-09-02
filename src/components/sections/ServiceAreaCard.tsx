import { Card, CardLink } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { ServiceArea } from "@/content/service-areas";
import { serviceAreaHref } from "@/lib/routes";

export interface ServiceAreaCardProps {
  readonly area: ServiceArea;
  readonly headingLevel?: "h2" | "h3";
}

/** Card for a city we serve from the shop. No address: it is not a location. */
export function ServiceAreaCard({
  area,
  headingLevel: HeadingTag = "h3",
}: ServiceAreaCardProps) {
  return (
    <Card interactive className="w-full">
      <Icon name="map-pin" className="size-8 text-accent" />
      <HeadingTag className="text-display-sm">
        <CardLink href={serviceAreaHref(area.slug)} className="text-fg hover:text-accent">
          Serving {area.name}, {area.region}
        </CardLink>
      </HeadingTag>
      <p className="text-muted">{area.lead}</p>
      <span
        aria-hidden="true"
        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent"
      >
        {area.name} drivers: what to expect <Icon name="arrow-right" className="size-4" />
      </span>
    </Card>
  );
}
