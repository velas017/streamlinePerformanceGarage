import { z } from "zod";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

/**
 * Google reviews for the home page, from the shop's own Business Profile (API
 * v4 `reviews.list`, OAuth with the owner's refresh token). Only 4- and 5-star
 * reviews with text are shown, newest first, and the section says so: filtering
 * by rating is fine as long as the page never implies these are all the
 * reviews (FTC 16 CFR 465.7(b)). Mirrors lib/instagram.ts: validated, cached
 * with the page's hourly ISR, and never able to break the home page.
 */

export type StarCount = 1 | 2 | 3 | 4 | 5;

export interface GoogleReview {
  readonly id: string;
  readonly author: string;
  readonly photoUrl?: string;
  readonly rating: StarCount;
  readonly text: string;
  /** ISO timestamp of when the review was written. */
  readonly createdAt: string;
}

export interface GoogleReviewsData {
  readonly reviews: readonly GoogleReview[];
  /** Across ALL of the shop's reviews, as Google reports it. */
  readonly averageRating?: number;
  readonly totalReviewCount?: number;
  /** True for the labelled samples shown in mock mode. */
  readonly sample: boolean;
}

export type GoogleReviewsResult =
  | { readonly status: "ok"; readonly data: GoogleReviewsData }
  /** Set up, but Google could not be reached or answered unexpectedly. */
  | { readonly status: "unavailable" }
  | { readonly status: "off" };

export type ReviewsMode = "live" | "mock" | "off";

export const FEATURED_MIN_RATING = 4;
export const FEATURED_LIMIT = 10;
const ANONYMOUS_AUTHOR = "A Google user";

const STAR_COUNTS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 } as const;

const timestamp = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Invalid timestamp",
});

const reviewSchema = z.object({
  reviewId: z.string(),
  reviewer: z
    .object({
      displayName: z.string().optional(),
      profilePhotoUrl: z.url().optional(),
      isAnonymous: z.boolean().optional(),
    })
    .optional(),
  starRating: z.enum(["STAR_RATING_UNSPECIFIED", "ONE", "TWO", "THREE", "FOUR", "FIVE"]),
  comment: z.string().optional(),
  createTime: timestamp,
});

const reviewsResponseSchema = z.object({
  reviews: z.array(reviewSchema).optional(),
  averageRating: z.number().optional(),
  totalReviewCount: z.number().int().optional(),
});

const tokenResponseSchema = z.object({ access_token: z.string().min(1) });

interface LiveConfig {
  readonly clientId: string;
  readonly clientSecret: string;
  readonly refreshToken: string;
  readonly accountId: string;
  readonly locationId: string;
}

function liveConfig(): LiveConfig | null {
  const { accountId, locationId } = siteConfig.googleBusiness;
  const clientId = env.GOOGLE_BUSINESS_CLIENT_ID;
  const clientSecret = env.GOOGLE_BUSINESS_CLIENT_SECRET;
  const refreshToken = env.GOOGLE_BUSINESS_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken || !accountId || !locationId)
    return null;
  return { clientId, clientSecret, refreshToken, accountId, locationId };
}

export function resolveReviewsMode(): ReviewsMode {
  const requested = env.GOOGLE_REVIEWS_MODE;
  // Sample reviews must never reach the live site, whatever the variable says.
  if (requested === "mock") return env.VERCEL_ENV === "production" ? "off" : "mock";
  if (requested) return requested;
  return liveConfig() ? "live" : "off";
}

/** Pure: the newest `limit` reviews with at least `minRating` stars and some text. */
export function selectFeaturedReviews(
  reviews: readonly GoogleReview[],
  minRating: number = FEATURED_MIN_RATING,
  limit: number = FEATURED_LIMIT,
): GoogleReview[] {
  return reviews
    .filter((review) => review.rating >= minRating && review.text.trim().length > 0)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);
}

export function normalizeReview(item: z.infer<typeof reviewSchema>): GoogleReview | null {
  if (item.starRating === "STAR_RATING_UNSPECIFIED") return null;
  const named = !item.reviewer?.isAnonymous && Boolean(item.reviewer?.displayName);
  return {
    id: item.reviewId,
    author: named ? (item.reviewer?.displayName ?? ANONYMOUS_AUTHOR) : ANONYMOUS_AUTHOR,
    ...(named && item.reviewer?.profilePhotoUrl
      ? { photoUrl: item.reviewer.profilePhotoUrl }
      : {}),
    rating: STAR_COUNTS[item.starRating],
    text: (item.comment ?? "").trim(),
    createdAt: item.createTime,
  };
}

async function fetchLiveReviews(config: LiveConfig): Promise<GoogleReviewsData> {
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      refresh_token: config.refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!tokenResponse.ok) {
    throw new Error(`Google token endpoint responded ${tokenResponse.status}`);
  }
  const token = tokenResponseSchema.parse(await tokenResponse.json());

  const url = new URL(
    `https://mybusiness.googleapis.com/v4/accounts/${config.accountId}/locations/${config.locationId}/reviews`,
  );
  url.searchParams.set("pageSize", "50");
  url.searchParams.set("orderBy", "updateTime desc");
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!response.ok) throw new Error(`Business Profile API responded ${response.status}`);
  const parsed = reviewsResponseSchema.safeParse(await response.json());
  if (!parsed.success)
    throw new Error("Business Profile API returned an unexpected shape");

  const reviews = (parsed.data.reviews ?? [])
    .map(normalizeReview)
    .filter((review) => review !== null);
  return {
    reviews: selectFeaturedReviews(reviews),
    averageRating: parsed.data.averageRating,
    totalReviewCount: parsed.data.totalReviewCount,
    sample: false,
  };
}

const SAMPLE_TEXTS = [
  "Sample review. The shop's real Google reviews replace these cards once the Business Profile API is connected.",
  "Sample review, short.",
  "Sample review with a longer body, to check how the card handles a customer who writes several sentences about the car, the work and the visit. Real reviews vary this much in length, so the layout has to cope with both.",
  "Sample review. Four stars, to show the rating row with an empty star.",
] as const;

/** Labelled samples for design review before the API is connected. Never shown in production. */
function sampleReviews(now: Date): GoogleReviewsData {
  const day = 24 * 60 * 60 * 1000;
  const reviews = [3, 9, 16, 30, 52, 75].map((daysAgo, index): GoogleReview => {
    const text = SAMPLE_TEXTS.at(index % SAMPLE_TEXTS.length) ?? SAMPLE_TEXTS[0];
    return {
      id: `sample-${index + 1}`,
      author: `Sample reviewer ${index + 1}`,
      rating: text.includes("Four stars") ? 4 : 5,
      text,
      createdAt: new Date(now.getTime() - daysAgo * day).toISOString(),
    };
  });
  return { reviews, averageRating: 4.9, totalReviewCount: 48, sample: true };
}

/**
 * Never throws: a revoked token or a Google outage must not take the home page
 * down. "off" renders nothing; "unavailable" renders a link to the reviews.
 */
export async function getGoogleReviews(now = new Date()): Promise<GoogleReviewsResult> {
  const mode = resolveReviewsMode();
  if (mode === "off") return { status: "off" };
  if (mode === "mock") return { status: "ok", data: sampleReviews(now) };
  const config = liveConfig();
  if (!config) {
    console.error(
      "[google-reviews] live mode needs the OAuth variables and the account/location IDs",
    );
    return { status: "unavailable" };
  }
  try {
    return { status: "ok", data: await fetchLiveReviews(config) };
  } catch (error) {
    console.error("[google-reviews] reviews unavailable:", error);
    return { status: "unavailable" };
  }
}
