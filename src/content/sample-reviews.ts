/**
 * Stand-ins for the Google reviews section while the Business Profile API is
 * not connected (`GOOGLE_REVIEWS_MODE=mock`, on in production by client
 * decision 2026-10-27). They are invented, so the section always labels them as
 * samples and keeps them out of search snippets, and real reviews replace them
 * as soon as the API is configured. Written to look like real reviews: the
 * shop's makes and services, mixed lengths, one 4-star review and one long
 * enough to be cut off.
 */

export interface SampleReview {
  readonly author: string;
  readonly rating: 4 | 5;
  /** How long ago it was "written", so the dates always look recent. */
  readonly daysAgo: number;
  readonly text: string;
}

export const sampleReviews = [
  {
    author: "Marcus Bell",
    rating: 5,
    daysAgo: 4,
    text: "Brought my 2019 WRX in for a tune and the difference is night and day. They walked me through every pull on the AWD dyno and explained each change before making it. It even drives smoother than stock around town.",
  },
  {
    author: "Jasmine R.",
    rating: 5,
    daysAgo: 11,
    text: "Quick, honest and fair. Found the cause of a check engine light on my Civic that two other shops couldn't pin down.",
  },
  {
    author: "Tyler Nguyen",
    rating: 4,
    daysAgo: 19,
    text: "Great alignment on my 350Z after I lowered it. The car tracks straight and the inside tire wear is gone. Only reason for four stars is I waited about a week for an opening, which tells you how busy they are.",
  },
  {
    author: "Chris Delgado",
    rating: 5,
    daysAgo: 33,
    text: "I've been taking my GR86 here since I bought it and won't go anywhere else. Started with oil changes, then coilovers and a performance alignment on their Hunter machine, and most recently a full brake upgrade before my first track day. Every visit they send photos of what they find, give me options instead of just a bill, and the car comes back cleaner than I dropped it off. You can tell they love what they do.",
  },
  {
    author: "Brandon K.",
    rating: 5,
    daysAgo: 47,
    text: "Clutch went out on my Impreza on a Friday. They had it back the next week with a new clutch and flywheel, and it shifts better than it ever has.",
  },
  {
    author: "Alyssa Moore",
    rating: 5,
    daysAgo: 68,
    text: "Finally a shop that knows Hondas. Mounted and balanced a new set of wheels and tires on my S2000 and replaced a bad TPMS sensor while it was in.",
  },
  {
    author: "Devin Carter",
    rating: 5,
    daysAgo: 96,
    text: "Turbo install on my 240SX. Clean work, everything tucked away and labelled, and they tuned it on the dyno before handing it back. Highly recommend.",
  },
  {
    author: "Sam Whitfield",
    rating: 5,
    daysAgo: 140,
    text: "Friendly team. Did the scheduled maintenance on my wife's Outback and my 370Z on the same day.",
  },
] as const satisfies readonly SampleReview[];

/** The rating line above the cards, also invented and labelled with them. */
export const sampleReviewSummary = { averageRating: 4.9, totalReviewCount: 48 } as const;
