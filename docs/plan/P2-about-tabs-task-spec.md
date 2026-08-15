# Task Spec — P2 About tabs and justified bilingual reading layout

**Status:** In progress.  
**Date:** 2026-08-15  
**Owner:** Project owner (agent-assisted)  
**Release type:** `STANDARD` UI/content presentation change  
**Risk level:** Low  
**Related:** `DEFER-0013`, `DEBT-0001`

## Goal

Give English and Persian About pages the same tab structure and visual style,
with only locale data and labels changing. Keep all content static, typed and
ready for a future admin-panel adapter.

## In scope

- CSS-only radio tabs; no React, no client JavaScript, no hydration.
- Same tab order for both locales: Experience, Education, Skills, Research,
  Publications, Certificates.
- Data-driven labels and content from `content.ts`/`profile.*.ts`.
- Long About text and evidence descriptions use `text-align: justify` and
  `text-justify: inter-word`.
- Mobile tab strip scrolls horizontally; content does not overflow.

## Non-goals

- No new content, translation or metric beyond the owner-provided CV/SOP data.
- No empty tab is rendered when a locale has no approved data.
- No shadcn/Radix/React dependency or motion effect.

## Verification

- `npm run check`, `npm run build`.
- Static HTML contains all six tab controls/panels for both locales.
- Playwright CI checks 320×568 and 390×844 overflow.
- Keyboard focus remains visible on radio/label controls.

## Rollback

Revert the task-owned About component/data commit; previous About pages remain
available in the prior artifact.
