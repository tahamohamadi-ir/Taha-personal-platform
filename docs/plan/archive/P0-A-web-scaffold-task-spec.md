# Task Spec — P0A-03..06 / P1-01..09 static P1 frontend scaffold and bilingual landing

**Status:** Completed as a local static build; deployment remains out of scope.  
**Date:** 2026-08-14  
**Owner:** Project owner (agent-assisted)  
**Release type:** `STANDARD` (new public routes, no auth/data/secret)  
**Risk level:** Low  
**Risk IDs:** `RISK-0004` to `RISK-0007` (deployment-phase, unchanged)

## Goal

Scaffold `apps/web/` as a static-first Astro + TypeScript + Tailwind v4 site and
build the P1 release: a `/` Language Gateway, `/fa/` (RTL) and `/en/` (LTR)
landing pages, locale-aware 404, static health/robots/sitemap skeleton, design
tokens from `docs/design.md`, and a GitHub Actions CI workflow. Main content is
readable without JavaScript; no React or heavy dependency is installed.

## In scope

- `apps/web/` scaffold: `package.json` + lockfile (npm), `astro.config.mjs`,
  `tsconfig.json`, `src/` structure, `src/styles/global.css` (Tailwind v4 +
  design tokens), `src/data/` typed locale content, layouts and components.
- Pages: gateway `/`, `/en/`, `/fa/`, `404`, `health.json`, `robots.txt`,
  `sitemap.xml`.
- `.github/workflows/ci.yml` (npm ci → `astro check` → `astro build` → artifact).
- Content uses only the approved/proposed copy in `docs/plan/P0-G0-content-pack-proposal.md`;
  no metric, link, social URL, email, CV or evidence is invented. Contact renders
  an honest "not published" state; selected evidence is omitted.

## Non-goals

- No React, shadcn/Radix, Motion, GSAP, D3, Three, Pagefind, analytics or dark mode.
- No self-hosted font files (system stack until owner approves a family).
- No OG image asset.
- No VPS, Caddy, DNS, staging/production deploy, or server change.

## Allowed files

- `apps/web/**` (source, config, lockfile)
- `.github/workflows/ci.yml`
- `docs/plan/P0-A-web-scaffold-task-spec.md` (this file)
- `docs/status/WORK_LOG.md`

## Verification

- `npm install`, `npm run check` (0 errors), `npm run build` (all routes emitted)
  were actually run in `apps/web/`; results recorded in WORK_LOG.
- Generated `dist/` contains `/`, `/en/`, `/fa/`, `/404.html`, `/health.json`,
  `/robots.txt`, `/sitemap.xml`; `fa` output is `lang="fa" dir="rtl"` with
  correct hreflang/canonical.

## Rollback

- Frontend-only; `apps/web/` is new. Removing the directory and the CI workflow
  reverts the change. No runtime/server state is affected.
