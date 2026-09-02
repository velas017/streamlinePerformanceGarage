# Site images

Filenames follow `<page or purpose>-<subject>-<place>.<ext>` so you can tell what a
file is and where it is used without opening the code:

| Folder            | Purpose                                                        |
| ----------------- | -------------------------------------------------------------- |
| `hero/`           | Home page hero photo                                           |
| `locations/`      | Locations page hero, the shop card, and the business schema    |
| `about/`          | About page story photo                                         |
| `og/`             | Background for the generated social-share (Open Graph) images  |
| `logo/`           | Brand mark: white for the dark UI, black master for schema     |
| `instagram-mock/` | Placeholder tiles for the Instagram carousel in mock mode only |

App icons live in `public/icons/`. The favicon and Apple icon are `src/app/icon.png`
and `src/app/apple-icon.png` (Next.js file conventions).

Every photo is registered in `src/content/images.ts` with its alt text, dimensions
and a note on where it appears. Originals stay in `assets/source/` (gitignored);
files here are the optimized, EXIF-stripped copies.
