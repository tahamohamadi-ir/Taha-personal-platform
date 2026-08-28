# FINAL-QA-REPORT.md -- Track WF-10 (Independent QA hardening, gate G9)

- **Date:** 2026-08-27
- **Auditor:** WF-10 QA packet (independent run-and-report; no product code touched)
- **Base commit:** `f2a7b6e` (main). Worktree state at run time: uncommitted WF-09 gateway hero-art change in `apps/web/src/pages/index.astro` (verified pre-existing at session start) + concurrent `apps/admin/*` edits appearing mid-session from a parallel worker (out of WF-10 scope). All results below reflect this worktree state, not a clean checkout.
- **Environment:** Windows 11 / PowerShell 5.1 - Node v24.16.0 - npm 11.18.0 - Playwright 1.62.1 (chromium-1234) - Astro 7.2.4 - Pagefind 1.5.2
- **Run order:** CI-faithful -- typecheck -- kit validator (G0) -- default snapshot build -- dist scans -- self-managing build specs (sequential, dist restored between) -- `astro preview` @ 127.0.0.1:4321 -- Playwright specs -- JS-disabled crawl -- dist privacy scans -- perf spot. Preview server stopped after run; no repo pollution (only allowlisted files added).

---

## 1. QA spec inventory (every file under `apps/web/qa/`)

| # | Spec | Packet / gate | Run mode | Result |
|---|------|---------------|----------|--------|
| 1 | `design-tokens.spec.mjs` | WF-01 / G1 | Static node (source scan + tokens.json + WCAG contrast) | PASS |
| 2 | `ui-primitives.spec.mjs` | WF-02 / G2 | Static node (source scan) | PASS (194 checks) |
| 3 | `content-components.spec.mjs` | WF-04 / G2-G3 | Static node (source scan) | PASS (240 checks) |
| 4 | `page-templates.spec.mjs` | WF-05 / G3 | Static node (source scan) | PASS (272 checks) |
| 5 | `public-shell.spec.mjs` | WF-03 / G2-G3 | Static node (source scan) | PASS (98 checks) |
| 6 | `design-atlas.spec.mjs` | WF-06 / G4-G5 | Static node + 2 self-managed child builds (default + DESIGN_ATLAS=1) | PASS (G4 atlas-free, G5 emits /_design/) |
| 7 | `home-composition.spec.mjs` | WF-07A | Static node (source scan) | PASS (36 checks) |
| 8 | `research-publications.spec.mjs` | WF-07B | Static node (source scan) | PASS (100 checks) |
| 9 | `projects-adopt.spec.mjs` | WF-07C | Static node (source scan) | PASS (45 checks) |
| 10 | `creative-adopt.spec.mjs` | WF-07D | Static node (source scan) | PASS (64 checks) |
| 11 | `writing-adopt.spec.mjs` | WF-07E | Static node (source scan) | PASS (134 checks) |
| 12 | `teaching-adopt.spec.mjs` | WF-07F | Static node (source scan) | PASS (52 checks) |
| 13 | `about-cv-adopt.spec.mjs` | WF-07G | Static node (source scan) | PASS (85 checks) |
| 14 | `contact-adopt.spec.mjs` | WF-07H | Static node (source scan) | PASS (51 checks) |
| 15 | `graph-consumer.spec.mjs` | WF-08 / G7 | Static node + self-managed mock-CMS build + snapshot restore | PASS (93 checks) |
| 16 | `asset-delivery.spec.mjs` | WF-09 / G5 | Static node (masters/derivatives) + built dist | PASS (225 checks; 11 masters hash-verified, 77 derivatives) |
| 17 | `cms-profile-build.spec.mjs` | ADR-0027 S3 | Dist scan + fail-build child + restore build | PASS |
| 18 | `home-cms-build.spec.mjs` | X-01 | Dist scan + fail-build child (**no restore**) | PASS |
| 19 | `projects-catalog.spec.mjs` | board A | Dist scan (snapshot build) | PASS |
| 20 | `p8-catalog.spec.mjs` | P8 parity | Self-managed mock-CMS build + snapshot restore | PASS (API count == dist links, 8 catalogs) |
| 21 | `cms-origin-honesty.spec.mjs` | ADR-0027 S3 | Self-managed 503-mock fail-builds + restore | PASS (articles + profile) |
| 22 | `contact-page.spec.mjs` | board A10 | Dist scan | PASS (24/24 checks) |
| 23 | `health.spec.mjs` | P1 | Dist scan + HTTP (HTTP half ran with PREVIEW_URL) | PASS (file + HTTP halves) |
| 24 | `sitemap.spec.mjs` | P1 | Dist scan | PASS (31 URLs, no drafts/admin) |
| 25 | `pagefind.spec.mjs` | Wave 5 | Dist scan | PASS (per-locale, page_count matches, drafts excluded) |
| 26 | `budget.spec.mjs` | A-05 / ADR-0030 | Dist scan (gzip chunks) | PASS (187.39 KB gzip total, all chunks <= 150 KB) |
| 27 | `demo-embed.spec.mjs` | X-10 / DEFER-0021 | Module units + dist scan | PASS (58 HTML files, no placeholder leak) |
| 28 | `writing-canonical-og.spec.mjs` | WF-07E | Dist scan | PASS |
| 29 | `writing-rss.spec.mjs` | DEFER-0018 | Dist scan | PASS |
| 30 | `mobile-overflow.spec.mjs` | WF-03 | Playwright (needs preview server, PREVIEW_URL) | PASS (6 pages x 4 viewports, overflow + dir + control reachability; hidden-disclosure controls SKIPped by design) |
| 31 | `about-tabs.spec.mjs` | WF-07G | Playwright (needs preview server, PREVIEW_URL) | PASS (2 locales x 6 viewports: overflow, geometry, sticky, keyboard, activation, locale-switch, show-all, skills-filter) |
| 32 | `final-matrix.spec.mjs` **(NEW, this packet)** | WF-10 / G9 | @playwright/test (needs preview server; run via temp config so repo config webServer does not boot CMS) | PASS -- 279 passed / 4 skipped / 0 failed (see section 2) |
| 33 | `e2e/content-lifecycle.spec.ts` (+ fixtures) | DEFER-0026 | Playwright -- needs disposable CMS stack (Python/uv + admin SPA build) | **SKIPPED** (environment; owned by `ci-cms.yml` job `playwright-lifecycle`) |
| 34 | `e2e/admin-qa-matrix.spec.ts` | DEFER-0032 (PARTIAL) | Playwright -- needs disposable CMS stack | **SKIPPED** (same reason) |
| 35 | `e1-evidence-shot.mjs` | E1 evidence | One-off screenshot tool (not a gate) | Inventoried, not run |
| 36 | `e10-evidence-shot.mjs` | E10 evidence | One-off screenshot tool (not a gate) | Inventoried, not run |

Non-spec gates also run: `npm run check` (0 errors, 0 warnings, 17 hints) - agent-kit `validate.mjs` G0 (PASS: 24 comp / 6 tpl / 10 assets) - `npm audit --audit-level=high` (0 vulnerabilities) - smoke.sh check-set (see 3.3) - default `npm run build` (58 pages, no /_design/).

## 2. Final matrix (new `qa/final-matrix.spec.mjs`) -- result

Cells: gateway + 10 locale routes (`home, research, publications, writing, about, cv, contact, creative, teaching, projects`) x {en, fa} x viewports {320x568, 390x844, 768x1024, 1024x768, 1280x800, 1440x900} x themes {light, dark via `localStorage.theme` + reload}.

| Suite | Tests | Pass | Skip | Fail | Notes |
|---|---|---|---|---|---|
| Gateway (always-night, 6 viewports) | 6 | 6 | 0 | 0 | dir=ltr, lang=en, data-theme=dark, skip-link, 1 h1, overflow<=1px, both locale buttons present |
| Gateway light-override honesty | 1 | 1 | 0 | 0 | `localStorage.theme=light` + reload still renders data-theme="dark" (always-night holds) |
| Locale route matrix | 240 | 240 | 0 | 0 | per cell: horizontal overflow <= 1px, skip-link `a.skip-link[href="#main"]`, exactly 1 h1, html lang/dir correct, data-theme resolves to forced theme. **0 overflow hits in 246 cells** |
| Writing detail honest probe | 4 | 2 | 2 | 0 | **SKIPPED, not PASS:** the CMS-less snapshot build publishes no `/writing/{slug}/` detail routes (verified empty); detail rendering is covered by source-scan adopt specs + p8 mock-build detail parity. Skip counted honestly |
| 200% text zoom proxy (CSS `zoom=2`, home+about, 2 locales x 2 viewports) | 8 | 8 | 0 | 0 | all *visible* header nav links keep non-zero geometry inside the document bounds; anchors inside the closed More disclosure are display:none (same reality `mobile-overflow` SKIPs as hidden) -- not clipped content |
| JS-disabled crawl (`javaScriptEnabled:false`, 2 locales x 10 routes) | 20 | 20 | 0 | 0 | header nav links present, non-empty `<main>` text (>80 chars) on every core page; contact form fields + honeypot survive (form action `/api/contact`, name/email/message/website); projects honest-empty or GET filter form; research honest-empty or filter markup |
| **Total** | **283** | **279** | **4** | **0** | `[final-matrix] cells=246 overflowHits=0 writingDetailSkipped=true` |

Run command: `PREVIEW_URL=http://127.0.0.1:4321 npx playwright test --config=<temp config> --reporter=list` from `apps/web` (temp config in `%TEMP%\opencode` avoids the repo config's CMS webServer and keeps artifacts out of the repo).

## 3. Cross-cutting verifications

### 3.1 Dist privacy / leak scans (default snapshot build, 249 files)

Text artifacts only (html/xml/css/json/txt/svg -- 80 files):

| Pattern | Hits | Verdict |
|---|---|---|
| `Atlas Fixture` | 0 | CLEAN |
| `unpublished: true` | 0 | CLEAN |
| `data-atlas-id` | 0 | CLEAN |
| `_design` | 0 | CLEAN (G4) |
| `+98` | 0 | CLEAN |
| `9891\d{8}` | 0 | CLEAN |
| `09\d{9}` | 0 | CLEAN |
| `gmail` | 0 | CLEAN |
| `tel:` | 0 | CLEAN |
| `\bdraft\b` (word) | 0 | CLEAN |
| `\bprivate\b` (word) | 0 | CLEAN |

Raw (all-files) scan leftovers, classified -- none are site content:
- `+98` x2 inside binary PNG art derivatives (random compressed bytes).
- `09\d{9}` x2 = substring of the float constant `0.3183098861837907` in the three.js vendor chunk.
- `gmail` x4 = pagefind vendor bundle locale-credit string (a third-party author's address inside the library, not site content, not the owner's data).
- `tel:` x1 = React vendor input-type allowlist (`tel:!0`), not a phone link.
- `private` x6 = pagefind vendor internals + the search page's honesty meta description ("Drafts and private files are not indexed").

Contact-page exemptions: none needed -- `contact-page.spec` already asserts no phone/tel on contact pages and it passed 24/24.

### 3.2 Performance spot

| Metric | Value | Evidence |
|---|---|---|
| dist total | 12.03 MB / 249 files | measured |
| Largest files | 9x art PNG 800w fallbacks 508.6-796.8 KB (all < 1 MB asset cap) + `three.module.js` 509.2 KB raw | measured (asset-delivery caps derivatives < 1 MB) |
| JS chunks (gzip) | 4 chunks, total 187.39 KB; three 126.10 KB (<= 150 KB ceiling); `client.js` 55.97 KB (above 35 KB island target, reported not enforced -- budget.spec v1) | `budget.spec` output |
| Pagefind index | en: 41 files / 662.0 KB, page_count 27, 694 words; fa: 40 files / 598.8 KB, page_count 27, 999 words | pagefind build log + `pagefind.spec` PASS |
| LCP (gateway) | preload present in built `dist/index.html`: `<link rel="preload" as="image" href="/art-derived/portal-centered-dark-800w.png" imagesrcset="...800w/1200w/1600w avif" imagesizes="100vw">`; hero `<img>` eager + fetchpriority=high + width/height box reserved | `asset-delivery.spec` PASS (225 checks incl. "LCP preload in dist") + direct dist grep |
| CLS | not re-measured (no browser timing run); static evidence only: aspect-ratio + width/height reservation enforced by `content-components.spec` (MediaTile) and `asset-delivery.spec` | honest not-measured marker |

### 3.3 Smoke check-set (CI parity)

`bash infra/deploy/smoke.sh` executed via WSL failed to reach the Windows localhost (WSL NAT limitation -- environment, not site). All 8 smoke.sh checks were replicated via PowerShell against the same preview server: root `/` 200, `/en/` 200, `/fa/` 200, `/robots.txt` 200, `/sitemap.xml` 200, `/nonexistent-qa` 404, `/health.json` 200 with `"status":"ok"` + `"service":"static"` + no `db` field, `/health/` 404 (distinct from static health.json). **All PASS.**

## 4. Defects and observations

No product-code defect was found in `apps/web`. Defects encountered were in the new spec authored by this packet and were fixed in place (allowlisted file):

| ID | Severity | Owner | Finding | Disposition |
|---|---|---|---|---|
| QA-1 | Low (test-file) | WF-10 (self) | `final-matrix.spec.mjs` initial bugs: `/en` without trailing slash (404), removed `assertCell` dead code, `test.info().annotate` unavailable in Playwright 1.62, zoom bounds compared against unzoomed `scrollWidth`, no-JS filter assertions over-strict for honest-empty snapshot pages | Fixed in the spec (visible-link filter via `checkVisibility()`, document-bounds geometry, honest-empty OR filter-form). All 279 tests green afterwards. No product change |
| OBS-1 | Low | WF-07A / X-01 spec author | `qa/home-cms-build.spec.mjs` leaves `dist/` in a broken (partially built) state after its fail-build child -- it never restores a snapshot build, unlike its siblings (`cms-profile-build`, `p8-catalog`, `cms-origin-honesty`). It is also not wired into `ci.yml` | QA-hygiene only; CI order is not affected. Suggest adding a restore build or a CI step if it is ever sequenced with dist consumers |
| OBS-2 | Info | WF-08 (Constellation3D) | `astro check` 17 hints: unused vars in qa specs, deprecated `THREE.Clock` constructor + `media.addListener` in `BaseLayout` | Cosmetic; no gate violation |
| OBS-3 | Info | WF-09 (scripts/pagefind-index.mjs) | Node DEP0190 warning: child-process args with `shell: true` in the pagefind postbuild | Hygiene; works today |
| OBS-4 | Info | WF-10 follow-up | `health.spec.mjs` HTTP half silently SKIPs when PREVIEW_URL is unset (CI runs only the file half); this audit ran both halves | Optional CI wiring to the preview phase |
| OBS-5 | Info | Integration lead | Worktree carried uncommitted WF-09 gateway-art change on `apps/web/src/pages/index.astro` + concurrent `apps/admin/*` edits during the audit; results reflect that state | Commit/land WF-09 work before G9 sign-off merge |

## 5. Deferred / skipped (SKIPPED is not PASS)

| Item | Status | Reason / owner |
|---|---|---|
| `qa/e2e/content-lifecycle.spec.ts` + `qa/e2e/admin-qa-matrix.spec.ts` | SKIPPED | Require a disposable CMS stack (Python 3.12 + uv + admin SPA build); owned by `.github/workflows/ci-cms.yml` job `playwright-lifecycle`. `DEFER-0032` (PARTIAL) remains the tracker for the manual remainder |
| Writing detail matrix cells | SKIPPED (honest) | Snapshot (CMS-less) build publishes no writing detail routes; covered structurally by `writing-adopt` + mock-build parity in `p8-catalog` |
| smoke.sh as a bash script on Windows | Equivalent check run | WSL NAT cannot reach Windows localhost; all 8 checks replicated via PowerShell -- PASS |
| Browser LCP/CLS timing re-measurement | Not measured | Out of scope per WF-10 spot-check instruction; static LCP evidence cited (3.2) |
| Screen-reader path (beyond landmarks/ARIA asserted in structural specs + keyboard tests in `about-tabs`) | Not run this session | Requires interactive AT; landmark order, skip-link, single-H1, focus parity and keyboard behavior are enforced by specs 1-5, 31 |

## 6. G9 verdict

**READY.**

- Full suite: 32 runnable specs PASS (+ 2 honest SKIPPED CMS-stack e2e suites owned elsewhere, + 2 evidence tools not gates). No FAIL.
- Final matrix: 279 passed / 4 honest skips / 0 failed across 246 viewport x locale x theme cells, 8 zoom cells, 22 JS-disabled cells -- zero horizontal overflow, skip-link + single-H1 + lang/dir correct everywhere.
- Privacy dist scans: all privacy-critical patterns ZERO on text artifacts; atlas isolation G4/G5 green both build modes.
- Budgets: all JS chunks within the ADR-0030 gzip ceiling; asset derivatives under 1 MB; Pagefind healthy per locale.
- Blockers: **none**. Observations OBS-1..OBS-5 are non-blocking (test hygiene + notes); OBS-5 recommends landing the pending WF-09 worktree change before cutover.
