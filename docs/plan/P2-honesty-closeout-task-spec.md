# Task Specification — P2 honesty closeout

**Status:** DONE — completed on `main` (2026-08-17, LOG-0145). P4–P6 public routes were already live; this slice did **not** remove Research/Projects/Writing header links.

## Task: P2-H — Hero, About evidence, locale 404, footer explore, landing honesty

- Goal: remove stale “later release” landing copy, point hero/perspective cards at live destinations, stack About evidence for find-in-page, add locale-aware 404 recovery, and expand footer explore links — without regressing Gateway, dual CV, JSON-LD, or live P4–P6 routes on `main`.
- Release type: `FAST-TRACK`
- Risk level: Low (static Astro only)

## Main-aware nav note (2026-08-17)

When this spec was authored, `/research/`, `/projects/`, and `/blog/` did not exist (`KI-0002`). **`main` now ships those routes** (P4–P6 + LOG-0143). Header links to them are **correct** and were kept. Verification item “0 matches for `/research/` in Header” applies only to pre-P4 checkouts.

## Scope delivered

- Hero primary/secondary CTAs → `/{locale}/about/` and `/{locale}/cv/` (not `#perspectives`).
- Perspective cards link to live Research / Projects / Writing index routes.
- Landing: Current Focus strip (`profile.availability`) + Selected Evidence from typed profile data.
- About: stacked sections + fragment TOC (`#experience`, `#education`, …); no `display:none` hiding evidence (`DEBT-0002` CLOSED).
- 404: infer locale from path prefix; recovery links to locale home, About, CV (Gateway stays bilingual when no prefix).
- Footer: explore links to live locale destinations; contact stays unpublished.
- Header: `aria-current`, language switch `aria-label`, visually hidden current language.
- QA: `qa/about-tabs.spec.mjs` updated for stacked evidence (not exclusive tabs).

## Verification (LOG-0145)

| # | Command | Result |
|---|---|---|
| 1 | `rg "DebugProbe" apps/web/src` | 0 matches |
| 2 | `npm run check` (`apps/web/`) | 0 errors (62 files) |
| 3 | `npm run build` (`apps/web/`) | 16 pages (no `CMS_API_BASE` in local build) |
| 4 | `node qa/about-tabs.spec.mjs` + `node qa/mobile-overflow.spec.mjs` with `PREVIEW_URL=http://127.0.0.1:8765` | All PASS |

Commit: `fix(web): honest landing, stacked About evidence, locale 404 (P2-H)`
