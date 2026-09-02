# Source images from the business

Drop the original files the shop provides here. This folder is the **raw** archive;
nothing in it is served by the site. When we choose an image, it gets renamed
descriptively, resized and converted (WebP/AVIF), and saved under `public/images/`,
which is what the pages reference.

## Where to put things

| Folder  | What goes in it                                              |
| ------- | ------------------------------------------------------------ |
| `logo/` | Logo files, brand marks, any vector (SVG/AI/EPS) or PNG      |
| `hero/` | Wide, high-resolution shots suited to the home page header   |
| `shop/` | Building exterior, signage, lobby, bays, equipment           |
| `work/` | Cars on lifts, builds, dyno pulls, alignments, before/after  |
| `team/` | Owner and technicians (only people who have agreed to appear) |
| `misc/` | Anything that does not fit above                             |

Keep original filenames; we rename during optimization. Note which car and
service each photo shows if the filename does not say (a `notes.txt` in the
folder is fine).

## Workflow

1. Add files here and say which ones to use and where.
2. Claude optimizes them into `public/images/<area>/` with SEO-friendly names
   such as `subaru-wrx-sti-alignment-concord-nc.webp` and writes descriptive alt text.
3. Content and config are updated to reference the new files.

This folder is gitignored (originals can be large and the repo is public). Only the
optimized copies in `public/images/` are committed.
