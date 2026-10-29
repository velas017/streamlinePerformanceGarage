# Streamline Performance Garage — Website

Marketing and lead-generation site for Streamline Performance Garage, LLC, a Japanese
automotive specialist (Subaru, Nissan, Honda) in Concord, NC serving the Charlotte metro. Built with Next.js 16 (App Router),
TypeScript, Tailwind CSS v4, and Vitest.

Read `CLAUDE.md` before contributing: it defines the architecture, DRY rules,
WCAG 2.2 AA requirements, responsive rules, SEO strategy, and the definition of done.

## Getting started

```bash
cp .env.example .env.local   # then set NEXT_PUBLIC_SITE_URL (and RESEND_API_KEY for prod)
npm install
npm run dev                  # http://localhost:3000
```

## Scripts

| Script              | What it does                                           |
| ------------------- | ------------------------------------------------------ |
| `npm run dev`       | Dev server                                             |
| `npm run build`     | Production build (fully static, 39 routes)             |
| `npm run start`     | Serve the production build                             |
| `npm run lint`      | ESLint incl. jsx-a11y strict                           |
| `npm run typecheck` | `next typegen` + `tsc` (validates every internal href) |
| `npm run test`      | Vitest: unit, axe a11y, SEO content rules, sitemap     |
| `npm run format`    | Prettier                                               |
| `npm run check`     | lint → typecheck → test → build                        |

## Hosting and domain

Live at **https://streamlineperformancellc.com** since 2026-10-29, hosted on
Vercel (project `streamline-performance-garage`). `main` deploys to production
and every branch gets a preview that only people signed in to the Vercel team
can open. The domain is registered at
GoDaddy and keeps GoDaddy's nameservers; these records in GoDaddy DNS point it
at Vercel and Resend:

| Type  | Name                | Value                                 | For                         |
| ----- | ------------------- | ------------------------------------- | --------------------------- |
| A     | `@`                 | `216.198.79.1`                        | Website (Vercel)            |
| A     | `@`                 | `64.29.17.1`                          | Website (Vercel)            |
| CNAME | `www`               | `5ad990b708bc3dad.vercel-dns-017.com` | Website; 308s to the apex   |
| TXT   | `resend._domainkey` | DKIM key shown in Resend              | Booking-form email (Resend) |
| CNAME | `send`              | `send.forge.rmta.net`                 | Booking-form email (Resend) |
| CNAME | `rsend`             | `rsend.forge.rmta.net`                | Booking-form email (Resend) |

- Vercel issues the HTTPS certificate itself. If it stalls after a DNS change,
  run `vercel certs issue streamlineperformancellc.com www.streamlineperformancellc.com`.
- `NEXT_PUBLIC_SITE_URL` on Production is `https://streamlineperformancellc.com`
  and drives canonical URLs, Open Graph and the sitemap. It is inlined at build
  time, so changing it needs a redeploy.
- The domain has no mailbox. The shop's inbox is Gmail (`siteConfig.email`), and
  booking requests are sent from the domain through Resend (see "Booking form").
- Every environment variable is validated in `src/lib/env.ts` and listed in
  `.env.example`. `vercel env pull` overwrites `.env.local`, so merge values in
  by hand instead.

## Still open

Marked `TODO(owner)` in code:

- `src/lib/site-config.ts`: confirm address, phone, email and hours, set
  `foundingYear`, verify the map pin, and fill in `googleBusiness` once Google
  approves API access.
- `src/content/locations.ts`: confirm the directions wording.
- `src/app/about/page.tsx`: the real founding story and team.

Outside the code:

- Google reviews: the Google Cloud and API access steps under "Google reviews".
  Labelled samples show until then.
- Vercel plan: the project is on Hobby, whose terms do not allow commercial
  sites; moving to Pro is undecided.
- streamlineperformancegarage.com (registered elsewhere, not the shop's) still
  redirects to an unrelated site.
- Optional: verify the domain in Google Search Console and submit
  `/sitemap.xml`; add a DMARC record (TXT `_dmarc`, `v=DMARC1; p=none;`).

## Gallery

`/gallery` is a board-style photo wall (CSS multi-column, every photo at its own
aspect ratio) with a native-dialog viewer. To add photos:

1. Drop originals into `assets/source/gallery/` with descriptive filenames
   (`wrx-sti-engine-removal.jpg`); the filename becomes the photo id. The
   importer reads JPG, PNG and WebP only; convert iPhone HEIC files first
   (`sips -s format jpeg -s formatOptions 95 IMG.HEIC --out name.jpg`).
2. Run `npm run gallery:import`. It writes optimized, EXIF-stripped copies to
   `public/images/gallery/` and appends entries to `src/content/gallery.json`.
3. Fill in `alt` for the new entries (descriptive, names the car). Tests fail
   on blank ones. Tiles carry no visible caption; the alt is what screen
   readers, Google Images and the ImageGallery schema use.
4. Reorder entries in the JSON if needed; that order is the display order.

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

**The token refreshes itself.** Tokens die after 60 days unless refreshed, so a
Vercel Cron Job (`vercel.json`, Mondays 09:00 UTC) calls
`/api/cron/refresh-instagram-token`. The route only answers Vercel's
`Authorization: Bearer $CRON_SECRET` header. It refreshes the token with Meta and
stores it, its expiry and the run's outcome in Upstash Redis
(`instagram:token`, `instagram:token:last-run`; Upstash added from the Vercel
Marketplace sets `KV_REST_API_URL` and `KV_REST_API_TOKEN`). The feed reads that
copy first and falls back to `INSTAGRAM_ACCESS_TOKEN`, so the first run
bootstraps itself.

- If a run fails, `instagram:token:last-run` says why (Vercel's Hobby plan keeps
  runtime logs for only an hour). `npm run instagram:refresh` does the same
  refresh by hand and updates both Redis and `.env.local`.
- If the owner changes their Instagram password or removes the app, Meta kills
  the token: generate a new one (steps above), put it in Vercel's
  `INSTAGRAM_ACCESS_TOKEN` and run the script. Until then the feed shows the
  follow card; it never breaks the page.

## Google reviews

The home page shows the shop's newest 4- and 5-star Google reviews with text, in
an auto-advancing carousel with a Pause button. `src/lib/google-reviews.ts` reads
them from the shop's own Business Profile (API v4 `reviews.list`) with the
owner's OAuth refresh token, refreshed with the page's hourly ISR. The section
says which reviews it shows and gives Google's rating and count across all
reviews, as the FTC review rule (16 CFR 465.7(b)) requires when filtering.

Modes (`GOOGLE_REVIEWS_MODE`): `live` (default once configured), `mock`
(the labelled samples in `src/content/sample-reviews.ts`), `off`. Without a mode
and without the API the section renders nothing.

Production runs `mock` for now (client decision 2026-10-27, kept at launch on
2026-10-29) so the shop can see the carousel before Google is connected. The samples say they are not real
reviews and carry `data-nosnippet` so search results never quote them. On
production, live reviews replace them automatically once the API is configured;
remove the `GOOGLE_REVIEWS_MODE` variable from Vercel afterwards to tidy up.

To connect it (Google approves API access by hand, so start early):

1. The Business Profile must be verified for 60+ days and list the shop's own
   domain, `https://streamlineperformancellc.com`, as its website.
2. The **shop owner** creates a Google Cloud project, adds the developer as an
   Editor, and submits the
   [GBP API contact form](https://developers.google.com/my-business/content/prereqs)
   ("Application for Basic API Access") from the owner's email. A 300 QPM quota
   means approved.
3. Enable the Google My Business API, the Account Management API and the Business
   Information API. Create an OAuth client and set the consent screen to
   **In production** (Testing-mode refresh tokens expire after 7 days).
4. The owner signs in once with scope `https://www.googleapis.com/auth/business.manage`.
   Store `GOOGLE_BUSINESS_CLIENT_ID`, `GOOGLE_BUSINESS_CLIENT_SECRET` and
   `GOOGLE_BUSINESS_REFRESH_TOKEN` in Vercel (server-only).
5. Look up the numeric account and location IDs and the listing's
   `metadata.mapsUri` / `metadata.newReviewUri`, and fill in
   `siteConfig.googleBusiness`.

The refresh token keeps working as long as it is used at least every six months
and the owner does not remove the site's access.

## Booking form

The contact form emails each request to `siteConfig.email` through Resend
(Vercel Marketplace, which sets `RESEND_API_KEY`). `src/lib/leads.ts` sends plain
text from `siteConfig.leadSenderEmail` with Reply going to the customer, using
the same labels the form shows. The form asks which shop only when
`siteConfig.locations` has more than one. Anything but the live site prefixes the subject
with `[Test]`.

Resend only sends from a verified domain: `streamlineperformancellc.com` is
added in Resend (us-east-1) and its records live in GoDaddy DNS on the
`resend._domainkey`, `send` and `rsend` names, apart from the website's
records. Each send carries an idempotency key derived from the email, so a
resubmitted request arrives once. If the key is
missing or a send fails, the form tells the visitor to call instead; it never
drops a request silently. Locally, without a key, the lead is only logged.

## MCP servers

- **Mobbin** (global config) — design references.
- **Chrome DevTools** (`.mcp.json`) — Lighthouse, device emulation, DOM/head checks.
  Approve it when Claude Code prompts on the next session start.
