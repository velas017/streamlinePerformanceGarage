import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  type GoogleReview,
  getGoogleReviews,
  normalizeReview,
  resolveReviewsMode,
  selectFeaturedReviews,
} from "@/lib/google-reviews";
import type * as SiteConfigModule from "@/lib/site-config";

const mockEnv = vi.hoisted(() => ({
  NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
  GOOGLE_BUSINESS_CLIENT_ID: undefined as string | undefined,
  GOOGLE_BUSINESS_CLIENT_SECRET: undefined as string | undefined,
  GOOGLE_BUSINESS_REFRESH_TOKEN: undefined as string | undefined,
  GOOGLE_REVIEWS_MODE: undefined as "live" | "mock" | "off" | undefined,
  VERCEL_ENV: undefined as "production" | "preview" | "development" | undefined,
}));
const mockBusiness = vi.hoisted(() => ({
  accountId: null as string | null,
  locationId: null as string | null,
  reviewsUrl: null,
  writeReviewUrl: null,
}));
vi.mock("@/lib/env", () => ({ env: mockEnv }));
vi.mock("@/lib/site-config", async (importOriginal) => {
  const actual = await importOriginal<typeof SiteConfigModule>();
  return {
    ...actual,
    siteConfig: { ...actual.siteConfig, googleBusiness: mockBusiness },
  };
});

function review(
  id: string,
  rating: GoogleReview["rating"],
  createdAt: string,
  text = "Test text",
): GoogleReview {
  return { id, author: "Test", rating, text, createdAt };
}

function configureLive() {
  Object.assign(mockEnv, {
    GOOGLE_BUSINESS_CLIENT_ID: "client",
    GOOGLE_BUSINESS_CLIENT_SECRET: "secret",
    GOOGLE_BUSINESS_REFRESH_TOKEN: "refresh",
  });
  Object.assign(mockBusiness, { accountId: "111", locationId: "222" });
}

beforeEach(() => {
  Object.assign(mockEnv, {
    GOOGLE_BUSINESS_CLIENT_ID: undefined,
    GOOGLE_BUSINESS_CLIENT_SECRET: undefined,
    GOOGLE_BUSINESS_REFRESH_TOKEN: undefined,
    GOOGLE_REVIEWS_MODE: undefined,
    VERCEL_ENV: undefined,
  });
  Object.assign(mockBusiness, { accountId: null, locationId: null });
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("selectFeaturedReviews", () => {
  it("keeps 4- and 5-star reviews with text, newest first, capped at the limit", () => {
    const picked = selectFeaturedReviews(
      [
        review("old-5", 5, "2026-01-01T00:00:00Z"),
        review("three", 3, "2026-10-01T00:00:00Z"),
        review("blank", 5, "2026-10-02T00:00:00Z", "   "),
        review("new-4", 4, "2026-10-03T00:00:00Z"),
        review("mid-5", 5, "2026-06-01T00:00:00Z"),
      ],
      4,
      2,
    );
    expect(picked.map((item) => item.id)).toEqual(["new-4", "mid-5"]);
  });
});

describe("normalizeReview", () => {
  it("maps star ratings, hides anonymous reviewers and drops unrated reviews", () => {
    expect(
      normalizeReview({
        reviewId: "a",
        reviewer: {
          displayName: "Ann",
          profilePhotoUrl: "https://lh3.googleusercontent.com/x",
        },
        starRating: "FIVE",
        comment: " Test ",
        createTime: "2026-10-01T00:00:00Z",
      }),
    ).toEqual({
      id: "a",
      author: "Ann",
      photoUrl: "https://lh3.googleusercontent.com/x",
      rating: 5,
      text: "Test",
      createdAt: "2026-10-01T00:00:00Z",
    });
    expect(
      normalizeReview({
        reviewId: "b",
        reviewer: {
          isAnonymous: true,
          profilePhotoUrl: "https://lh3.googleusercontent.com/y",
        },
        starRating: "FOUR",
        createTime: "2026-10-01T00:00:00Z",
      }),
    ).toMatchObject({ author: "A Google user", rating: 4, text: "" });
    expect(
      normalizeReview({
        reviewId: "c",
        starRating: "STAR_RATING_UNSPECIFIED",
        createTime: "2026-10-01T00:00:00Z",
      }),
    ).toBeNull();
  });
});

describe("resolveReviewsMode", () => {
  it("is off until the API is configured, and live once it is", () => {
    expect(resolveReviewsMode()).toBe("off");
    configureLive();
    expect(resolveReviewsMode()).toBe("live");
  });

  it("serves samples in production only until the API is connected", () => {
    mockEnv.GOOGLE_REVIEWS_MODE = "mock";
    mockEnv.VERCEL_ENV = "production";
    expect(resolveReviewsMode()).toBe("mock");
    configureLive();
    expect(resolveReviewsMode()).toBe("live");
    mockEnv.VERCEL_ENV = "preview";
    expect(resolveReviewsMode()).toBe("mock");
  });
});

describe("getGoogleReviews (mock)", () => {
  it("returns the labelled samples, newest first, through the live selection", async () => {
    mockEnv.GOOGLE_REVIEWS_MODE = "mock";
    const now = new Date("2026-10-27T12:00:00Z");
    const result = await getGoogleReviews(now);
    if (result.status !== "ok") throw new Error(`expected ok, got ${result.status}`);
    const { reviews, sample } = result.data;
    expect(sample).toBe(true);
    expect(reviews.length).toBeGreaterThan(3);
    expect(reviews).toEqual(selectFeaturedReviews(reviews));
    expect(reviews.every((item) => Date.parse(item.createdAt) < now.getTime())).toBe(
      true,
    );
  });
});

describe("getGoogleReviews (live)", () => {
  it("trades the refresh token, fetches newest reviews and keeps the featured ones", async () => {
    configureLive();
    const fetchMock = vi.fn(async (input: string | URL) => {
      const url = String(input);
      if (url === "https://oauth2.googleapis.com/token") {
        return Response.json({ access_token: "access" });
      }
      return Response.json({
        averageRating: 4.8,
        totalReviewCount: 40,
        reviews: [
          {
            reviewId: "r1",
            reviewer: { displayName: "Ann" },
            starRating: "FIVE",
            comment: "Test",
            createTime: "2026-10-01T00:00:00Z",
          },
          {
            reviewId: "r2",
            reviewer: { displayName: "Bo" },
            starRating: "TWO",
            comment: "Test",
            createTime: "2026-10-02T00:00:00Z",
          },
        ],
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    const result = await getGoogleReviews();
    expect(result).toEqual({
      status: "ok",
      data: {
        reviews: [expect.objectContaining({ id: "r1" })],
        averageRating: 4.8,
        totalReviewCount: 40,
        sample: false,
      },
    });
    const reviewsUrl = new URL(String(fetchMock.mock.calls[1]?.[0]));
    expect(reviewsUrl.pathname).toBe("/v4/accounts/111/locations/222/reviews");
    expect(reviewsUrl.searchParams.get("orderBy")).toBe("updateTime desc");
  });

  it("reports unavailable instead of throwing when Google fails", async () => {
    configureLive();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("nope", { status: 500 })),
    );
    expect(await getGoogleReviews()).toEqual({ status: "unavailable" });
    expect(console.error).toHaveBeenCalled();
  });
});
