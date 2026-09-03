import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { galleryPhotos } from "@/content/gallery";

/** Every gallery entry must be complete before it ships (CLAUDE.md §5, §7). */
describe("gallery registry", () => {
  it("has at least one photo", () => {
    expect(galleryPhotos.length).toBeGreaterThan(0);
  });

  it.each(galleryPhotos.map((photo) => [photo.id, photo] as const))(
    "%s has alt text, a caption and an existing file",
    (_id, photo) => {
      expect(photo.alt.trim().length).toBeGreaterThan(10);
      expect(photo.caption.trim().length).toBeGreaterThan(0);
      expect(photo.alt.toLowerCase()).not.toContain("todo");
      expect(existsSync(path.join(process.cwd(), "public", photo.src))).toBe(true);
    },
  );

  it("ids are unique", () => {
    const ids = galleryPhotos.map((photo) => photo.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
