# Task Spec — P2 zoom-safety for gateway, landing and 404

**Status:** Complete — implemented, locally verified, and hosted CI green (run `31903433836`, commit `d69b0e9`; later docs commit `e1fcac0` run `31904100378` also green).  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `STANDARD` presentation/robustness change  
**Risk level:** Low  
**Related:** `DEFER-0013` (existing, unchanged), `LOG-0097` (this slice), `LOG-0096` reserved

## Goal

Keep the Language Gateway (`/`) and the custom 404 page usable at very small CSS
viewports — `160x284` and `195x422`, which are CSS-viewport *approximations* of
200% browser zoom on `320x568` and `390x844` (halved CSS pixels). Requirements:

- horizontal is safe (no horizontal overflow, no horizontal scrollbar);
- vertical content is scrollable and every control is reachable;
- action control minimum widths fit the available width;
- `min-height: 100vh` declared first as fallback, then `min-height: 100svh`;
- 404 padding and type respond to tiny viewports.

Real 200% zoom testing remains deferred and is **not** part of this task; the
deferred ledger is **not** edited.

## In scope

- `index.astro` gateway: `100vh` fallback before `100svh`; remove the
  `overflow: hidden` clipping that made the centered panel unreachable; keep
  horizontal safe via `overflow-x: clip`; constrain the fixed decorative SVG;
  make the grid track and flex children shrinkable; action `min-width` never
  exceeds the smallest allowed content width.
- `404.astro`: same `100vh`→`100svh` fallback pattern; remove clipping;
  responsive panel padding and type scale for `160`/`195` widths.
- `Landing.astro`: perspectives grid track minimum becomes
  `minmax(min(16rem, 100%), 1fr)` and long bilingual/English text can wrap so
  neither grid tracks nor min-content words exceed the container.
- `qa/mobile-overflow.spec.mjs`: QA matrix `160/195` (explicitly labelled
  approximation, never claimed as real zoom) plus `320/390/768/1024/1280/1440`;
  assert no horizontal overflow, locale `dir`, and gateway/404 controls
  horizontally inside the viewport and vertically reachable after
  `scrollIntoView`.
- `docs/status/WORK_LOG.md`: append `LOG-0097` (`LOG-0096` reserved).

## Non-goals

- No real-browser 200% zoom testing; remains deferred (`DEFER-0013`);
  `deferred-validation.md` is not edited.
- No new dependencies, no client JavaScript, no React, no motion/GSAP/Three.
- No content, translation, SEO, route or data-model changes.
- No commit, push, deploy, staging, SSH or server actions.

## Allowed files

- `docs/plan/P2-zoom-safety-task-spec.md`
- `apps/web/src/pages/index.astro`
- `apps/web/src/pages/404.astro`
- `apps/web/src/components/Landing.astro`
- `apps/web/qa/mobile-overflow.spec.mjs`
- `docs/status/WORK_LOG.md`

## Forbidden files

Everything else — including `docs/status/deferred-validation.md`,
`docs/status/RISK_REGISTER.md`, `.github/workflows/ci.yml`, `package.json` and
`package-lock.json` (dependency restore with `npm ci` is allowed; it changes no
manifest).

## Contracts and data

- Documents read: `AGENTS.md`, `docs/templates/TASK_SPEC_TEMPLATE.md`,
  `docs/plan/P2-about-tabs-task-spec.md`, `docs/status/WORK_LOG.md`,
  `.github/workflows/ci.yml`, `apps/web/package.json`.
- Contracts changed: none (static CSS/markup only).
- Migration/data impact: none.
- Locale, visibility and publication impact: none (no content or SEO change).
- Security/privacy impact: none.

## Verification

- `npm ci` in `apps/web` (owner-approved; restores lockfile deps only).
- `npm run check` — 0 errors / 0 warnings / 0 hints.
- `npm run build` — 6 pages.
- Playwright on local preview (`:4321`):
  - `PREVIEW_URL=http://127.0.0.1:4322 PLAYWRIGHT_CHANNEL=chrome node qa/mobile-overflow.spec.mjs`
    — 128 PASS / 0 FAIL across the route-specific matrix;
  - About routes are covered at all six standard widths here; after rebase onto
    `LOG-0096`, the dedicated About-tabs regression also passed 78/78.
- `git diff --check` PASS; `git status` shows only the allowed files modified.

## QA matrix and naming

- Approximations (labelled as approximations of 200% zoom, never claimed as
  real zoom): `160x284` (= `320x568` at 200%), `195x422` (= `390x844` at 200%).
- Baseline: `320x568`, `390x844`, `768x1024`, `1024x768`, `1280x800`,
  `1440x900`.
- Routes: `/`, `/en/`, `/fa/` and `/404.html` at approximation + standard
  widths; `/en/about/` and `/fa/about/` at standard widths only because their
  real-zoom evidence remains owned by `DEFER-0013`.

## Acceptance criteria

1. `scrollWidth - innerWidth <= 1` at every width × route pair.
2. `html[dir]` matches the route locale (`rtl` for `/fa*`, `ltr` otherwise) at
   every pair.
3. Gateway actions (`.gateway-actions a`) and 404 actions
   (`.notfound-actions a`): after `scrollIntoView({ block: 'center' })`, each
   control's box is horizontally inside the viewport and vertically fully
   visible.
4. Gateway and 404 declare `min-height: 100vh` before `min-height: 100svh`.
5. Perspectives grid uses `minmax(min(16rem, 100%), 1fr)`.
6. Real 200% zoom is never claimed anywhere; deferred ledger untouched.

## Rollback

Revert the task-owned commits; the previous artifact remains on the server
untouched (no deployment happens in this task).

## Handoff

- Files changed (task-owned only): the six allowed files.
- Verification actually run (command + result): recorded in `LOG-0097`.
- Deferred/risk IDs: existing `DEFER-0013` unchanged; no new IDs.
- Explicit blockers and next input: hosted-CI evidence obtained (run
  `31903433836` PASS, run `31904100378` PASS); real 200% browser zoom remains
  separate and open in `DEFER-0013`.
