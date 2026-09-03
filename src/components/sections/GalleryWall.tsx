"use client";

import Image from "next/image";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import type { GalleryPhoto } from "@/content/gallery";
import { siteConfig } from "@/lib/site-config";

export interface GalleryWallProps {
  readonly photos: readonly GalleryPhoto[];
}

/** Tile widths per breakpoint match the column counts below. */
const TILE_SIZES = "(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw";

const controlClasses =
  "focus-ring inline-flex size-11 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-surface/80 text-fg hover:bg-surface-2";

/**
 * Board-style photo wall (Pinterest / Airbnb gallery pattern): CSS multi-column
 * layout where every tile keeps its own aspect ratio and the columns balance
 * themselves. No JavaScript is involved in the layout and dimensions are known
 * up front, so nothing shifts as photos load.
 *
 * The viewer is a native <dialog>: focus trap, Escape and focus return come from
 * the browser. A click anywhere that is not the photo or a control closes it.
 */
export function GalleryWall({ photos }: GalleryWallProps) {
  const [current, setCurrent] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const dialogId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (current !== null && !dialog.open) dialog.showModal();
    if (current === null && dialog.open) dialog.close();
    document.documentElement.classList.toggle("overflow-hidden", current !== null);
    return () => document.documentElement.classList.remove("overflow-hidden");
  }, [current]);

  const step = useCallback(
    (delta: 1 | -1) => {
      setCurrent((index) =>
        index === null ? index : (index + delta + photos.length) % photos.length,
      );
    },
    [photos.length],
  );

  // A click anywhere that is not the photo or a control closes the viewer
  // (backdrop, empty space, caption area). Keyboard users have Esc and Close.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest("img, button")) dialog.close();
    };
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  // Arrow keys step through photos while the viewer is open.
  useEffect(() => {
    if (current === null) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [current, step]);

  const active = current === null ? null : (photos[current] ?? null);

  return (
    <>
      <ul className="columns-2 gap-3 md:columns-3 xl:columns-4">
        {photos.map((photo, index) => (
          <li key={photo.id} className="mb-3 break-inside-avoid">
            <button
              type="button"
              aria-label={`Open photo: ${photo.caption}`}
              aria-haspopup="dialog"
              aria-controls={dialogId}
              onClick={(event) => {
                openerRef.current = event.currentTarget;
                setCurrent(index);
              }}
              className="group relative block w-full cursor-zoom-in overflow-hidden rounded-lg bg-surface-2 text-left focus-ring"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes={TILE_SIZES}
                placeholder="blur"
                blurDataURL={photo.blurDataURL}
                className="h-auto w-full transition-transform group-hover:scale-[1.03] motion-safe:duration-300"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg/90 via-bg/60 to-bg/0 px-3 pt-10 pb-3 text-sm font-medium text-fg"
              >
                {photo.caption}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-label="Photo viewer"
        onClose={() => {
          setCurrent(null);
          openerRef.current?.focus();
        }}
        className="fixed inset-0 m-0 h-dvh max-h-none w-screen max-w-none cursor-zoom-out bg-transparent p-0 text-fg backdrop:bg-bg/95 open:grid open:grid-rows-[auto_1fr_auto]"
      >
        {active ? (
          <>
            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-sm text-muted">
                <span className="font-display font-bold tracking-wider text-fg uppercase">
                  {siteConfig.name}
                </span>
                <span className="ml-3 hidden sm:inline">
                  Click outside the photo or press Esc to close
                </span>
              </p>
              <button
                type="button"
                aria-label="Close photo viewer"
                onClick={() => dialogRef.current?.close()}
                className={controlClasses}
              >
                <Icon name="close" className="size-5" />
              </button>
            </div>

            <div className="relative min-h-0 px-4">
              <Image
                key={active.id}
                src={active.src}
                alt={active.alt}
                fill
                sizes="100vw"
                quality={85}
                placeholder="blur"
                blurDataURL={active.blurDataURL}
                className="cursor-default object-contain"
              />
            </div>

            <div className="flex items-center justify-between gap-4 px-4 py-3">
              <p className="text-base">
                {active.caption}
                <span className="block text-sm text-muted">
                  {current !== null ? current + 1 : 0} of {photos.length}
                </span>
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => step(-1)}
                  className={controlClasses}
                >
                  <Icon name="chevron-left" className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => step(1)}
                  className={controlClasses}
                >
                  <Icon name="chevron-right" className="size-5" />
                </button>
              </div>
            </div>
          </>
        ) : null}
      </dialog>
    </>
  );
}
