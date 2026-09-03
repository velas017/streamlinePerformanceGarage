import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { GalleryTeaser } from "@/components/sections/GalleryTeaser";
import { GalleryWall } from "@/components/sections/GalleryWall";
import { galleryPhotos } from "@/content/gallery";
import { renderAccessible } from "@/test/render";

describe("gallery", () => {
  it("renders one named button per photo and a closed viewer", async () => {
    const photos = galleryPhotos.slice(0, 3);
    await renderAccessible(<GalleryWall photos={photos} />);
    const buttons = screen.getAllByRole("button", { name: /open photo/i });
    expect(buttons).toHaveLength(photos.length);
    expect(buttons[0]).toHaveAttribute("aria-haspopup", "dialog");
    expect(document.querySelector("dialog")?.hasAttribute("open")).toBe(false);
  });

  it("teaser links every tile to the gallery", async () => {
    await renderAccessible(<GalleryTeaser />);
    const links = screen.getAllByRole("link", { name: /open the gallery/i });
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toHaveAttribute("href", "/gallery");
  });
});
