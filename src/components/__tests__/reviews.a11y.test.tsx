import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ReviewsSection } from "@/components/sections/ReviewsSection";
import type { GoogleReviewsData } from "@/lib/google-reviews";
import { primaryLocation } from "@/lib/site-config";
import { renderAccessible } from "@/test/render";

const NOW = new Date("2026-10-21T12:00:00.000Z");

/** Obviously synthetic: real review text never appears in the codebase. */
const data: GoogleReviewsData = {
  reviews: [
    {
      id: "t1",
      author: "Test Reviewer",
      rating: 5,
      text: "Test review one.",
      createdAt: "2026-10-14T12:00:00.000Z",
    },
    {
      id: "t2",
      author: "A Google user",
      rating: 4,
      text: "Test review two.",
      createdAt: "2026-09-21T12:00:00.000Z",
    },
  ],
  averageRating: 4.86,
  totalReviewCount: 132,
  sample: false,
};

const originalMatchMedia = window.matchMedia;
const originalScrollTo = HTMLElement.prototype.scrollTo;
const originalScrollBy = HTMLElement.prototype.scrollBy;

afterEach(() => {
  vi.useRealTimers();
  window.matchMedia = originalMatchMedia;
  HTMLElement.prototype.scrollTo = originalScrollTo;
  HTMLElement.prototype.scrollBy = originalScrollBy;
});

describe("ReviewsSection", () => {
  it("says which reviews it shows, sums up all reviews and renders one card each", async () => {
    await renderAccessible(<ReviewsSection result={{ status: "ok", data }} now={NOW} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "What customers say" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Recent 4- and 5-star reviews from Google."),
    ).toBeInTheDocument();
    expect(screen.getByText(/out of 5 from 132 Google reviews/)).toHaveTextContent(
      "4.9 out of 5 from 132 Google reviews",
    );
    const list = screen.getByRole("list", { name: "Google reviews" });
    expect(list.querySelectorAll(":scope > li")).toHaveLength(2);
    expect(list.closest("[data-nosnippet]")).toBeNull();
    expect(screen.getByRole("img", { name: "5 out of 5 stars" })).toBeInTheDocument();
    expect(screen.getByText("last week")).toBeInTheDocument();
    const allReviews = screen.getByRole("link", { name: /see all reviews on google/i });
    expect(allReviews).toHaveAttribute("href", primaryLocation.mapsUrl);
    expect(allReviews).toHaveAttribute("target", "_blank");
    expect(screen.queryByText(/sample reviews/i)).toBeNull();
  });

  it("labels sample data as samples and keeps it out of search snippets", async () => {
    await renderAccessible(
      <ReviewsSection
        result={{ status: "ok", data: { ...data, sample: true } }}
        now={NOW}
      />,
    );
    const notice = screen.getByText(/sample reviews and rating, not from real customers/i);
    expect(notice.closest("[data-nosnippet]")).not.toBeNull();
    expect(
      screen.getByRole("list", { name: "Google reviews" }).closest("[data-nosnippet]"),
    ).not.toBeNull();
  });

  it("falls back to a link to Google when the reviews are unavailable", async () => {
    await renderAccessible(
      <ReviewsSection result={{ status: "unavailable" }} now={NOW} />,
    );
    expect(screen.queryByRole("list", { name: "Google reviews" })).toBeNull();
    expect(screen.getByText(/read what customers say/i)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /see all reviews on google/i }),
    ).toBeInTheDocument();
  });
});

describe("auto-advancing carousel", () => {
  it("advances on a timer, holds on hover, and the Pause button stops it", () => {
    vi.useFakeTimers();
    const scrollTo = vi.fn();
    const scrollBy = vi.fn();
    HTMLElement.prototype.scrollTo = scrollTo;
    HTMLElement.prototype.scrollBy = scrollBy;
    render(
      <main>
        <ReviewsSection result={{ status: "ok", data }} now={NOW} />
      </main>,
    );
    const moves = () => scrollTo.mock.calls.length + scrollBy.mock.calls.length;

    act(() => vi.advanceTimersByTime(6000));
    expect(moves()).toBe(1);

    const list = screen.getByRole("list", { name: "Google reviews" });
    fireEvent.pointerEnter(list);
    act(() => vi.advanceTimersByTime(12000));
    expect(moves()).toBe(1);
    fireEvent.pointerLeave(list);
    act(() => vi.advanceTimersByTime(6000));
    expect(moves()).toBe(2);

    fireEvent.click(screen.getByRole("button", { name: "Pause automatic scrolling" }));
    act(() => vi.advanceTimersByTime(18000));
    expect(moves()).toBe(2);
    expect(
      screen.getByRole("button", { name: "Start automatic scrolling" }),
    ).toBeInTheDocument();
  });

  it("never moves on its own for visitors who prefer reduced motion", () => {
    window.matchMedia = ((query: string) => ({
      ...originalMatchMedia(query),
      matches: query === "(prefers-reduced-motion: reduce)",
    })) as typeof window.matchMedia;
    render(
      <main>
        <ReviewsSection result={{ status: "ok", data }} now={NOW} />
      </main>,
    );
    expect(screen.queryByRole("button", { name: /automatic scrolling/i })).toBeNull();
  });
});
