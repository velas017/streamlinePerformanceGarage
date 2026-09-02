import { Card } from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { StarRating } from "@/components/ui/StarRating";
import { testimonials } from "@/content/testimonials";

export function Testimonials() {
  return (
    <Section id="reviews" labelledBy="reviews-heading">
      <SectionHeader
        id="reviews-heading"
        eyebrow="Customer reviews"
        title="Trusted by enthusiasts across the Carolinas"
      />
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((item) => (
          <li key={`${item.name}-${item.vehicle}`} className="flex">
            <Card className="w-full">
              <StarRating rating={item.rating} />
              <blockquote className="flex-1">
                <p className="text-fg">“{item.quote}”</p>
              </blockquote>
              <p className="text-sm text-muted">
                <span className="font-semibold text-fg">{item.name}</span> ·{" "}
                {item.vehicle} · {item.hometown}
              </p>
            </Card>
          </li>
        ))}
      </ul>
    </Section>
  );
}
