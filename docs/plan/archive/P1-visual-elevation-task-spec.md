# Task Spec — P1 visual system elevation (constellation identity)

**Status:** Completed locally; staging re-deploy pending the owner sudo handoff.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` visual refinement  
**Risk level:** Low  
**Related:** ADR-0018, ADR-0019, `DEFER-0010`, `DEBT-0001`

## Goal

Elevate the P1 visual system to the project's "Editorial-Tech Premium" target
using the `ui-ux-pro-max` guidance, while keeping `docs/design.md` as the source
of truth: no new palette colors, no motion libraries, no client JavaScript and
no content inventions.

## Changes

- Replace the arbitrary gateway background with a meaningful static
  "identity constellation" (Design · Interaction · Engineering · Data · AI around
  a human-centered gold center) per design.md §64–§67, plus corner technical
  ticks; fully static, aria-hidden, no-JS safe.
- Landing hero becomes a two-column editorial layout (copy ~58% / constellation
  visual ~42%) with a simplified mobile order, per design.md §65.
- Perspective cards gain per-path context accents within the approved palette
  (research = purple, engineering = turquoise, writing = emerald) and numbered
  bilingual section labels (01/02) as an editorial signature.
- Sticky solid-first header with selective glass enhancement and 44px touch
  targets for the language switch; refined footer with brand mark.
- 404 redesigned to the Navy gateway language (constellation, bilingual title,
  gateway/locale actions) with `noindex` preserved.
- Focus-visible rings tuned per surface (white on navy, navy on brand buttons).

## Non-goals

- No new dependency, font, logo geometry, palette color, animation library,
  React island, analytics or CMS/API.
- No copy changes beyond the two bilingual section labels.

## Allowed files

- `apps/web/src/components/{Landing,Header,Footer}.astro`
- `apps/web/src/pages/{index,404}.astro`
- `apps/web/src/data/content.ts`
- `docs/plan/P1-visual-elevation-task-spec.md`, `docs/status/WORK_LOG.md`

## Verification

- `npm run check` (0 errors), `npm run build`, preview HTTP smoke (routes 200,
  `/nonexistent` 404, CSS 200) and static output assertions for constellation,
  labels, accents and the 404 redesign.
- Browser/mobile visual matrix remains tracked by `DEFER-0010`.

## Rollback

Revert the task-owned commits; no runtime/server state is affected.
