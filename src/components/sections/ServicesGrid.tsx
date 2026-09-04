import { ServiceCard } from "@/components/sections/ServiceCard";
import { Section, type SectionProps } from "@/components/ui/Section";
import { SectionHeader, type SectionHeaderProps } from "@/components/ui/SectionHeader";
import type { Service } from "@/content/services";
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
            <ServiceCard service={service} compact={compact} />
          </li>
        ))}
      </ul>
      {footer ? <div className="mt-10 flex justify-center">{footer}</div> : null}
    </Section>
  );
}
