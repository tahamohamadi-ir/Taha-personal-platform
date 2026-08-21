# Task Specification — ADM-6 Frontend wiring + rebuild + E2E

**Status:** `PARTIAL`

## Task: ADM-6 — Astro published fetch, rebuild trigger, lifecycle E2E

- Goal: Public Astro pages list published CMS rows at build time; after a successful publish the loopback rebuild hook can run `infra/deploy/rebuild-static.sh` when enabled; a local create→edit→publish→public JSON path is tested. HMAC enablement on production stays owner-gated.
- User/actor and journey: Owner publishes in the React admin; visitors see published fa/en pages after a static rebuild. Anonymous callers never see drafts or `/api/v1/admin/*`. Content list opens the unified edit page (story + nested profile skills); legacy `/edit` URL redirects to canonical `/content/:entity/:id`.
- Release type: `STANDARD`
- Risk level: Medium (rebuild side effect; production enable is owner-only)
- Owner and handoff recipient: agent implements → CI → owner VPS migrate/rebuild/enable
- Related: `Task-list.md` §17 ADM-6; ADR-0026; LOG-0164+

## Scope

- In scope:
  - Public `/api/projects/{locale}` lists published + `show_on_projects` projects (case-study filter optional).
  - Honest public copy (no `CMS_API_BASE` in visitor HTML).
  - Card catalog on `/{locale}/projects/`.
  - Rebuild trigger actually invokes the loopback script when `REBUILD_TRIGGER_ENABLED` is true.
  - Pytest lifecycle: create → edit → publish → public JSON fa/en.
  - `primaryColor` CSS injection + admin-managed current CV/resume documents (`DEFER-0029` CLOSED / `DEBT-0006` CV RESOLVED — LOG-0181).
- Non-goals:
  - Opening `/rebuild-trigger/` on public Caddy.
  - Enabling HMAC on production without owner action (`DEFER-0027`).
<<<<<<< HEAD
  - Full Playwright §18 matrix remainder (`DEFER-0032`). Lifecycle browser suite shipped (`DEFER-0026` CLOSED).
  - Composition → Astro for **non-blog** types, `primaryColor` CSS injection, CV current-document, contact inbox (`DEBT-0006`, `DEFER-0029`). Blog story→Astro is `docs/plan/blog-story-composition-task-spec.md` (`DEFER-0028` CLOSED).
=======
  - Full Playwright §18 matrix (`DEFER-0026`).
  - Composition → Astro for **non-blog** types (`DEFER-0030`). Contact inbox stays closed (`DEFER-0007`).
>>>>>>> origin/main
  - OpenAPI admin docs, feature flags, preview tokens, rich blocks v2.
  - Uninstalling Wagtail (`DEBT-0003`).
- Allowed files: `apps/cms/**`, `apps/web/**`, `infra/deploy/rebuild-static.sh`, `docs/plan/ADM-6-frontend-wiring-task-spec.md`, `docs/plan/README.md`, `docs/status/**`, `Task-list.md`, `AGENTS.md`, `PROJECT_MANIFEST.md`.
- Forbidden files: secret files, production Caddy live host files.

## Contracts and data

- Documents/ADRs/API schemas/models read: ADR-0026; P6 case-study spec (list semantics updated); public Ninja `/api/projects/`.
- Contracts changed: public project list default is no longer case-study-only; additive `Project.show_on_projects`.
- Migration/data impact: additive Boolean `db_default=True` (`0007`). Owner dumpdata + backup before production migrate (RISK-0010).
- Locale, visibility and publication impact: only `public()` + `show_on_projects=True` appear on `/projects/`.
- Security/privacy impact: rebuild hook remains HMAC + disabled-by-default; no public `/api/v1/admin/*`.

## Verification and release

- Tests/commands to run:
  - `uv run pytest -q` in `apps/cms` — expected: pass including project listing + lifecycle + rebuild mock.
  - `uv run ruff check .` in `apps/cms` — expected: clean.
  - `npm run check` in `apps/web` and `apps/cms/admin-frontend`.
- Manual QA path: after owner migrate + static rebuild, `/fa/projects/` and `/en/projects/` show seeded cards.
- Acceptance criteria:
  - Empty public projects page is not the default when published listed projects exist in CMS.
  - Admin checkbox `showOnProjects` hides a published project from `/api/projects/`.
  - `REBUILD_TRIGGER_ENABLED=False` still returns 403; when True + valid HMAC, script is invoked (mocked in tests).
- Rollback/fallback: revert PR; previous CMS image; boolean default True is compatible.
- Documentation to update: `WORK_LOG`, `deferred-validation`, `RISK_REGISTER`, `TECH_DEBT`, `CHANGELOG`.

## Handoff

- Files changed (task-owned only): recorded in WORK_LOG LOG-0165.
- Verification actually run (command + result):
  - `uv run ruff check .` in `apps/cms` — All checks passed
  - `uv run pytest -q` in `apps/cms` — 303 passed
  - `uv run python manage.py check` — no issues; `makemigrations --check --dry-run` — No changes detected
  - `npm run check` in `apps/web` — 0 errors (71 files); `npm run build` — 40 pages; `node qa/projects-catalog.spec.mjs` — PASS
  - `npm run check` / `npm run build` in `apps/cms/admin-frontend` — PASS
<<<<<<< HEAD
- Deferred/risk IDs: `DEFER-0026` CLOSED (Playwright lifecycle LOG-0184); `DEFER-0032` OPEN (§18 QA remainder); `DEFER-0027`, `DEFER-0029`, `DEBT-0003`, `DEBT-0006`, `RISK-0010`.
- Explicit blockers and next input: owner VPS dumpdata + backup, `migrate` through `0007`, `rebuild-static.sh`; HMAC enable only after smoke (`DEFER-0027`). Not DONE for production.
=======
- Deferred/risk IDs: `DEFER-0026`, `DEFER-0027`, `DEFER-0029` CLOSED (LOG-0181), `DEBT-0003`, `DEBT-0006` CV RESOLVED (contact remains out of scope under `DEFER-0007`), `RISK-0010`.
- Explicit blockers and next input: owner VPS dumpdata + backup, `migrate` through siteconfig `0002`, `rebuild-web.sh`; HMAC enable only after smoke (`DEFER-0027`). Not DONE for production.
>>>>>>> origin/main
