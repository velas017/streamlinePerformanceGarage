import { ReviewCard } from "@/components/sections/ReviewCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CARD_SLIDE_WIDTH, Carousel, CarouselItem } from "@/components/ui/Carousel";
import { Icon } from "@/components/ui/Icon";
import { Section } from "@/components/ui/Section";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { FEATURED_MIN_RATING, type GoogleReviewsResult } from "@/lib/google-reviews";
import { primaryLocation, siteConfig } from "@/lib/site-config";

/** Cards advance every 6 seconds (with a Pause button), as the client asked. */
const AUTO_ADVANCE_MS = 6000;

export interface ReviewsSectionProps {
  readonly result: Exclude<GoogleReviewsResult, { status: "off" }>;
  /** Reference time for "3 weeks ago"; defaults to render time. */
  readonly now?: Date;
}

/**
 * Google reviews on the home page. The description says which reviews are
 * shown (4 and 5 stars), and the rating summary covers every review, so the
 * selection never reads as the whole picture (FTC 16 CFR 465.7(b)). No review
 * schema: Google ignores a business's markup about its own reviews.
 */
export function ReviewsSection({ result, now = new Date() }: ReviewsSectionProps) {
  const reviewsUrl = siteConfig.googleBusiness.reviewsUrl ?? primaryLocation.mapsUrl;
  const writeReviewUrl = siteConfig.googleBusiness.writeReviewUrl;
  const data = result.status === "ok" ? result.data : null;

  return (
    <Section id="reviews" labelledBy="reviews-heading">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <SectionHeader
          id="reviews-heading"
          eyebrow="Google reviews"
          title="What customers say"
          description={`Recent ${FEATURED_MIN_RATING}- and 5-star reviews from Google.`}
          className="mb-0 sm:mb-0"
        />
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button
            href={reviewsUrl}
            variant="secondary"
            size="sm"
            icon="arrow-right"
            target="_blank"
            rel="noopener noreferrer"
          >
            See all reviews on Google
            <span className="sr-only"> (opens in a new tab)</span>
          </Button>
          {writeReviewUrl ? (
            <Button
              href={writeReviewUrl}
              variant="ghost"
              size="sm"
              target="_blank"
              rel="noopener noreferrer"
            >
              Leave a review
              <span className="sr-only"> (opens in a new tab)</span>
            </Button>
          ) : null}
        </div>
      </div>

      {/* Samples stay out of search results: data-nosnippet keeps Google from
          quoting invented review text without the notice beside it. */}
      <div {...(data?.sample ? { "data-nosnippet": "" } : {})}>
        {data?.averageRating !== undefined && data.totalReviewCount ? (
          <p className="mt-6 flex items-center gap-2 text-fg">
            <Icon name="star" className="size-5 fill-current text-accent" />
            <span>
              <span className="font-semibold">{data.averageRating.toFixed(1)}</span> out
              of 5 from {data.totalReviewCount.toLocaleString("en-US")} Google reviews
            </span>
          </p>
        ) : null}
        {data?.sample ? (
          <p className="mt-3 text-sm text-muted">
            Sample reviews and rating, not from real customers. The shop&apos;s Google
            reviews will replace them once they&apos;re connected.
          </p>
        ) : null}

        <div className="mt-8 sm:mt-10">
          {data && data.reviews.length > 0 ? (
            <Carousel label="Google reviews" autoAdvanceMs={AUTO_ADVANCE_MS}>
              {data.reviews.map((review) => (
                <CarouselItem key={review.id} className={CARD_SLIDE_WIDTH}>
                  <ReviewCard review={review} now={now} />
                </CarouselItem>
              ))}
            </Carousel>
          ) : (
            <Card className="items-start">
              <Icon name="star" className="size-8 text-accent" />
              <p className="text-lg text-fg">
                Read what customers say about {siteConfig.name} on Google.
              </p>
            </Card>
          )}
        </div>
      </div>
    </Section>
  );
}
