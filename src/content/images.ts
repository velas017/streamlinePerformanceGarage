/**
 * Site imagery. One entry per image the pages reference, so src, dimensions,
 * alt text and blur placeholders live in one place. Sources come from
 * assets/source/ and are optimized into public/images/ (see assets/source/README.md).
 */
export interface SiteImage {
  readonly src: string;
  /** Descriptive alt text; name the make/model when a car is shown (CLAUDE.md §5). */
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  /** Tiny base64 preview shown while the full image loads. */
  readonly blurDataURL?: string;
}

export const images = {
  hero: {
    src: "/images/hero/honda-s2000-streamline-performance-garage-concord-nc.jpg",
    alt: "Blue Honda S2000 time attack car in Streamline Performance livery, number 618, at speed on a race track",
    width: 2560,
    height: 1707,
    blurDataURL:
      "data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAAAQBACdASoYABAAPu1iqU2ppaOiMAgBMB2JbACdL11s/wHj+wbhawguAAD+8MgsXVijnzN5Aj2JDydvy0kweLzaaQuEA2TVKMaH4thW+WpIl3Z01Vm19vN0eqEM+/P+C4m/Dz6sO8Dmq0XNsZw3oL1HBCFvEEGbSwBpTM29g9mpZ7Vz0rH+3XfmEmHMbD56ayr/E7H9+a1vnvwIn8S6UQVlJRWNl+6Ox7aQYAAA",
  },
  /** TODO(owner): replace placeholder with a real shop-floor photo. */
  aboutShopFloor: {
    src: "/images/about-shop-floor.svg",
    alt: "Technician working on a Subaru WRX STI on the lift at the Streamline Performance Garage shop in Concord",
    width: 1200,
    height: 900,
  },
} as const satisfies Record<string, SiteImage>;
