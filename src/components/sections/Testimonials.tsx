import { TestimonialCard } from "@/components/sections/TestimonialCard";
import { CARD_SLIDE_WIDTH, Carousel, CarouselItem } from "@/components/ui/Carousel";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { testimonials } from "@/content/testimonials";

/** Customer reviews in the shared carousel: 1 per view on phones, 2 on tablets, 3 on desktop. */
export function Testimonials() {
  return (
    <Section id="reviews" labelledBy="reviews-heading">
      <SectionHeader
        id="reviews-heading"
        eyebrow="Customer reviews"
        title="Trusted by enthusiasts across the Carolinas"
      />
      <Carousel label="Customer reviews">
        {testimonials.map((item) => (
          <CarouselItem key={`${item.name}-${item.vehicle}`} className={CARD_SLIDE_WIDTH}>
            <TestimonialCard testimonial={item} />
          </CarouselItem>
        ))}
      </Carousel>
    </Section>
  );
}
