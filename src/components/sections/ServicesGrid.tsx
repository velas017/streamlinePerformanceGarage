import { Card, CardLink } from "@/components/ui/Card";
import { Icon } from "@/components/ui/Icon";
import { Section, type SectionProps } from "@/components/ui/Section";
import { SectionHeader, type SectionHeaderProps } from "@/components/ui/SectionHeader";
import type { Service } from "@/content/services";
import { serviceHref } from "@/lib/routes";
import { cn } from "@/lib/utils";

export interface ServicesGridProps {
  readonly services: readonly Service[];
  readonly header: Omit<SectionHeaderProps, "id">;
  readonly id?: string;
  readonly tone?: SectionProps["tone"];
  readonly compact?: boolean;
  readonly footer?: React.ReactNode;
}

/** Data-driven grid of service cards; one card per Service object. */
export function ServicesGrid({
  services,
  header,
  id = "services",
  tone,
  compact = false,
  footer,
}: ServicesGridProps) {
  const headingId = `${id}-heading`;
  return (
    <Section id={id} labelledBy={headingId} tone={tone}>
      <SectionHeader id={headingId} {...header} />
      <ul
        className={cn(
          "grid gap-4 sm:grid-cols-2",
          compact ? "lg:grid-cols-4" : "lg:grid-cols-3",
        )}
      >
        {services.map((service) => (
          <li key={service.slug} className="flex">
            <Card interactive className="w-full">
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
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-10 flex justify-center">{footer}</div> : null}
    </Section>
  );
}
