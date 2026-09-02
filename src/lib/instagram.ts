import { z } from "zod";
import { env } from "@/lib/env";
import { siteConfig } from "@/lib/site-config";

/**
 * Instagram feed data source. Mirrors what IAG Performance's "Instafeed" widget
 * does, but server-side and dependency-free: the business account's recent
 * media is fetched from the Instagram API with ISR caching, validated, and
 * normalized. Without a token the feed renders a follow CTA instead of fake posts.
 *
 * Setup (README → "Instagram feed"): Instagram Business/Creator account →
 * Meta app with "Instagram API with Instagram Login" → long-lived token
 * (60 days, refreshable) → INSTAGRAM_ACCESS_TOKEN.
 */

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramPost {
  readonly id: string;
  readonly permalink: string;
  /** Always an image: media_url for photos, thumbnail_url for videos. */
  readonly imageUrl: string;
  readonly caption: string;
  readonly mediaType: InstagramMediaType;
  readonly timestamp: string;
}

const mediaSchema = z.object({
  id: z.string(),
  caption: z.string().optional(),
  media_type: z.enum(["IMAGE", "VIDEO", "CAROUSEL_ALBUM"]),
  media_url: z.url().optional(),
  thumbnail_url: z.url().optional(),
  permalink: z.url(),
  timestamp: z.string(),
});

const responseSchema = z.object({ data: z.array(mediaSchema) });

export const INSTAGRAM_REVALIDATE_SECONDS = 60 * 60;
export const INSTAGRAM_POST_LIMIT = 8;

export const instagramProfileUrl =
  `https://www.instagram.com/${siteConfig.instagramHandle}/` as const;

export type InstagramFeedMode = "live" | "mock" | "off";

export function resolveFeedMode(): InstagramFeedMode {
  if (env.INSTAGRAM_FEED_MODE) return env.INSTAGRAM_FEED_MODE;
  return env.INSTAGRAM_ACCESS_TOKEN ? "live" : "off";
}

function normalize(item: z.infer<typeof mediaSchema>): InstagramPost | null {
  const imageUrl =
    item.media_type === "VIDEO" ? (item.thumbnail_url ?? item.media_url) : item.media_url;
  if (!imageUrl) return null;
  return {
    id: item.id,
    permalink: item.permalink,
    imageUrl,
    caption: item.caption ?? "",
    mediaType: item.media_type,
    timestamp: item.timestamp,
  };
}

async function fetchLivePosts(limit: number, token: string): Promise<InstagramPost[]> {
  const url = new URL("https://graph.instagram.com/me/media");
  url.searchParams.set(
    "fields",
    "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp",
  );
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("access_token", token);

  const response = await fetch(url, {
    next: { revalidate: INSTAGRAM_REVALIDATE_SECONDS },
  });
  if (!response.ok) {
    throw new Error(`Instagram API responded ${response.status}`);
  }
  const parsed = responseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error("Instagram API returned an unexpected shape");
  }
  return parsed.data.data.map(normalize).filter((post) => post !== null);
}

/** Local placeholders so the carousel can be designed and reviewed before the API is connected. */
function mockPosts(limit: number): InstagramPost[] {
  const types: readonly InstagramMediaType[] = ["IMAGE", "CAROUSEL_ALBUM", "VIDEO"];
  return Array.from({ length: limit }, (_, index) => ({
    id: `mock-${index + 1}`,
    permalink: instagramProfileUrl,
    imageUrl: `/images/instagram-mock/instagram-placeholder-post-${(index % 8) + 1}.svg`,
    caption: `Placeholder post ${index + 1} — replace by connecting the Instagram API`,
    mediaType: types[index % types.length] ?? "IMAGE",
    timestamp: new Date(Date.UTC(2026, 7, 28 - index)).toISOString(),
  }));
}

/**
 * Never throws: a broken token or API outage must not take the home page down.
 * Returns [] when the feed is off or unavailable; callers render a follow CTA.
 */
export async function getInstagramPosts(
  limit = INSTAGRAM_POST_LIMIT,
): Promise<InstagramPost[]> {
  const mode = resolveFeedMode();
  if (mode === "off") return [];
  if (mode === "mock") return mockPosts(limit);
  const token = env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) return [];
  try {
    return await fetchLivePosts(limit, token);
  } catch (error) {
    console.error("[instagram] feed unavailable:", error);
    return [];
  }
}
