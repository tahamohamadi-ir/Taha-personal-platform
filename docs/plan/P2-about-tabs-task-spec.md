# Task Spec — P2 About tabs and justified bilingual reading layout

**Status:** Complete for the implemented, locally verified, and hosted-CI-verified scope (CI run `31903433836`); real 200% browser-zoom/manual visual evidence remains open in `DEFER-0013`.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `STANDARD` UI/content presentation change  
**Risk level:** Low  
**Related:** `DEFER-0013`, `DEBT-0001`

## Goal

Give English and Persian About pages the same tab structure and visual style,
with only locale data and labels changing. Keep all content static, typed and
ready for a future admin-panel adapter. The long intro paragraphs keep a
readable measure and are horizontally centered on the page in both RTL and LTR.

## Contract (amended 2026-08-15)

- Intro blocks (`.about-bio`, `.about-bio-long`) preserve their `60ch`/`68ch`
  readable max-width and MUST be horizontally centered within `.about` via
  logical auto inline margins (`margin-inline: auto`) in both `fa` (RTL) and
  `en` (LTR).
- Tab/entry cards remain full-width; cards MUST be wider than the intro blocks
  at desktop widths.
- The regression matrix covers BOTH locales at 320, 390, 768, 1024, 1280 and
  1440 px.
- 200% browser zoom is required as manual/deferred visual evidence
  (`DEFER-0013`); real zoom is NOT faked in CI with synthetic viewports.

## In scope

- CSS-only radio tabs; no React, no client JavaScript, no hydration.
- Same tab order for both locales: Experience, Education, Skills, Research,
  Publications, Certificates.
- Data-driven labels and content from `content.ts`/`profile.*.ts`.
- Long About text and evidence descriptions use `text-align: justify` and
  `text-justify: inter-word`.
- Mobile tab strip scrolls horizontally; content does not overflow.
- Centered intro blocks per the contract above; cards stay full-width.

## Non-goals

- No new content, translation or metric beyond the owner-provided CV/SOP data.
- No empty tab is rendered when a locale has no approved data.
- No shadcn/Radix/React dependency or motion effect.
- No fake 200% zoom simulation in CI; real zoom evidence stays in `DEFER-0013`.

## Verification

- `npm run check`, `npm run build`.
- Static HTML contains all six tab controls/panels for both locales.
- Playwright regression (`apps/web/qa/about-tabs.spec.mjs`) at 320, 390, 768,
  1024, 1280 and 1440 px for `/fa/about/` and `/en/about/`: no horizontal
  overflow (>1px fails); each intro block horizontally centered within `.about`
  within 2px tolerance; entry cards wider than the intro at desktop widths
  (1024/1280/1440); tab geometry, one visible panel, direction-aware keyboard,
  click activation and locale-switch links remain intact.
- 200% browser zoom: manual/deferred visual evidence tracked in `DEFER-0013`
  (real zoom cannot be faithfully simulated by a synthetic viewport).
- Hosted CI evidence: run `31903433836` (commit `d69b0e9`) — About tabs
  regression (Playwright) PASS at all six widths for both locales; run
  `31904100378` (docs commit `e1fcac0`) also PASS.

## Rollback

Revert the task-owned About component/data commit; previous About pages remain
available in the prior artifact.
