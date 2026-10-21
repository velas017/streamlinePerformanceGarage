import { ReviewsSection } from "@/components/sections/ReviewsSection";
import { getGoogleReviews } from "@/lib/google-reviews";

/**
 * Server component: fetches the shop's Google reviews with the page's ISR and
 * renders them, or a link to Google when they are unavailable. Renders nothing
 * until the Business Profile API is set up (or in production in mock mode).
 */
export async function GoogleReviews() {
  const result = await getGoogleReviews();
  if (result.status === "off") return null;
  return <ReviewsSection result={result} />;
}
