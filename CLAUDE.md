@AGENTS.md

# Streamline Performance Garage — Project Guide

Marketing + lead-generation website for **Streamline Performance Garage, LLC**, an
independent **Japanese automotive specialist** (Subaru, Nissan, Honda first) at
5978 Grand National Ln SW, **Concord, NC 28027**, serving the **Charlotte** metro.
There is ONE physical shop; Charlotte and other cities are _service areas_ with
their own landing pages, never fake second locations. (The repo folder is spelled
`StreamlinePerfromance`; never copy that typo into user-facing text. The brand's
old domain streamlineperformancegarage.com currently redirects elsewhere.)

Brand palette: **black, white and silver** only.

Every rule below is a hard requirement unless the user explicitly overrides it.

---

## 1. Stack

| Concern     | Choice                                                            |
| ----------- | ----------------------------------------------------------------- |
| Framework   | Next.js (App Router, React Server Components by default)          |
| Language    | TypeScript, `strict: true`, no `any`, no non-null `!` assertions  |
| Styling     | Tailwind CSS + design tokens in `globals.css`; `cva` for variants |
| Validation  | `zod` for every external input (forms, env, URL params, JSON)     |
| Lint/format | ESLint (`next/core-web-vitals`, `jsx-a11y`) + Prettier            |
| Tests       | Vitest + Testing Library + axe-core (`src/test/a11y.ts` helper)   |
| Package mgr | npm (`package-lock.json` is the lockfile of record)               |

## 2. Commands

```bash
npm run dev          # local dev server (http://localhost:3000)
npm run build        # production build — must pass before any PR/merge
npm run start        # serve the production build
npm run lint         # ESLint (includes jsx-a11y rules)
npm run typecheck    # tsc --noEmit
npm run test         # Vitest (unit + a11y)
npm run check        # lint + typecheck + test + build, in that order
```

## 3. Folder architecture

```
src/
  app/                      # Routes ONLY. Thin files: metadata + composition.
    layout.tsx              # Root layout: fonts, skip link, Header, Footer, JSON-LD org
    page.tsx                # Home
    services/page.tsx       # Services index
    services/[slug]/page.tsx# One page per service (generateStaticParams)
    locations/[slug]/page.tsx # Physical shop page(s) with NAP + AutoRepair schema
    service-areas/[slug]/page.tsx # City landing pages (no address/schema): charlotte
    about/page.tsx
    contact/page.tsx
    sitemap.ts robots.ts manifest.ts
    not-found.tsx error.tsx
  components/
    ui/                     # Primitives: Button, Container, Section, Heading, Card…
    layout/                 # Header, Footer, MobileNav, SkipLink
    sections/               # Page sections composed from ui/: Hero, ServicesGrid, InstagramFeed…
    seo/                    # JsonLd component (typed via schema-dts)
  content/                  # Static content as typed data (services, locations, faqs…)
  lib/
    site-config.ts          # SINGLE SOURCE OF TRUTH for business NAP, hours, socials
    routes.ts               # AppHref type + href helpers; validated by typedRoutes
    seo.ts                  # buildMetadata(), JSON-LD builders (AutoRepair, Service…)
    og.tsx                  # Shared ImageResponse renderer for opengraph-image.tsx files
    env.ts                  # zod-validated process.env — import this, never process.env
    leads.ts                # Contact-form schema + deliverLead() (LEAD_WEBHOOK_URL)
    instagram.ts            # Instagram media fetch (ISR) + mock/off modes
    rate-limit.ts           # In-memory limiter for the contact action
    utils.ts                # cn(), formatters, pure helpers
  styles/globals.css        # Tailwind v4 @theme tokens + base layer
  test/                     # Vitest setup + expectNoA11yViolations()
public/                     # Static assets (images under public/images/<area>/)
```

Rules:

- `app/` files compose sections and export metadata. They contain no business logic
  and no repeated markup.
- A component goes in `ui/` if it's generic, `sections/` if it's page-specific
  composition, `layout/` if it's chrome. Never mix.
- Content lives in `content/` as typed arrays/objects, never inline in JSX. Pages
  render by mapping over content. Adding a service = adding one object.

## 4. Engineering rules

### DRY — Don't Repeat Yourself

- **One source of truth.** Business name, addresses, phone numbers, hours, email,
  social links, service areas, brand colors: `src/lib/site-config.ts`. Anything that
  renders these imports from there. Hard-coding a phone number or address anywhere
  else is a bug.
- **Extract on the second use.** If markup, a Tailwind class string, or a helper
  appears twice, turn it into a component/variant/function before continuing.
- **Variants over copies.** Use `cva` (class-variance-authority) for Button, Badge,
  Heading, Section variants. Never duplicate a component to change a color.
- **Data-driven rendering.** Lists (services, locations, FAQs, testimonials, nav)
  are arrays in `content/` mapped in JSX. No hand-written repeated `<li>` blocks.
- **Shared metadata builder.** Every page calls `buildMetadata({...})` from
  `lib/seo.ts`. Never hand-write the full `Metadata` object per page.
- **Shared schema builders.** JSON-LD comes from typed builders in `lib/seo.ts`.
  Never inline `<script type="application/ld+json">` objects in pages.
- **Types derive from data.** `type ServiceSlug = (typeof services)[number]["slug"]`
  — don't maintain parallel unions by hand.

### Robustness

- `tsconfig`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`,
  `noFallthroughCasesInSwitch`. Fix types, don't cast around them.
  (`exactOptionalPropertyTypes` is intentionally off: React props treat
  `undefined` and "omitted" identically, and the flag fights that idiom.)
- Validate every boundary with zod: contact form (server action), env vars
  (`lib/env.ts`, fail fast at boot), dynamic route params (`notFound()` on miss).
- Server Components by default. Add `"use client"` only to the smallest leaf that
  needs state/effects/browser APIs (MobileNav toggle, form field state).
- No data fetching in `useEffect`. Fetch on the server; pass props down.
- Every route segment that can fail has `error.tsx`; dynamic segments call
  `notFound()` for unknown slugs; `not-found.tsx` is styled and navigable.
- Exhaustive `switch` with `never` checks; prefer `satisfies` over `as`.
- Server actions: validate input, rate-limit by IP, honeypot field, return typed
  `{ ok: true } | { ok: false; errors }`, never throw raw errors to the client.
- Never log or expose secrets. Public env vars must start with `NEXT_PUBLIC_`.
- Images: always `next/image` with explicit `width/height` or `fill` + `sizes`.
  Priority only on the LCP image (hero). Never a bare `<img>`.
- Fonts: `next/font` only (self-hosted, `display: swap`). No `<link>` font tags.
- Links: `next/link` for internal, `<a rel="noopener noreferrer" target="_blank">`
  only for external, and only when opening a new tab is justified (maps, socials).

## 5. Accessibility — WCAG 2.2 AA (non-negotiable)

- **Landmarks:** exactly one `<main>`, `<header>`, `<footer>`; `<nav aria-label>`
  for every nav (there are at least two: primary + footer). Use `<section>` with an
  `aria-labelledby` pointing at its heading.
- **Headings:** exactly one `<h1>` per page; no skipped levels; headings describe
  content, not style. `Heading` component takes `as` and `size` independently.
- **Skip link:** first focusable element, visible on focus, targets `#main`.
- **Keyboard:** everything operable by keyboard. Visible focus ring on all
  interactive elements (`focus-visible:` ring, ≥3:1 contrast against adjacent
  colors). Mobile menu: focus trapped when open, `Escape` closes, focus returns to
  the trigger, `aria-expanded` + `aria-controls` on the trigger.
- **Contrast:** text ≥ 4.5:1, large text (≥24px or ≥19px bold) ≥ 3:1, UI
  components & focus indicators ≥ 3:1. Verify token pairs; don't guess.
- **Target size:** interactive targets ≥ 44×44 CSS px (exceeds 2.5.8 minimum).
- **Images:** descriptive `alt` (include make/model when a car is shown);
  `alt=""` for decorative; never "image of" / "photo of".
- **Forms:** every input has a visible `<label>`; required fields marked in text,
  not color alone; errors rendered in text, linked via `aria-describedby`,
  `aria-invalid="true"` on the field, focus moves to first error on submit;
  success message in an `aria-live="polite"` region. `autocomplete` attributes set.
- **Motion:** respect `prefers-reduced-motion` — wrap non-essential animation in
  `motion-safe:`. No autoplay video with sound; no content that flashes.
- **Color is never the only signal.** Pair with text/icon/underline.
- **Links vs buttons:** links navigate, buttons act. Link text is meaningful out of
  context (no bare "Learn more" — use "Learn more about ECU tuning" or `aria-label`).
- **Current page:** `aria-current="page"` on the active nav link.
- **Language & zoom:** `<html lang="en">`; never set `user-scalable=no` or
  `maximum-scale`.
- **Enforcement:** `eslint-plugin-jsx-a11y` (strict config) must pass; every section
  component gets a Vitest + `axe` test asserting zero violations; run a Chrome
  DevTools Lighthouse accessibility audit (target 100) before calling a page done.

## 6. Mobile-responsive design

- **Mobile-first.** Base styles are for 320px; layer `sm: md: lg: xl:` upward.
  Never write desktop-first then "fix" mobile.
- **Test widths:** 320, 375, 390, 768, 1024, 1280, 1440. No horizontal scroll at any
  width. Use Chrome DevTools MCP device emulation to verify.
- **Fluid type & space:** headline sizes use `clamp()` tokens; section padding
  scales per breakpoint via the `Section` component, not per page.
- **Layout:** CSS grid/flex; `Container` component owns max-width + gutters. Use
  container queries (`@container`) for components reused in different widths.
- **Touch:** no hover-only interactions; anything revealed on hover is also
  reachable by tap/focus. Sticky "Call now" / "Book" CTA on mobile is acceptable
  but must not cover content or the skip link.
- **Images:** correct `sizes` attribute per layout so mobile doesn't download
  desktop assets. Hero uses `min-h-[100dvh]`-style units, never `100vh`.
- **Navigation:** hamburger under `lg`; inline nav at `lg+`. Same content list from
  `content/navigation.ts` drives both.
- **Tables** (pricing/spec) scroll horizontally inside their own container or
  collapse to stacked cards on small screens.

## 7. SEO (local + technical)

### Business context for content & keywords

- **Location:** one shop in Concord, NC (near Charlotte Motor Speedway, off I-85).
  Service area: Charlotte, Kannapolis, Harrisburg, Huntersville, Mooresville,
  Cornelius, Matthews, Mint Hill and the Cabarrus / Mecklenburg County area.
  `siteConfig.locations` holds physical shops; `content/service-areas.ts` holds
  cities that get a landing page. Never invent an address for a service area.
- **Specialty:** Japanese cars, with Subaru, Nissan and Honda first (per the
  business's own listing). Reference makes/models naturally: Subaru (WRX / STI,
  BRZ), Nissan (GT-R, 350Z / 370Z / Z, Skyline, Silvia 240SX), Honda / Acura
  (Civic Type R, S2000, NSX, Integra), Toyota
  (Supra, GR86 / 86, MR2, Celica), Subaru (WRX / STI, BRZ), Honda / Acura (Civic
  Type R, S2000, NSX, Integra), Mazda (RX-7, RX-8, MX-5 Miata), Mitsubishi
  (Lancer Evolution, Eclipse, 3000GT), Lexus (IS F, RC F, LC).
- **Core services (each gets its own page):** performance tuning / ECU tuning,
  turbo & supercharger installs, engine builds & rebuilds, suspension &
  alignment, brake upgrades, scheduled maintenance, diagnostics, pre-purchase
  inspections, JDM import service & compliance, drivetrain / clutch, exhaust &
  intake, track prep.
- **Primary keyword patterns:** "Japanese car repair Concord NC", "JDM mechanic
  Charlotte NC", "{make} specialist Charlotte", "{model} tuning Concord NC",
  "performance shop near me", "import performance shop Charlotte".

### Rules

- **Every page** exports `metadata` (static) or `generateMetadata` (dynamic) via
  `buildMetadata()`. Page title ≤ 55 chars, unique; the root template appends
  `" | Streamline Performance"`. Description 120–160 chars, includes a city name
  and a service/make where natural. Canonical URL set on every page.
- **Open Graph + Twitter** cards on every page. OG images are generated by the
  `opengraph-image.tsx` file conventions through the shared `lib/og.tsx` renderer;
  never hand-set `openGraph.images`.
- **One H1 per page** containing the primary keyword + location where it reads
  naturally. Never keyword-stuff; write for a human car enthusiast.
- **Structured data (JSON-LD)** via `lib/seo.ts` builders:
  - Root layout: `AutoRepair` (subtype of `LocalBusiness`) for each location, with
    `name`, `address`, `geo`, `telephone`, `openingHoursSpecification`,
    `areaServed`, `sameAs`, `priceRange`, `image`, `url`.
  - Service pages: `Service` with `provider` → the business, `areaServed`.
  - FAQ sections: `FAQPage`. Every service/location page should have 3–6 FAQs.
  - All non-home pages: `BreadcrumbList` (also rendered visually).
  - Never emit schema for content not visible on the page.
- **Location page** (`/locations/concord`): unique copy, embedded map, NAP block
  identical to `site-config`, directions, neighborhoods served, FAQs, AutoRepair
  schema. **Service-area pages** (`/service-areas/charlotte`): drive time from the
  shop, why it is worth the trip, neighborhoods, FAQs — Breadcrumb + FAQ schema
  only, no LocalBusiness schema, no address.
- **NAP consistency:** Name / Address / Phone rendered identically everywhere,
  sourced from `site-config`. Phone links are `tel:` with E.164 numbers.
- **Internal linking:** every service page links to both location pages and 2–3
  related services; location pages link to all services. Descriptive anchor text.
- **Sitemap / robots / manifest** generated from route data (`sitemap.ts` maps over
  `content/` — never a hand-maintained URL list). `robots.ts` references sitemap.
- **URLs:** lowercase, hyphenated, no trailing slashes, stable. Changing a slug
  requires a redirect in `next.config`.
- **Performance is SEO.** Core Web Vitals targets: LCP < 2.5s, INP < 200ms,
  CLS < 0.1. Pages are statically generated; hero image is `priority` with
  correct dimensions; no layout shift from fonts (`next/font`) or images
  (always sized); third-party scripts only via `next/script` with
  `strategy="lazyOnload"` or `afterInteractive`.
- **Images:** descriptive filenames (`nissan-gtr-r35-dyno-tuning-concord.jpg`),
  WebP/AVIF via `next/image`, alt text as in §5.
- **Verify with Chrome DevTools MCP:** Lighthouse SEO + Performance ≥ 95 on mobile
  before a page is considered done. Check rendered `<head>` for duplicates.

## 8. Design direction (from Mobbin research)

- **Palette (client-supplied): black, white, silver.** Monochrome by design: black
  backgrounds, white type and primary buttons, silver (`--color-accent`) for
  eyebrows, icons, links, hover states and the CTA banner. No other hue except
  the success/danger form states. Verified pairs are documented in `globals.css`.
- **Tone:** dark, cinematic, performance-garage. Full-bleed car photography with a
  gradient scrim; bold condensed display type. References: Mobbin sections from
  1Password × Red Bull Racing hero (full-bleed car, headline bottom-left, primary +
  secondary CTA), Rivian (dark, centered statement), Humble (trust bar under hero),
  and the Instagram carousel from iagperformance.com (Shopify "Instafeed" app:
  recent posts in a slider with a follow link).
- **Home page order:** Hero → trust bar → Services grid → Specialties by make →
  Instagram feed → Testimonials → Location + service areas → FAQ → final CTA.
- **Primary CTAs:** "Book service" (contact form) and "Call (704) 277-5099"
  (`tel:`). Both visible above the fold on mobile.
- **Instagram feed:** `lib/instagram.ts` fetches the business account's media
  (ISR 1h) when `INSTAGRAM_ACCESS_TOKEN` is set; `INSTAGRAM_FEED_MODE=mock`
  renders local placeholders for design review; otherwise a follow card renders.
  Never fake posts in production.

## 9. Definition of done (per page / component)

1. `npm run check` passes (lint, typecheck, tests, build).
2. No duplicated markup/data — content in `content/`, business info from
   `site-config`.
3. Axe test present and passing; keyboard walkthrough done; one H1; landmarks OK.
4. Verified at 320px and 1440px with no horizontal scroll.
5. `buildMetadata()` used; JSON-LD present and validated (Rich Results Test or
   schema validator); canonical correct.
6. Lighthouse (mobile) via Chrome DevTools MCP: Performance ≥ 95, A11y 100,
   SEO ≥ 95, Best Practices ≥ 95.

## 10. Next.js 16 specifics (this repo runs 16.3.x — do not use 14/15 idioms)

- `params` / `searchParams` are **Promises**; type pages with the global
  `PageProps<"/services/[slug]">` and layouts with `LayoutProps<"/">` (no import).
- `next/image`: `priority` is deprecated → use `preload` (hero only). Set
  `sizes` whenever `fill` or responsive width is used.
- `error.tsx` receives `{ error, retry }` (`retry` re-fetches; prefer it over `reset`).
- `middleware.ts` is now `proxy.ts` (Node runtime only). We currently need neither.
- `typedRoutes: true` is on. Every internal href is typed `AppHref` from
  `lib/routes.ts`; `npm run typecheck` runs `next typegen` first so route types
  exist. Link through `components/ui/Link.tsx` (`InternalLink`) or `Button`, never
  raw `next/link`, so dynamic hrefs stay type-checked.
- Server actions use `useActionState` from `react`; return typed state, never throw.
- `viewport` is its own export (`themeColor`, `colorScheme`), not part of `metadata`.
- JSON-LD is a plain `<script type="application/ld+json">` with `<` escaped
  (`components/seo/JsonLd.tsx`), not `next/script`.
- Pages are static by default; do not enable `cacheComponents` without reason.

## 11. Tooling & MCPs

- **Mobbin MCP** (`mcp__mobbin__*`): use for UI/section references before building
  a new section type. Cite the Mobbin URL in the PR/commit when a design is
  derived from a reference.
- **Chrome DevTools MCP** (`.mcp.json` → `chrome-devtools-mcp`): use to run
  Lighthouse audits, emulate devices, inspect the rendered DOM/`<head>`, check
  console errors, and profile CWV against `npm run dev` / `npm run start`.
- Do not add a new dependency without stating why an existing one can't do it.

## 12. Don'ts

- Don't hard-code business info, colors, or copy in components.
- Don't use `any`, `!`, `// @ts-ignore`, or `eslint-disable` without a comment
  explaining the specific reason.
- Don't add `"use client"` to a page or section wrapper.
- Don't use `<img>`, `<a>` for internal routes, raw `100vh`, `user-scalable=no`,
  `outline: none` without a replacement focus style, or `div`/`span` as buttons.
- Don't ship placeholder Lorem Ipsum — write real, location-aware copy.
- Don't hand-maintain sitemap URLs, type unions, or nav lists.
- Don't import `next/link` directly in features; use `InternalLink` / `Button`.
- Don't ship fabricated reviews, certifications, history or warranty claims —
  placeholders in `content/testimonials.ts`, `content/trust.ts` and the About
  story are marked `TODO(owner)` and must be replaced with real content.
- Don't add a second "location" unless the business actually opens one; cities
  served get a service-area page instead.
