import { Card, CardLink } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { Service } from "@/content/services";
import { serviceHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  readonly service: Service;
  /** Icon + title only (used in dense grids). */
  readonly compact?: boolean;
  readonly className?: string;
}

/** One service card; the whole card is a link to the service page. */
export function ServiceCard({ service, compact = false, className }: ServiceCardProps) {
  return (
    <Card interactive className={cn("w-full", className)}>
      <Icon name={service.icon} className="size-8 text-accent" />
      <h3 className="text-display-sm">
        <CardLink
          href={serviceHref(service.slug)}
          className="text-fg after:rounded-lg hover:text-accent"
        >
          {service.name}
        </CardLink>
      </h3>
      {compact ? null : <p className="text-muted">{service.summary}</p>}
      <span
        aria-hidden="true"
        className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent"
      >
        Learn more <Icon name="arrow-right" className="size-4" />
      </span>
    </Card>
  );
}
