# Task Specification — Rich blocks v2 (story catalog)

**Status:** `DONE`

## Task: Story rich blocks v2

- Goal: Extend the single-locale **story** composition catalog with six no-JavaScript public blocks inspired by Divi 5 modules: accordion, tabs, timeline, counters, before/after, slider.
- User/actor and journey: Owner edits a story in the React admin (article/project/research/experience or `/composition` with `kind=story`), adds rich blocks, publishes, and static rebuild renders them on the public site without client JS.
- Release type: `STANDARD`
- Risk level: Low (additive catalog + Astro render; no migrations)
- Owner and handoff recipient: agent implements → CI → owner static rebuild after merge
- Related: Task-list §14 U3; ADM-3; `blog-story-composition-task-spec.md`

## Scope

- In scope:
  - Backend fail-closed validators in `apps/composition/blocks.py` for all six block types.
  - Admin SPA schema-driven fields (`itemList`, before/after media keys) in composition + entity story editors.
  - Astro `StoryBody.astro` render: `<details>/<summary>` accordion; CSS radio tabs; semantic timeline/counters; dual-figure before/after; horizontal scroll-snap slider.
  - Pytest coverage for validators and story schema exposure.
- Non-goals:
  - Landing bilingual catalog changes.
  - JavaScript islands, autoplay, or animation on public pages.
  - New migrations or public API shape beyond existing story projection.
- Allowed files: `apps/cms/**`, `apps/web/**`, `docs/plan/**`, `docs/status/**`, `Task-list.md`.
- Forbidden files: secret files; production Caddy host files.

## Contracts and data

- Documents/ADRs read: ADR-0026; ADM-3 composition; `blog-story-composition-task-spec.md`.
- Contracts changed: story `blockTypes` catalog only; public story JSON may include new `blockType` values with typed `settings`.
- Migration/data impact: none.
- Locale, visibility and publication impact: unchanged — published-only story projection.
- Security/privacy impact: item `body` fields sanitized on public projection (same allowlist as story text).

## Block settings (locked)

| Block | Required settings | Notes |
|---|---|---|
| `accordion` | `items[]` with `title`, `body` | 1–12 items |
| `tabs` | `items[]` with `label`, `body` | 2–8 items |
| `timeline` | `items[]` with `date`, `title`; optional `body` | 1–20 items |
| `counters` | `items[]` with `value`, `label` | 1–6 items |
| `before_after` | `beforeMediaId`, `afterMediaId` | image media only; optional labels/captions |
| `slider` | `mediaIds` | 1–12 image ids; scroll-snap gallery (no autoplay JS) |

## Verification and release

- Tests/commands to run:
  - `uv run pytest -q tests/test_story_composition.py` in `apps/cms`
  - `uv run ruff check .` in `apps/cms`
  - `npm run check` + `npm run build` in `apps/web`
  - `npm run check` in `apps/cms/admin-frontend`
- Manual QA path: attach a published story with each block type; rebuild static; verify render with JS disabled.
- Acceptance criteria:
  - All six types in story schema; landing schema unchanged.
  - Unknown/extra keys rejected (fail-closed).
  - Public projection sanitizes item bodies; before/after media resolved.
  - Astro renders without `<script>` for these blocks.
- Rollback/fallback: revert PR; existing stories unaffected (new types simply absent).
- Documentation to update: `WORK_LOG`, `CHANGELOG`, `Task-list.md` §14 U3, `docs/plan/README.md`.

## Handoff

- Files changed: see WORK_LOG entry for this PR.
- Production: no CMS migrate; owner `rebuild-web` after merge to ship Astro render.
