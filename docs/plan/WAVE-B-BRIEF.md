# Wave B dispatch brief — multi-agent batch 2

> Orchestrator note for the next parallel wave of `docs/plan/PARALLEL_EXECUTION_PLAN.md`.
> All four tasks touch DISJOINT files; each agent owns its branch, PR, and verification.

## Shared rules (paste into every prompt)

1. Repo `C:\Users\Taha\github-work\tpl`, start from current `main` (clean tree).
2. Branch name = the task ID (`task/<ID>`). Commit conventional messages. Push, open PR to main with gh. DO NOT merge — orchestrator merges after CI green.
3. Verify locally BEFORE push: `cd apps/web && npm run check` (0 errors) + `npm run build` (Complete) + any spec named in the task.
4. Do not touch files outside your domain. `global.css` is hot — only B-04 may append to it.
5. Report: SHA, PR URL, verbatim verify outputs.

## Tasks in this wave

### B-02 — ui/ shell components (agent web-2)
Domain: NEW `apps/web/src/components/ui/SiteHeader.astro`, `SiteFooter.astro`, `EmptyState.astro` + may APPEND component classes to `global.css`.
Build night-theme versions per reDesign_plan §۵: header sticky, glass strong fill, 64px, nav order About·Research·Projects·Writing·More▾(details no-JS: Publications/Books/Talks/Downloads)·CV·Contact·Search·lang btn (.btn--ghost .btn--sm); active parent-section highlighting; aria-current="page". Footer: canvas-deep bg, three areas, min-height 44px links. EmptyState: sunken card + kicker + one sentence + .btn--quiet action.
These are NEW components only — do NOT rewire pages yet (that's later waves). Verify: check+build green; grep dist for new classes present.

### B-03 — cover + 404 night system (agent web-3)
Domain: `apps/web/src/pages/index.astro`, `apps/web/src/pages/404.astro` (+ their scoped styles).
Restyle Language Gateway and 404 onto shared tokens: keep --canvas-night bg, replace bespoke gateway buttons with .btn--primary/.btn--ghost patterns inline (primitives come in B-01), gold signature line under the bilingual name, remove duplicated constellation field SVG decoration (aurora from A-01 already gives depth). Keep theme-color #071225 on both. Preserve all copy/i18n/canonical/hreflang exactly.
Verify: check+build green + `node qa/mobile-overflow.spec.mjs` → 212 PASS / 0 FAIL.

### B-04 — CatalogPage + DetailShell patterns (agent web-4)
Domain: NEW `apps/web/src/components/patterns/CatalogPage.astro`, `DetailShell.astro` + MAY append shared classes to `global.css`.
Design the single catalog template (props: locale, items, labels, emptyText; renders kicker+h2 head, card--row list, honest EmptyState) and detail shell (breadcrumb slot + h1 + meta-row + prose slot + related slot). No page migration yet. Add `.card`, `.card--row`, `.list-row`, `.meta-row`, `.prose` classes to global.css consuming §0 tokens only.
Verify: check+build green; create a throwaway test route? NO — verify via a vitest-less smoke: temporarily render in /en/research? NO — just ensure astro check passes with both imported by nothing (Astro allows unused comps).

### X-04 — Admin SPA UX audit first slice (agent spa-1)
Domain: `apps/cms/admin-frontend/src/**` ONLY.
Run a structured audit of the React admin SPA (forms, loading/error/empty states, RTL, keyboard): produce findings list ranked P1/P2 into `admin-frontend/UX_AUDIT.md` (new file), then fix the top 3 quick wins (e.g. missing aria-labels, unstyled error states, focus traps). No dependency additions (H-gate applies separately).
Verify: cd apps/cms/admin-frontend && npm run build (or existing script) green; document before/after in PR body.

## Merge order after CI
B-04 → B-02 → B-03 → X-04 (B-02 and B-03 both append near global.css tail; merge sequentially, orchestrator resolves).
