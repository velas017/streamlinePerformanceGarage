import Image from "next/image";
import { Card } from "@/components/ui/Card";
import { StarRating } from "@/components/ui/StarRating";
import type { GoogleReview } from "@/lib/google-reviews";
import { cn, excerpt, formatRelativeDate } from "@/lib/utils";

/** Long reviews are cut here; "See all reviews on Google" has the full text. */
const REVIEW_EXCERPT = 320;

export interface ReviewCardProps {
  readonly review: GoogleReview;
  /** Reference time for "3 weeks ago" (the page's render time). */
  readonly now: Date;
  readonly className?: string;
}

/** One Google review: who wrote it and when, the stars, and the text. */
export function ReviewCard({ review, now, className }: ReviewCardProps) {
  return (
    <Card className={cn("w-full", className)}>
      <div className="flex items-center gap-3">
        {review.photoUrl ? (
          <Image
            src={review.photoUrl}
            alt=""
            width={40}
            height={40}
            className="size-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-2 font-semibold text-fg"
          >
            {review.author.charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <p className="truncate font-semibold text-fg">{review.author}</p>
          <p className="text-sm text-muted">
            <time dateTime={review.createdAt}>
              {formatRelativeDate(review.createdAt, now)}
            </time>
          </p>
        </div>
      </div>
      <StarRating rating={review.rating} />
      <blockquote className="flex-1">
        <p className="text-fg">“{excerpt(review.text, REVIEW_EXCERPT)}”</p>
      </blockquote>
    </Card>
  );
}
