# Task Spec — P2 mobile-overflow CI regression

**Status:** Implemented and locally verified; final hosted CI rerun pending.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `STANDARD` UI regression fix  
**Risk level:** Low  
**Related:** `DEFER-0013`, CI run `31902292412`

## Goal

Remove the 20px horizontal overflow that hosted Linux CI observed only on the
English locale root (`/en/`) at the `160x284` approximation viewport. Preserve
all routes, approved content, locale behavior, semantic navigation and
minimum touch targets.

## Scope

- In scope: diagnose the rendered overflow source, then make the smallest
  responsive CSS/markup correction required for `/en/` at `160x284`.
- Non-goals: new content, translation, visual redesign, route/SEO/data change,
  new dependency, client JavaScript, React, deployment, server access or a
  fake real-zoom claim.
- Allowed files: `apps/web/src/components/Header.astro`,
  `apps/web/src/components/Footer.astro`, `apps/web/src/components/Landing.astro`,
  `apps/web/qa/mobile-overflow.spec.mjs`, this Task Spec and
  `docs/status/WORK_LOG.md`.
- Forbidden files: every other file, including global tokens, package files,
  deployment/CI configuration and deferred/risk ledgers.

## Contracts

- `scrollWidth - innerWidth <= 1` remains required for every existing route and
  viewport in `mobile-overflow.spec.mjs`; do not narrow the matrix or weaken
  the assertion to make CI pass.
- `/en/` remains `dir="ltr"`, `/fa/` remains `dir="rtl"`; both locale links
  remain present, keyboard reachable and visually usable.
- Header action links retain at least the existing `2.75rem` minimum height;
  any compression must be responsive, logical-direction safe and avoid
  clipping interactive text without an accessible replacement.
- The `160x284` viewport remains an approximation only. Real 200% zoom remains
  tracked by `DEFER-0013` and is neither simulated nor claimed complete.

## Verification

- `npm run check` and `npm run build` in `apps/web`.
- Local preview plus `node qa/mobile-overflow.spec.mjs`; if the bundled browser
  is unavailable, use the existing real Chrome channel override without editing
  the repository and record that limitation precisely.
- Inspect the `160x284` English DOM to identify the actual overflow source,
  not just the final total.
- `git diff --check`; rerun hosted CI after push.

## Rollback

Revert only the regression-fix commit. The preceding published commit remains
the fallback; no deployment is part of this task.

## Handoff

- Files changed: only the allowed files above.
- Evidence: CI failure log, local exact-command result and hosted CI rerun.
- Deferred/risk IDs: `DEFER-0013` remains OPEN until its real-zoom/manual
  evidence is supplied.

## Completion evidence

- CI run `31902292412` failed only at `/en/@160x284` with `overflow=20px`;
  type check, build and local smoke had passed before that point.
- DOM min-content inspection found `.site-header-inner` already required
  `161.2px` under local Inter at a 160px viewport, so header navigation was
  made structurally safe. The first hosted rerun (`31903032574`) retained the
  same landing-page overflow, proving header was not the sole source.
- At `max-width: 12rem`, the brand name is omitted visually while its link is
  retained; the two navigation links move to their own equal-width grid row.
  No link is hidden, clipped or reduced below the existing `2.75rem` height.
- The English landing CTA also receives a zero minimum width, safe word wrapping
  and a full-width tiny-viewport layout with reduced inline padding. This removes
  its fallback-font min-content pressure without changing its label or target.
- Failure diagnostics from `31903254960` identified the remaining sources:
  `.section-heading` overflowed its 136px content box to 164px, and
  `.footer-brand-copy` rendered the English name/tagline beyond the footer.
  Both now have safe shrink/wrap rules; the diagnostic remains failure-only.
- Local verification: `npm run check` (0 errors/warnings/hints), `npm run
  build` (6 pages), and `PREVIEW_URL=http://127.0.0.1:4323
  PLAYWRIGHT_CHANNEL=chrome node qa/mobile-overflow.spec.mjs` (all checks
  passed, now including every `.site-header a` control); `git diff --check`
  passed. The bundled Playwright browser revision was unavailable locally, so
  the existing installed real Chrome channel was used without repository change.
