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
them from the shop's own Business Profile (API v4 `reviews.list`) with the OAuth
refresh token of an account that owns or manages it, refreshed with the home
page's hourly ISR (`export const revalidate` in the page). The section
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

**Where this stands (2026-11-10):** the application for API access is under
review. Google quoted 7 to 10 business days, so expect an answer between about
2026-11-19 and 2026-11-24. Steps 1 to 3 below are done; steps 4 to 7 are open
(4 and 5 do not need the approval). Nothing is in `.env.local` or on Vercel yet.

- The shop added the developer's Google account as a **manager** of the Business
  Profile. That account owns the Cloud project, submitted the form and will do
  the sign-in in step 5. A manager is enough; it does not have to be the owner.
- A first application on 2026-11-10 was rejected within minutes ("doesn't meet
  our criteria") because of two form answers: the website was mistyped and
  "already have an allow-listed project" was answered Yes. The answers in step 2
  are the ones that got it into review.
- If this one is rejected too, the likely reason is the applicant's email:
  Google's [FAQ](https://developers.google.com/my-business/content/faq) asks
  for "a valid business email address that is tied to your business domain".
  The domain has no mailbox yet (no MX records), so that means adding email
  forwarding at GoDaddy, making a Google account with that address, having the
  shop add it as a manager, and applying from it. The other route is the
  Places API with a plain API key, which needs no approval but returns at most
  five reviews in Google's order, needs a billing account, and has terms
  against storing reviews that do not fit a static page.

To connect it (Google approves API access by hand, so start early):

1. The Business Profile must be verified for 60+ days and list the shop's own
   domain, `https://streamlineperformancellc.com`, as its website. Google shows
   no "verified since" date: check that the profile's status reads Verified and
   find an owner reply to a review that is more than 60 days old (confirmed
   2026-11-10). Fill in whatever the profile's "Complete info" prompt asks for,
   but leave the name, address and primary category alone: changing those can
   trigger a new verification.
2. Signed in as a Google account that owns or manages the profile, create a
   Google Cloud project (no organization and no billing account needed) and copy
   its **Project Number** from the dashboard. Submit the
   [GBP API contact form](https://support.google.com/business/contact/api_default)
   from that account with these answers:
   - Request: "Application for Basic API Access"
   - Website: `https://streamlineperformancellc.com`, exactly as on the profile
   - Verified for 60 days: Yes
   - Already have an allow-listed Cloud project: **No** (allow-listing is what
     the form asks for)
   - If it shows a list of profiles, pick the verified shop listing
3. Wait for Google's email to the applicant. Approval also shows in the Cloud
   project: the Business Profile API quota goes from 0 to 300 requests per
   minute (IAM & Admin → Quotas & System Limits).
4. In the same project, open Google Auth Platform, set the audience to External
   and click **Publish app** so the status is "In production" (Testing-mode
   refresh tokens expire after 7 days). Create a client of type **Desktop app**
   and put its ID and secret in `.env.local` as `GOOGLE_BUSINESS_CLIENT_ID` and
   `GOOGLE_BUSINESS_CLIENT_SECRET`. Copy the secret when the client is created.
5. Run `npm run google:auth` and sign in with the account from step 2 (scope
   `business.manage`; Google warns the app is unverified, which is expected for
   a private app). The script saves `GOOGLE_BUSINESS_REFRESH_TOKEN` to
   `.env.local`.
6. After approval, enable the Google My Business API, the My Business Account
   Management API and the My Business Business Information API, then run
   `npm run google:auth -- --locations`. It prints the account and location IDs
   and the listing's Maps and write-a-review links.
7. Put those four values in `siteConfig.googleBusiness`, copy the three
   `GOOGLE_BUSINESS_*` values into Vercel (Production, server-only), deploy, and
   check that the carousel shows real reviews and still says which reviews it
   shows. Then remove `GOOGLE_REVIEWS_MODE` from Production.

The refresh token belongs to the account that signed in. It keeps working as
long as it is used at least every six months and that account keeps its access
to the Business Profile; if the shop removes the manager, the section falls back
to a link to the reviews on Google until someone signs in again.

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
