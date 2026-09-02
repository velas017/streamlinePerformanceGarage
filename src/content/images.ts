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
  /** Brand mark (split-face S2000 / Impreza silhouette), white for dark surfaces: header, footer, OG cards. */
  logoMarkWhite: {
    src: "/images/logo/logo-mark-white.png",
    alt: "Streamline Performance Garage logo",
    width: 960,
    height: 615,
  },
  /** Black master of the same mark for light surfaces and the Organization schema logo. */
  logoMarkBlack: {
    src: "/images/logo/logo-mark-black.png",
    alt: "Streamline Performance Garage logo",
    width: 1200,
    height: 769,
  },
  hero: {
    src: "/images/hero/home-hero-honda-s2000-track-concord-nc.jpg",
    alt: "Blue Honda S2000 time attack car in Streamline Performance livery, number 618, at speed on a race track",
    width: 2560,
    height: 1707,
    blurDataURL:
      "data:image/webp;base64,UklGRrgAAABXRUJQVlA4IKwAAAAQBACdASoYABAAPu1iqU2ppaOiMAgBMB2JbACdL11s/wHj+wbhawguAAD+8MgsXVijnzN5Aj2JDydvy0kweLzaaQuEA2TVKMaH4thW+WpIl3Z01Vm19vN0eqEM+/P+C4m/Dz6sO8Dmq0XNsZw3oL1HBCFvEEGbSwBpTM29g9mpZ7Vz0rH+3XfmEmHMbD56ayr/E7H9+a1vnvwIn8S6UQVlJRWNl+6Ox7aQYAAA",
  },
  /** Concord shop floor: Locations page hero, the location card and the AutoRepair schema. */
  concordShop: {
    src: "/images/locations/locations-hero-shop-floor-s2000-wrx-concord-nc.jpg",
    alt: "Inside the Streamline Performance Garage shop in Concord, NC: a black wide-body Honda S2000 on the floor and a blue Subaru Impreza WRX on the lift",
    width: 2560,
    height: 1440,
    blurDataURL:
      "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAACQBACdASoYAA0APu1iqU2ppaOiMAgBMB2JQBfpP/1LGFPsaBaGg+u8eW8USbAA/qK184inb0koVpXIK81bfxIoYjcl3YWMOqlcsXgK2YZDgFcOOTXP/A9bo/SrAXLHidwcVQye6OF+Y8MaOyqdiAe1w7RZ+KHZRaAJA7NaC4GOLr2PT/uimIYsyF/3pKo8AsZP7IOwOLp39a9/AAA=",
  },
  /** About page story section: engine work in progress on the shop floor. */
  aboutShopFloor: {
    src: "/images/about/about-shop-floor-wrx-sti-engine-removal-concord-nc.jpg",
    alt: "Blue Subaru WRX STI inside the Streamline Performance Garage shop with its boxer engine removed and hanging from an engine hoist",
    width: 1600,
    height: 900,
    blurDataURL:
      "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAAAQBACdASoYAA0APu1iqk2ppaQiMAgBMB2JQBbZMYnVhzLpGY70/6PQgAD9xEONVe2JZGi1lR0IR0NBMGjyN/DWbNWGOX637VGvQ68tMBNudtr1GuR3USxtozuyZg5EsSG64/h4dbMyn+LpVt2XzQ4Yv1TxgrSsvQFnm2SCDQsSkjTVc7GJIDsTAIIqt4fNzMhsqnAA",
  },
} as const satisfies Record<string, SiteImage>;
