import { LocationCard } from "@/components/sections/LocationCard";
import { ServiceAreaCard } from "@/components/sections/ServiceAreaCard";
import { Section } from "@/components/ui/Section";
import { SectionHeader, type SectionHeaderProps } from "@/components/ui/SectionHeader";
import { serviceAreas } from "@/content/service-areas";
import { siteConfig } from "@/lib/site-config";

export interface LocationsSectionProps {
  readonly header?: Partial<Omit<SectionHeaderProps, "id">>;
}

/** The shop plus the cities it serves. Adding a location or area updates this automatically. */
export function LocationsSection({ header }: LocationsSectionProps) {
  return (
    <Section id="locations" labelledBy="locations-heading" tone="surface">
      <SectionHeader
        id="locations-heading"
        eyebrow="Visit the shop"
        title="Concord, North Carolina"
        description="Just off I-85 near Charlotte Motor Speedway. Drivers come in from Charlotte, Kannapolis, Harrisburg, Huntersville and across the metro."
        {...header}
      />
      <ul className="grid gap-6 lg:grid-cols-2">
        {siteConfig.locations.map((location) => (
          <li key={location.id} className="flex">
            <LocationCard location={location} />
          </li>
        ))}
        {serviceAreas.map((area) => (
          <li key={area.slug} className="flex">
            <ServiceAreaCard area={area} />
          </li>
        ))}
      </ul>
    </Section>
  );
}
