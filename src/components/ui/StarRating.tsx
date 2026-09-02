import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface StarRatingProps {
  readonly rating: number;
  readonly max?: number;
  readonly className?: string;
}

export function StarRating({ rating, max = 5, className }: StarRatingProps) {
  return (
    <div
      className={cn("flex items-center gap-0.5 text-accent", className)}
      role="img"
      aria-label={`${rating} out of ${max} stars`}
    >
      {Array.from({ length: max }, (_, index) => (
        <Icon
          key={index}
          name="star"
          className={cn("size-4", index < rating ? "fill-current" : "opacity-30")}
        />
      ))}
    </div>
  );
}
