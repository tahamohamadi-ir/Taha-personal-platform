# Task Spec: Wave 5 — ADM QA matrix, service/flags, Pagefind search

- Goal: Close automatable ADM-6 §18 QA (`DEFER-0032`), extract thin lifecycle + public-projection services with a default-off feature flag for bulk archive (S1/S4), and ship `/{locale}/search/` with post-build Pagefind (owner-authorized early P10).
- User/actor and journey: Staff admin (RTL shell, keyboard, noindex, bulk archive); public readers (search route + nav affordance).
- Release type: `STANDARD`
- Risk level: Medium (feature-flagged bulk; search indexes only published static HTML)
- Owner and handoff recipient: Project owner (old-stack decommission remains human-only)

## Scope

- In scope:
  - Playwright specs for RTL, keyboard login, noindex/no-store, LTR slug fields, bulk archive count+confirm (e2e flag on)
  - Manual S6 checklist for remaining matrix items
  - `apps/content/services/` lifecycle + public_projection; `feature_flags.py`; `FEATURE_ADMIN_BULK_ARCHIVE` default off
  - Admin SPA bulk archive UI behind flag; `auth/me.featureFlags`
  - Astro `/{locale}/search/` + Header/Footer links + Pagefind post-build index scripts
  - Docs: Task-list §15 early-Pagefind note, plan README, CHANGELOG, WORK_LOG, BACKLOG decommission link clarity
- Non-goals:
  - Contact inbox (`DEBT-0006` contact stays OPEN)
  - Research graph / Wave 4 files
  - Owner VPS decommission SSH/docker
  - Wholesale Ninja router rewrite
  - Enabling `CMS_CD_AUTO_MIGRATE`
- Allowed files: `apps/cms/**` (services, admin API/SPA, tests, settings), `apps/web/**` (search, pagefind, playwright, content strings), `docs/**`, `Task-list.md`, `infra/cms/.env.example`, `infra/deploy/decommission-old-stack.md` (link only)
- Forbidden files: Wave 1–4 worktrees; plan file `adm_p8_polish_ops_*.plan.md`; production secrets

## Contracts and data

- Documents/ADRs/API schemas/models read: IA-CONTRACT §8; ADM-6 task spec; custom-admin §14 S1/S4/S6; DEFER-0032
- Contracts changed: IA-CONTRACT self-check search item satisfied by shipping route+UI together
- Migration/data impact: None
- Locale, visibility and publication impact: Search indexes published static HTML only; per-locale indexes under `dist/{en,fa}/pagefind/`
- Security/privacy impact: Bulk archive default-off; admin noindex/no-store verified; no draft/preview in Pagefind

## Verification and release

- Tests/commands to run:
  - `cd apps/cms && uv run ruff check apps/content/services apps/content/feature_flags.py apps/api/admin_content.py apps/api/admin_api.py apps/api/api.py`
  - `cd apps/cms && uv run pytest tests/test_admin_bulk_archive.py tests/test_admin_workflow_api.py -q`
  - `cd apps/web && npm ci && npm run check && npm run build` (offline / unset `CMS_API_BASE`)
  - `cd apps/web && npm run test:e2e` when Bash e2e stack available; else document skip
- Manual QA path: `docs/plan/manual-test-checklists/adm-qa-s6.md`
- Acceptance criteria:
  - Automatable DEFER-0032 items covered by Playwright + pytest; remaining items listed as PARTIAL/manual
  - Bulk archive 404 when flag off; archives + audit when on
  - Search route + nav exist together; Pagefind scripts succeed after build
  - Early Pagefind phase-order exception documented
- Rollback/fallback: Leave `FEATURE_ADMIN_BULK_ARCHIVE` unset/false; remove nav search links + search pages if needed; Pagefind index is build artifact only
- Documentation to update: WORK_LOG LOG-0215+, deferred-validation, TECH_DEBT if partial, CHANGELOG, Task-list, plan README, BACKLOG

## Handoff

- Files changed (task-owned only): see git status on `feat/wave5-adm-qa-pagefind`
- Verification actually run (command + result): ruff PASS; pytest bulk+workflow 20 passed; web check/build+pagefind PASS; Playwright skipped (uv missing in Bash webServer PATH)
- Deferred/risk IDs: `DEFER-0032` PARTIAL; `DEBT-0006` contact OPEN unchanged; owner decommission **CLOSED** (LOG-0216)
- Explicit blockers and next input: owner old-stack decommission; merge coordination with other waves; CSP enforce if still open from Wave 2
