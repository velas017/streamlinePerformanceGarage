import { ServiceCard } from "@/components/sections/ServiceCard";
import { Button } from "@/components/ui/Button";
import { CARD_SLIDE_WIDTH, Carousel, CarouselItem } from "@/components/ui/Carousel";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import type { Service } from "@/content/services";

export interface ServicesCarouselProps {
  readonly services: readonly Service[];
}

/**
 * Home page services strip: the same cards as the Services page, in the shared
 * carousel so phones swipe sideways instead of scrolling through a long column.
 */
export function ServicesCarousel({ services }: ServicesCarouselProps) {
  return (
    <Section id="services" labelledBy="services-heading">
      <SectionHeader
        id="services-heading"
        eyebrow="What we do"
        title="Performance, service, and repair, done right"
        description="From factory-scheduled maintenance services to full engine builds, every job gets the same attention to detail and quality standards."
      />
      <Carousel label="Services">
        {services.map((service) => (
          <CarouselItem key={service.slug} className={CARD_SLIDE_WIDTH}>
            <ServiceCard service={service} />
          </CarouselItem>
        ))}
      </Carousel>
      <div className="mt-6 flex justify-center">
        <Button href="/services" variant="secondary" icon="arrow-right">
          See all services
        </Button>
      </div>
    </Section>
  );
}
