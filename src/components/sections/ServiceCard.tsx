import { Card, CardLink } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import type { Service } from "@/content/services";
import { visibility } from "@/content/visibility";
import { serviceHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface ServiceCardProps {
  readonly service: Service;
  /** Icon + title only (used in dense grids). */
  readonly compact?: boolean;
  readonly className?: string;
}

/**
 * One service card. While the service pages are published the whole card links
 * to its page; while they are hidden (content/visibility.ts) it is a plain card
 * with no link, hover state or "Learn more".
 */
export function ServiceCard({ service, compact = false, className }: ServiceCardProps) {
  const linked = visibility.servicePages;
  return (
    <Card interactive={linked} className={cn("w-full", className)}>
      <Icon name={service.icon} className="size-8 text-accent" />
      <h3 className="text-display-sm">
        {linked ? (
          <CardLink
            href={serviceHref(service.slug)}
            className="text-fg after:rounded-lg hover:text-accent"
          >
            {service.name}
          </CardLink>
        ) : (
          service.name
        )}
      </h3>
      {compact ? null : <p className="text-muted">{service.summary}</p>}
      {linked ? (
        <span
          aria-hidden="true"
          className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-accent"
        >
          Learn more <Icon name="arrow-right" className="size-4" />
        </span>
      ) : null}
    </Card>
  );
}
