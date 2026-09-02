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
  /** Services page hero: the service bays with cars on the lifts. */
  servicesHero: {
    src: "/images/services/services-hero-shop-bays-honda-s2000-lifts-concord-nc.jpg",
    alt: "Three black Honda S2000s in the Streamline Performance Garage service bays in Concord, NC, two of them raised on lifts",
    width: 2560,
    height: 1440,
    blurDataURL:
      "data:image/webp;base64,UklGRpoAAABXRUJQVlA4II4AAAAwBACdASoYAA0APu1iqU2ppaQiMAgBMB2JZwDKAYv+fvQ1FeFupLr+pQAA+yBWqE1pQ2obGLfjhNT3v++2TkM6f/1e+u469DbnGtRarNYYShPpt1v79a18NSXa/nPP3iijnaQmh7nnqXpNDCCcCHUCoduSoejPsGLsgSHYJ5Fuosb0GDMpyr78VOKRIAAA",
  },
  /** Contact page hero: cars on the alignment rack. */
  contactHero: {
    src: "/images/contact/contact-hero-lexus-is-f-alignment-rack-concord-nc.jpg",
    alt: "Blue Lexus IS F and a gray Lexus IS 300 on the alignment rack inside the Streamline Performance Garage shop in Concord, NC",
    width: 2560,
    height: 1440,
    blurDataURL:
      "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAACQAwCdASoYAA0APu1iqk4ppaQiMAgBMB2JQBUeg0bsM8sTBZ2AAP55MXi7FTriWxjiMFCpUCh3FYGa+sUFJECFe5wYzPMzEwcz/dGRRMo/fPbK1XKBLM67WtrqNqF3pNCvO39DJH7p88I49+MMja3nA9/9vegpMKjbvTmzZlAJCsJoXwG3NCkPoAA=",
  },
  /** About page hero: NSX on the shop floor with a WRX on the lift behind it. */
  aboutHero: {
    src: "/images/about/about-hero-acura-nsx-shop-floor-concord-nc.jpg",
    alt: "Black first-generation Acura NSX on the floor of the Streamline Performance Garage shop in Concord, NC, with a white Subaru WRX on the lift behind it",
    width: 2560,
    height: 1440,
    blurDataURL:
      "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAABQBACdASoYAA0APu1iqU2ppaOiMAgBMB2JZQDImCPQKGhZFlZLnIRelIqAAP4Y95eYbDjQ0Lvd6o+vCe9jP/X6SAEFvy996Rb04mG7S73/sUZHZHhppUtb/Dfc+E+Iie3Bm9mAXFsGbbRuqMp4x66IvDVAZ8aVlPg/ixuq71G4NITHw6kOLSkvAAA=",
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
