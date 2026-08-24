# Task Spec — P1 gateway UI/UX review and RTL correction

**Status:** Completed locally; staging re-deploy pending the owner sudo handoff.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `FAST-TRACK` UI correction  
**Risk level:** Low  
**Related:** `DEFER-0010`, `DEBT-0001`

## Goal

Review the first staging screenshot of the Language Gateway with the
`ui-ux-pro-max` guidance and project design baseline, then correct only the
verified bilingual hierarchy and accessibility issues without changing the
approved visual direction.

## In scope

- Separate English and Persian identity lines so bidi ordering cannot split the
  Persian name.
- Make the language prompt explicitly bilingual while keeping language choices
  obvious and visible.
- Preserve touch-sized actions, visible focus, static SVG enhancement and the
  Navy/Turquoise/Gold palette.
- Add reduced-motion handling for shared smooth scrolling/transitions.
- Verify Astro check/build and document remaining browser QA.

## Non-goals

- No new dependency, font, logo geometry, animation library or CMS/API.
- No change to the `docs/design.md` palette or static-first architecture.
- No production deploy or Cloudflare configuration change.

## Allowed files

- `apps/web/src/pages/index.astro`
- `apps/web/src/styles/global.css`
- `docs/plan/P1-gateway-ui-review-task-spec.md`
- `docs/status/WORK_LOG.md`
- `docs/status/deferred-validation.md` if the review changes a defer record

## Verification

- `npm run check`
- `npm run build`
- Static output inspection for separate `lang`/`dir` identity lines and
  gateway links.
- Browser/mobile screenshot remains pending under `DEFER-0010` until a browser
  matrix is run.

## Rollback

Frontend-only; revert the task-owned commit.
