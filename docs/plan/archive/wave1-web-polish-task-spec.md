# Task: Wave 1 — web polish (writing canonical, RSS, OG, catalog URL filters)

**Status:** DONE (live after LOG-0216 rebuild)

- Goal: Close public writing URL drift, ship per-locale RSS, add a typographic default OG card, and persist projects/research catalog filters in the URL — without CMS migrations or Wave 2+ scope.
- User/actor and journey: Public visitors open `/{locale}/writing/` (and old `/{locale}/blog/` URLs permanently redirect). Feeds are discoverable via `rel=alternate`. Social previews use `/og-default.png` unless an article has `featured_image`. Catalog filters remain usable with JS and show all items without JS.
- Release type: `FAST-TRACK`
- Risk level: Low (static Astro only)
- Owner and handoff recipient: agent → parent/reviewer; production needs owner `rebuild-web` after merge (not part of this task)

## Scope

- In scope:
  - Docs sync for LOG-0210 reality (DEFER-0027 / DEFER-0031 / RISK-0013 CLOSED; ADM-6 PARTIAL = QA only)
  - Public routes under `/{locale}/writing/` + permanent redirects from `/{locale}/blog/`
  - Per-locale RSS at `/{locale}/writing/rss.xml` + BaseLayout alternate link
  - Typographic OG SVG source + PNG; BaseLayout `ogImage`; article override via `featured_image.url`
  - ProjectsCatalog + ResearchCatalog `?type=&sort=` via `history.replaceState`
- Non-goals: Wave 2+ (PDF, lightbox, iframe/CSP, P8, graph, ADM QA matrix, Pagefind, decommission); CMS migrations; deploy/SSH; `CMS_CD_AUTO_MIGRATE`
- Allowed files: `apps/web/**`, `docs/plan/**`, `docs/contracts/IA-CONTRACT.md`, `docs/status/**`, `docs/README.md` (if needed), `AGENTS.md`, `Task-list.md`, `scripts/_wave1_*.mjs` (local helper only)
- Forbidden files: `apps/cms/**` schema/migrations, `infra/**` deploy secrets, plan file at `.cursor/plans/**`

## Contracts and data

- Documents/ADRs/API schemas/models read: `AGENTS.md`, `docs/contracts/IA-CONTRACT.md`, `docs/plan/README.md`, `docs/status/deferred-validation.md`, `apps/web/src/lib/cms/articles.ts`
- Contracts changed: IA live-route wording aligned to writing-canonical + blog redirects
- Migration/data impact: None
- Locale, visibility and publication impact: Public writing URLs change; blog URLs remain as redirects; RSS lists published articles only
- Security/privacy impact: None new (published-only feed; no secrets)

## Verification and release

- Tests/commands to run:
  - `cd apps/web && npm run check`
  - `cd apps/web && npm run build`
  - `node qa/writing-rss.spec.mjs`
  - `node qa/writing-canonical-og.spec.mjs`
  - `node qa/projects-catalog.spec.mjs`
- Manual QA path: open `/en/writing/`, `/fa/writing/`, `/en/blog/` (redirect), RSS XML, view-source for `og:image` + alternate RSS; toggle project/research filters and confirm query string updates without full navigation
- Acceptance criteria:
  - Writing tree is canonical; blog redirects permanently
  - DEFER-0018 and DEFER-0009 CLOSED in deferred-validation with WORK_LOG evidence
  - No-JS catalog pages still list all items
  - No invented content/assets beyond typographic OG from existing logo/tokens
- Rollback/fallback: revert branch; old `/blog/` tree can be restored from git history
- Documentation to update: WORK_LOG, deferred-validation, Task-list, CHANGELOG, docs/plan/README.md, IA-CONTRACT, AGENTS.md

## Handoff

- Files changed (task-owned only): apps/web writing routes + blog redirects + RSS + OG + catalogs; docs plan/IA/deferred/WORK_LOG/CHANGELOG/Task-list/AGENTS
- Verification actually run: npm run check PASS; npm run build PASS; writing-rss + writing-canonical-og + projects-catalog QA PASS
- Deferred/risk IDs: DEFER-0018 CLOSED; DEFER-0009 CLOSED; DEFER-0032 remains OPEN (ADM QA)
- Explicit blockers and next input: owner static rebuild after merge; Wave 2 requires migrations + owner attend
