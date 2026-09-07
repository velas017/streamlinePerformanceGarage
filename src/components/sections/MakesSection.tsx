import { MakeCard } from "@/components/sections/MakeCard";
import { CARD_SLIDE_WIDTH, Carousel, CarouselItem } from "@/components/ui/Carousel";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { makes } from "@/content/makes";

/** Makes we specialize in, in the shared carousel: 1 per view on phones, 2 on tablets, 3 on desktop. */
export function MakesSection() {
  return (
    <Section id="makes" labelledBy="makes-heading" tone="surface">
      <SectionHeader
        id="makes-heading"
        eyebrow="Platforms we specialize in"
        title="Built around Japanese performance"
        description="We work on these cars every day, which means we have the right tools, the right parts relationships, and the platform knowledge to keep your car reliable at a fraction of the cost of the dealer."
      />
      <Carousel label="Makes we specialize in">
        {makes.map((entry) => (
          <CarouselItem key={entry.make} className={CARD_SLIDE_WIDTH}>
            <MakeCard entry={entry} />
          </CarouselItem>
        ))}
      </Carousel>
    </Section>
  );
}
