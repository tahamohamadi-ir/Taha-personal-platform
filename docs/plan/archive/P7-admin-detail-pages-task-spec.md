# Task Specification — P7 Admin Detail Pages

**Status:** `QUEUED` — Profile admin at `/admin/profiles/` already shipped
(`LOG-0150` / PR #31). Remaining work is bilingual detail pages for other typed
entities, not a second Profile editor.

## Task: P7 — same-origin bilingual admin detail pages

- Goal: add a focused, same-origin admin detail-page slice under `/admin/` for bilingual content editing and review, without breaking the existing Wagtail/session/TOTP/AuditLog boundary and without introducing a second-origin SPA.
- User/actor and journey: the owner opens `/admin/`, navigates to a content record, edits one locale at a time with a clear alternate-locale path, sees translation/completeness status and conflict warnings, then saves/publishes inside the existing authenticated admin session.
- Release type: `STANDARD`
- Risk level: Medium, because this slice changes the editorial surface and concurrency behavior but must not widen the security boundary.
- Owner and handoff recipient: Project owner -> agent working in `apps/cms/` -> `ci-cms.yml` -> owner review.

## Keep — do not change

- `/admin/` stays the only same-origin admin entrypoint; no second-origin admin SPA.
- Session + CSRF + TOTP + AuditLog remain mandatory; no JWT or `localStorage` auth.
- One content row per locale; no `_en`/`_fa` columns; no silent fallback.
- `ContentQuerySet.public()` remains the only public projection.
- fa/en publication stays independent; never require both locales to publish one locale.
- Public site stays static-first and readable without JavaScript.
- Typed Profile is CMS-managed (`LOG-0150`). Public About builds from the profile API with committed `profile.snapshot.json` fallback. Do not treat `content.ts` as the profile seed.

## Scope

- In scope:
  - A same-origin admin detail-page pattern for typed content records that need richer editing/review than default list/snippet chrome.
  - Bilingual admin chrome with a language toggle that follows real alternate records, not path/slug string replacement.
  - Translation status states `MISSING`, `INCOMPLETE`, `COMPLETE`, `OUTDATED`, with a field-level checklist for title, slug, body, and SEO.
  - Latin slugs for both locales, including fa records.
  - Optimistic locking / version checks for concurrent edits so stale writes fail explicitly.
  - Localized missing-translation handling for admin flows, aligned with the public `TRANSLATION_UNAVAILABLE` contract.
  - Audit-safe save/publish/archive actions that keep request bodies and secrets out of logs.
- Non-goals:
  - A React/Vue/Next admin SPA, JWT auth, `localStorage` tokens, or cross-origin admin APIs.
  - A free-form page builder, Composer, Canvas clone, unrestricted HTML/CSS, or plugin SDK.
  - Revision browser parity with enterprise CMS products, multi-step workflow engines, or autosave.
  - Celery/Redis scheduler infrastructure; any per-locale scheduling must stay lightweight and separately approved.
  - Public `/api/` exposure, media-publication changes, or frontend route work.
- Allowed files:
  - `apps/cms/apps/admin/**`
  - `apps/cms/apps/content/**`
  - `apps/cms/apps/security/**`
  - `apps/cms/tests/**`
  - `docs/plan/P7-admin-detail-pages-task-spec.md`
  - `docs/plan/P7-professional-admin-task-spec.md`
  - `docs/plan/README.md`
  - `docs/status/WORK_LOG.md`
  - `docs/status/CHANGELOG.md`
  - `docs/status/BACKLOG.md`
  - `Task-list.md`
- Forbidden files:
  - `apps/web/**`
  - `infra/**`
  - `.github/workflows/**`
  - `PROJECT_MANIFEST.md`
  - accepted ADR bodies in `docs/adr/*.md`
  - any secret file

## Contracts and data

- Documents/ADRs/API schemas/models read:
  - `AGENTS.md`
  - `PROJECT_MANIFEST.md`
  - `docs/adr/0014-admin-security-boundary.md`
  - `docs/adr/0020-p3-admin-auth-boundary.md`
  - `docs/adr/0024-p3-lifecycle-concurrency.md`
  - `docs/plan/P7-professional-admin-task-spec.md`
  - `docs/plan/SAMPLES-TRANSFER-RECOMMENDATIONS.md`
  - `Task-list.md`
  - `apps/web/src/data/profile.ts`
  - `apps/web/src/data/profile.en.ts`
  - `apps/web/src/data/profile.fa.ts`
- Contracts changed:
  - Clarifies the allowed admin UI boundary: same-origin server-rendered detail pages may complement Wagtail inside `/admin/`, but no second-origin SPA or token-based auth is allowed.
  - Freezes the translation-status vocabulary for this admin slice: `MISSING`, `INCOMPLETE`, `COMPLETE`, `OUTDATED`.
- Migration/data impact:
  - Likely additive only. If a version field or edit token is needed for optimistic locking, it must be additive and documented before implementation.
- Locale, visibility and publication impact:
  - fa and en remain independent records and may publish independently.
  - Missing translation in admin must be explicit; no copying the other locale into the current form.
  - Latin slugs are required for both locales.
- Security/privacy impact:
  - Admin remains same-origin, authenticated, authorized, noindex, and audit-logged.
  - Request bodies, private notes, and secrets must not be written to logs.
  - No JWT, `localStorage`, or cross-origin session handoff.
- New dependency: `none` by default. If implementation later needs a library, it must justify it in the implementation Task Spec.

## Verification and release

- Tests/commands to run — fill this table, then paste the real output into the Work Log:

  | # | Command (working directory) | Expected result |
  |---|---|---|
  | 1 | `uv run ruff check .` (`apps/cms/`) | No lint errors |
  | 2 | `uv run python manage.py check` (`apps/cms/`) | No new Django/Wagtail issues beyond documented upstream advisories |
  | 3 | `uv run python manage.py makemigrations --check --dry-run` (`apps/cms/`) | No unexpected migrations; if a migration is intended, it is the only reported change |
  | 4 | `uv run pytest -q` (`apps/cms/`) | Targeted admin/content/security tests pass |

- Manual QA path:
  1. Log in at `/admin/login/` with the normal session + TOTP flow.
  2. Open one bilingual content record and confirm the admin chrome shows the current locale and the real alternate-locale path.
  3. Confirm a missing alternate locale is shown as explicit missing/incomplete state, not auto-filled.
  4. Edit the same record in two tabs and confirm the stale save fails clearly instead of silently overwriting.
  5. Confirm slugs for fa and en are both Latin-script and validated consistently.
  6. Confirm audit views do not expose request bodies or secrets.
- Acceptance criteria:
  - The admin boundary still runs entirely under `/admin/` with same-origin session/CSRF/TOTP/AuditLog.
  - Another agent can implement the detail-page slice without guessing the translation-status vocabulary, slug policy, or auth boundary.
  - The implementation does not require a second-origin SPA or JWT/localStorage tokens.
  - The implementation explicitly guards against silent overwrite and silent locale fallback.
- STOP conditions:
  - A listed file is missing.
  - A command fails twice.
  - The work needs a change outside Allowed files.
  - A required value is not written anywhere.
  - The implementation would require cross-origin auth, JWT, `localStorage`, or a new always-on service.
- Rollback/fallback:
  - Revert the admin detail-page change set and restore the previous CMS image tag if the slice is already deployed.
- Documentation to update:
  - `docs/status/WORK_LOG.md`
  - `docs/status/CHANGELOG.md`
  - `docs/status/BACKLOG.md`
  - `Task-list.md`
  - `docs/plan/P7-professional-admin-task-spec.md` if the implemented scope narrows or expands

## Handoff

Commit message: `feat(admin): add same-origin bilingual detail pages`

Fill these in when you finish. Do not leave placeholders:

- Files changed (task-owned only):
- Verification actually run (command + real output):
- Deferred/risk IDs created or closed:
- Explicit blockers and next input:
- Anything left `PARTIAL` and why:

---

## Self-check before you hand this spec to another agent

- [ ] Every file path is full and repo-relative.
- [ ] Every verification row has a command **and** an expected result.
- [ ] The Status line is present and correct.
- [ ] Non-goals rule out the most likely scope creep.
- [ ] STOP conditions are listed.
- [ ] The keep list names what must not regress.
- [ ] A reader who has never seen this project could execute it.
