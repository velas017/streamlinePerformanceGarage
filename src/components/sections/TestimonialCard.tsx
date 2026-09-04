import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import type { Testimonial } from "@/content/testimonials";
import { cn } from "@/lib/utils";

export interface TestimonialCardProps {
  readonly testimonial: Testimonial;
  readonly className?: string;
}

export function TestimonialCard({ testimonial, className }: TestimonialCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <StarRating rating={testimonial.rating} />
      <blockquote className="flex-1">
        <p className="text-fg">“{testimonial.quote}”</p>
      </blockquote>
      <p className="text-sm text-muted">
        <span className="font-semibold text-fg">{testimonial.name}</span> ·{" "}
        {testimonial.vehicle} · {testimonial.hometown}
      </p>
    </Card>
  );
}
