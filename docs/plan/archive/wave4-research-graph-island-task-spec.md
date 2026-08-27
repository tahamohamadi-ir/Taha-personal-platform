# Task: Wave 4 — Research relationship graph island (ADR-0028)

- Goal: Authorize and ship the first public interactive island — a Topic↔Project↔Publication relationship map on `/{locale}/research/` — under ADR-0028 (SVG + `motion`, 35KB gzip budget, no gsap/three).
- User/actor and journey: Public visitors exploring research connectivity; editors publish the same entities already used by list/detail pages. No new CMS fields.
- Release type: `STANDARD`
- Risk level: Medium (first public React hydration; license/budget gates)
- Owner and handoff recipient: Project owner (browser QA matrix / production rebuild)

## Scope

- In scope:
  - ADR-0028 + index registration
  - Build-time graph from published topic/project detail projections
  - Accessible HTML relationship tree (no-JS complete)
  - React island `client:visible` with pan/zoom, focusable nodes, keyboard, RTL, reduced-motion
  - B5 / LICENSES / deferred-validation / WORK_LOG updates
  - Dist QA spec for tree markup + absence of gsap/three imports
- Non-goals:
  - Pagefind, P8 models, Wave 2 statement PDF, ADM QA matrix
  - Curated collections
  - Raising the 35KB gzip budget; importing gsap or three
  - `CMS_CD_AUTO_MIGRATE`
- Allowed files: `apps/web/**`, `docs/adr/**`, `docs/plan/**`, `docs/status/**`, `docs/design.md` (pointer only if needed)
- Forbidden files: CMS migrations, infra deploy secrets, parallel wave worktrees

## Contracts and data

- Documents/ADRs/API schemas/models read: ADR-0016, B5 brief, LICENSES.md, design.md §95/§98/§102, P5 research DTOs
- Contracts changed: none (IA URLs unchanged)
- Migration/data impact: none
- Locale, visibility and publication impact: published-only edges only; empty/offline builds omit the graph section
- Security/privacy impact: no new endpoints; no draft leakage

## Verification and release

- Tests/commands to run:
  - `npm run check` and `npm run build` in `apps/web`
  - `node qa/research-graph.spec.mjs` after build
  - Bundle size note for the research-graph island chunk (gzip)
- Manual QA path: `/en/research/` and `/fa/research/` — keyboard, RTL, reduced-motion, no-JS tree complete
- Acceptance criteria:
  - ADR-0028 accepted with option B (motion + SVG)
  - Island is route-local + `client:visible`
  - Static tree present with real hrefs when edges exist
  - No `gsap` / `three` imports under `apps/web/src`
  - DEFER-0020 updated honestly
- Rollback/fallback: remove island import from research index; tree-only or catalog-only remains
- Documentation to update: WORK_LOG `LOG-0214`, deferred-validation, B5, LICENSES note, plan README

## Handoff

- Files changed (task-owned only): listed in LOG-0214
- Verification actually run: recorded in LOG-0214
- Deferred/risk IDs: `DEFER-0020` (collections remain open); gsap/three adoption still gated
- Explicit blockers and next input: owner browser evidence optional; production `rebuild-web.sh` after merge
