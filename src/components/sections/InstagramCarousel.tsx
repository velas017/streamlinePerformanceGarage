"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { InstagramPost } from "@/lib/instagram";
import { cn } from "@/lib/utils";

export interface InstagramCarouselProps {
  readonly posts: readonly InstagramPost[];
  readonly handle: string;
}

const MEDIA_ICON = { IMAGE: null, VIDEO: "play", CAROUSEL_ALBUM: "layers" } as const;

function excerpt(caption: string, max = 90): string {
  const clean = caption.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1)}…` : clean;
}

/**
 * Scroll-snap carousel of Instagram posts. Scrolling works without JS (swipe,
 * trackpad, keyboard focus moving between links); the prev/next buttons are
 * progressive enhancement and disable at either end.
 */
export function InstagramCarousel({ posts, handle }: InstagramCarouselProps) {
  const listId = useId();
  const scrollerRef = useRef<HTMLUListElement>(null);
  const [canScroll, setCanScroll] = useState({ prev: false, next: true });

  const updateButtons = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScroll({ prev: el.scrollLeft > 4, next: el.scrollLeft < maxScroll - 4 });
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    const observer = new ResizeObserver(updateButtons);
    observer.observe(el);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      observer.disconnect();
    };
  }, [updateButtons]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={scrollerRef}
        id={listId}
        aria-label={`Recent Instagram posts from @${handle}`}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((post) => {
          const badge = MEDIA_ICON[post.mediaType];
          return (
            <li
              key={post.id}
              className="w-[72vw] shrink-0 snap-start sm:w-[44vw] lg:w-[calc((100%-3*1rem)/4)]"
            >
              <a
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block aspect-square overflow-hidden rounded-lg border border-border bg-surface-2 focus-ring"
              >
                <Image
                  src={post.imageUrl}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 44vw, 72vw"
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
            </li>
          );
        })}
      </ul>

      <div className="mt-4 flex justify-end gap-2">
        {(
          [
            {
              dir: -1,
              icon: "chevron-left",
              label: "Scroll to previous posts",
              enabled: canScroll.prev,
            },
            {
              dir: 1,
              icon: "chevron-right",
              label: "Scroll to next posts",
              enabled: canScroll.next,
            },
          ] as const
        ).map((control) => (
          <button
            key={control.dir}
            type="button"
            aria-controls={listId}
            aria-label={control.label}
            disabled={!control.enabled}
            onClick={() => scrollBy(control.dir)}
            className={cn(
              "inline-flex size-11 items-center justify-center rounded-md border border-border-strong text-fg focus-ring hover:bg-surface-2",
              "disabled:cursor-not-allowed disabled:opacity-40",
            )}
          >
            <Icon name={control.icon} className="size-5" />
          </button>
        ))}
      </div>
    </div>
  );
}
