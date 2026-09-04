import Image from "next/image";
import { Carousel, CarouselItem } from "@/components/ui/Carousel";
import { Icon } from "@/components/ui/Icon";
import type { InstagramPost } from "@/lib/instagram";

export interface InstagramCarouselProps {
  readonly posts: readonly InstagramPost[];
  readonly handle: string;
}

const MEDIA_ICON = { IMAGE: null, VIDEO: "play", CAROUSEL_ALBUM: "layers" } as const;

function excerpt(caption: string, max = 90): string {
  const clean = caption.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/** Instagram posts in the shared carousel: 1 tile wide on phones, 2 on tablets, 4 on desktop. */
export function InstagramCarousel({ posts, handle }: InstagramCarouselProps) {
  return (
    <Carousel label={`Recent Instagram posts from @${handle}`}>
      {posts.map((post) => {
        const badge = MEDIA_ICON[post.mediaType];
        return (
          <CarouselItem
            key={post.id}
            className="w-[72vw] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]"
          >
            <a
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative block aspect-square w-full overflow-hidden rounded-lg border border-border bg-surface-2 focus-ring"
            >
              <Image
                src={post.imageUrl}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 72vw"
                className="object-cover transition-transform group-hover:scale-[1.03] motion-safe:duration-300"
              />
              {badge ? (
                <span className="absolute top-3 right-3 rounded-full bg-bg/80 p-1.5 text-fg">
                  <Icon name={badge} className="size-4" />
                </span>
              ) : null}
              <span className="sr-only">
                {post.caption
                  ? `Instagram post: ${excerpt(post.caption)}`
                  : "View Instagram post"}
                {post.mediaType === "VIDEO" ? " (video)" : ""} (opens in a new tab)
              </span>
            </a>
          </CarouselItem>
        );
      })}
    </Carousel>
  );
}
