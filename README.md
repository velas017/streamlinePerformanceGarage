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
| `npm run build`     | Production build (public pages static, admin dynamic)  |
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
- `src/app/(site)/about/page.tsx`: the real founding story and team.

Outside the code:

- Admin area: the four go-live steps under "Admin area" (subdomain in Vercel
  and GoDaddy, `ADMIN_EMAILS`, `ADMIN_SECRET`). Until then it answers nowhere.
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

## Admin area

A private area for the shop, at **https://admin.streamlineperformancellc.com**
(`admin.` + the site's host; `http://admin.localhost:3000` in development). It
has its own header and no link from the public site. Phase 1 is sign-in and the
account page; photo uploads and key management come next.

How it is kept private:

- `src/proxy.ts` serves the `/admin` pages on the admin hostname only. On the
  public domain, and on every Vercel preview address, `/admin` is the normal 404. The admin host shows nothing else, is marked noindex and is never cached.
- Who may sign in is the `ADMIN_EMAILS` variable and nothing else. There is no
  sign-up page.
- Sign-in is a password, then a 6-digit code emailed through Resend (10
  minutes, single use, 5 tries). Five wrong passwords pause sign-in for 15
  minutes for that visitor. A session lasts 30 days on a device.
- Backup codes (8, single use, created on the account page) finish a sign-in
  when the email does not arrive.
- "First time here, or forgot your password?" emails a one-hour, single-use
  link to choose a password. Choosing one signs every device out.
- Passwords are stored as scrypt hashes. Sessions, codes and links are stored
  in Upstash Redis (`admin:*`) as hashes keyed with `ADMIN_SECRET`, never
  as-is. The session cookie is HttpOnly, Secure, SameSite=Lax and pinned to the
  admin hostname (`__Host-`), so the public site never receives it.
- Every page and every server action checks the hostname and the session
  itself (`lib/admin/request.ts`, `lib/admin/session.ts`); the rules live in
  `lib/admin/auth.ts` and are tested end to end against an in-memory Redis
  (`src/test/fake-kv.ts`).
- The account page lists recent sign-ins and password changes.

The shop's inbox is the root of trust: whoever can read an admin's email can
choose a new password and receive the codes. Keep Google's own 2-Step
Verification on for that Gmail account.

To put it live (once):

1. Vercel → the project → Settings → Domains → add
   `admin.streamlineperformancellc.com` (Production).
2. GoDaddy DNS: add a `CNAME` record named `admin` with the value Vercel shows
   for that domain. Vercel issues the certificate itself.
3. Vercel → Settings → Environment Variables (Production):
   `ADMIN_EMAILS` (comma-separated, for example the shop's Gmail address) and
   `ADMIN_SECRET` (`openssl rand -base64 48`). `KV_REST_API_*` and
   `RESEND_API_KEY` are already there and are required too. Redeploy.
4. Each admin opens the admin address, follows "First time here, or forgot
   your password?", chooses a password from the emailed link, signs in, and
   creates backup codes on the account page.

Day to day:

- Add or remove a person: edit `ADMIN_EMAILS` and redeploy. A removed email is
  locked out at once, signed-in devices included.
- Changing `ADMIN_SECRET` signs everyone out and cancels their backup codes;
  passwords keep working.
- Locally, put `ADMIN_EMAILS`, `ADMIN_SECRET` and the `KV_REST_API_*` pair in
  `.env.local` and open `http://admin.localhost:3000`. Without
  `RESEND_API_KEY` the emails are printed in the terminal instead.

## MCP servers

- **Mobbin** (global config) — design references.
- **Chrome DevTools** (`.mcp.json`) — Lighthouse, device emulation, DOM/head checks.
  Approve it when Claude Code prompts on the next session start.
