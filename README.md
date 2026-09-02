# Streamline Performance Garage — Website

Marketing and lead-generation site for Streamline Performance Garage, LLC, a Japanese
automotive specialist (Subaru, Nissan, Honda) in Concord, NC serving the Charlotte metro. Built with Next.js 16 (App Router),
TypeScript, Tailwind CSS v4, and Vitest.

Read `CLAUDE.md` before contributing: it defines the architecture, DRY rules,
WCAG 2.2 AA requirements, responsive rules, SEO strategy, and the definition of done.

## Getting started

```bash
cp .env.example .env.local   # then set NEXT_PUBLIC_SITE_URL (and LEAD_WEBHOOK_URL for prod)
npm install
npm run dev                  # http://localhost:3000
```

## Scripts

| Script              | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Dev server                                             |
| `npm run build`     | Production build (fully static, 41 routes)             |
| `npm run start`     | Serve the production build                             |
| `npm run lint`      | ESLint incl. jsx-a11y strict                           |
| `npm run typecheck` | `next typegen` + `tsc` (validates every internal href) |
| `npm run test`      | Vitest: unit, axe a11y, SEO content rules, sitemap     |
| `npm run format`    | Prettier                                               |
| `npm run check`     | lint → typecheck → test → build                        |

## Before launch — replace placeholders

Everything below is marked `TODO(owner)` in code.

- `src/lib/site-config.ts`: address, phone, email and hours are from the public
  listing — confirm them, set `foundingYear`, and verify the map pin.
- `src/content/locations.ts`: confirm the directions wording.
- `src/app/about/page.tsx`: supply the real founding story and team.
- `src/content/testimonials.ts`: real, permissioned reviews (never fabricated).
- `src/content/trust.ts`: confirm certification and warranty claims.
- `public/images/**`: replace SVG placeholders with real photography (JPG/WebP,
  descriptive filenames such as `nissan-gtr-r35-dyno-tuning-concord.jpg`).
- `public/icons`: add 192px / 512px PNG icons and list them in `src/app/manifest.ts`.
- `.env.local`: `NEXT_PUBLIC_SITE_URL` (canonical domain), `LEAD_WEBHOOK_URL`
  (where contact-form leads are POSTed), optional `NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY`.

## Instagram feed

The home page carousel mirrors the "Instafeed" slider on iagperformance.com but is
built in: `src/lib/instagram.ts` fetches recent posts from the Instagram API
server-side, caches them for an hour (ISR), validates the response, and renders
`InstagramFeed`. Without a token it shows a follow card instead of fake posts.

Modes (`INSTAGRAM_FEED_MODE`): `live` (default when a token is set), `mock`
(local placeholder tiles, on in `.env.local` for design review), `off`.

To connect the real account (@streamline_performance_garage):

1. Make sure the Instagram account is a **Business or Creator** account.
2. In [Meta for Developers](https://developers.facebook.com/) create an app and add
   the **Instagram API with Instagram Login** product.
3. Add the account as an Instagram tester / log in, and generate a **long-lived
   access token** (valid 60 days).
4. Put it in `INSTAGRAM_ACCESS_TOKEN` (server-only) and deploy.
5. Refresh the token before it expires (it must be at least 24 hours old):
   `npm run instagram:refresh` rewrites `.env.local` and prints the new expiry.
   Paste the new value into Vercel's environment variables too. Set a calendar
   reminder every ~50 days; if a refresh is missed the feed falls back to the
   follow card and never breaks the page.

Alternative with zero token management: a hosted feed service such as Behold.so
exposes a JSON URL; swap `fetchLivePosts` for that endpoint.

## MCP servers

- **Mobbin** (global config) — design references.
- **Chrome DevTools** (`.mcp.json`) — Lighthouse, device emulation, DOM/head checks.
  Approve it when Claude Code prompts on the next session start.
