"use client";

import {
  type ComponentPropsWithoutRef,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { Icon } from "@/components/ui/Icon";
import { cn } from "@/lib/utils";

export interface CarouselProps {
  /** Accessible name for the scrolling list, e.g. "Services". */
  readonly label: string;
  readonly children: ReactNode;
  readonly className?: string;
}

/**
 * Horizontal scroll-snap carousel shared by the Instagram feed, the services
 * strip and the reviews strip. Scrolling works without JavaScript (swipe,
 * trackpad, keyboard focus moving between items); the prev/next buttons are
 * progressive enhancement and disable at either end. Items are server-rendered
 * children wrapped in <CarouselItem>, so content stays in the static HTML.
 */
export function Carousel({ label, children, className }: CarouselProps) {
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
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(updateButtons);
    observer?.observe(el);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      observer?.disconnect();
    };
  }, [updateButtons]);

  const scrollBy = (direction: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({
      left: direction * el.clientWidth * 0.8,
      behavior: reduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className={cn("relative", className)}>
      <ul
        ref={scrollerRef}
        id={listId}
        aria-label={label}
        className="-mx-4 flex snap-x snap-mandatory scroll-px-4 [scrollbar-width:none] gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6 lg:-mx-8 lg:scroll-px-8 lg:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {children}
      </ul>

      <div className="mt-4 flex justify-end gap-2">
        {(
          [
            {
              dir: -1,
              icon: "chevron-left",
              label: "Scroll to previous items",
              enabled: canScroll.prev,
            },
            {
              dir: 1,
              icon: "chevron-right",
              label: "Scroll to next items",
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
            className="inline-flex size-11 items-center justify-center rounded-md border border-border-strong text-fg focus-ring hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Icon name={control.icon} className="size-5" />
          </button>
        ))}
      </div>
    </div>
  );
}

export type CarouselItemProps = ComponentPropsWithoutRef<"li">;

/** One slide. Pass width classes (per breakpoint) via className. */
export function CarouselItem({ className, ...rest }: CarouselItemProps) {
  return <li className={cn("flex shrink-0 snap-start", className)} {...rest} />;
}

/** Slide widths that show 1 card on phones, 2 on tablets and 3 on desktop. */
export const CARD_SLIDE_WIDTH =
  "w-[82vw] sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]";
