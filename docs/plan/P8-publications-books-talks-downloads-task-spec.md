# Task Specification — P8 Publications / Books / Talks / Downloads

## Task: P8 — Publications, Books, Talks, Downloads

- Goal: Ship typed CMS models and published-only public projection for Publications (extended), Books, Talks, and Downloads; bilingual Astro list/detail routes matching IA; citation export only from real fields; Media-backed downloads that never leak inactive/private files.
- User/actor and journey: Editors manage entities in the custom admin SPA. Public visitors browse canonical `/{locale}/publications|books|talks|downloads/` trees. Research may link to publication detail but does not own the canonical URL.
- Release type: `STANDARD`
- Risk level: Medium (additive migrations; access/license projection mistakes)
- Owner and handoff recipient: Agent implements in `feat/wave3-p8-publications` → owner dumpdata + attended migrate → rebuild-web
- Status: `PARTIAL` (repo complete LOG-0213; owner attended migrate `content.0013` + rebuild-web remaining)

## Scope

- In scope:
  - IA-CONTRACT public URL tree for P8 list + detail per locale.
  - Extend `Publication` (abstract, type, academic stage, identifiers, access state, citation text, optional Media PDF) without breaking P5 `/api/research/publications/`.
  - New models `Book`, `Talk`, `Download` with `LocalizedContentMixin` + `LifecycleMixin`; Download Media-backed.
  - Register entities + `Series` in `ENTITY_MODELS`, field maps, dashboard counts, SPA `ContentEntity` / `entities.ts`.
  - Published-only Ninja endpoints; Astro pages; sitemap; JSON-LD only for real identifiers.
  - Citation export honesty; restricted downloads omitted from public file URLs; pytest for ACL + admin schema/CRUD smoke.
- Non-goals:
  - Wave 4 research graph / ADR-0028.
  - Wave 5 ADM QA matrix / Pagefind.
  - Owner VPS decommission / setting `CMS_CD_AUTO_MIGRATE`.
  - Invented publications, citations, metrics, or translations of real works.
- Allowed files: `apps/cms/apps/content/**`, `apps/cms/apps/api/**`, `apps/cms/apps/media/**` (read helpers only), `apps/cms/admin-frontend/src/lib/**`, `apps/cms/tests/**`, `apps/web/src/{lib/cms,pages,data,components}/**`, `docs/contracts/IA-CONTRACT.md`, `docs/plan/P8-*.md`, `docs/plan/README.md`, `docs/status/**`, `Task-list.md`, `AGENTS.md` (pointer only if needed).
- Forbidden files: Wave 1/2 worktrees; `infra/**` Caddy/migrate auto flags; inventing secret values.

## Contracts and data

- Documents read: IA deep doc §§52–54/64, Task-list §13, P5 Spec, this Spec.
- Contracts changed: IA-CONTRACT live/canonical P8 URLs; content migration `0013_p8_publications_books_talks_downloads`; public `/api/{publications,books,talks,downloads}/`; admin entity registry.
- Migration/data impact: additive only. Owner: backup + dumpdata, then attended Actions migrate (`migrate_cms=true`). Never `CMS_CD_AUTO_MIGRATE`.
- Locale/visibility: fa/en independent; `.objects.public()`; restricted/metadata-only never expose file URLs; inactive Media never projected.
- Security/privacy: safe download headers on file endpoint; no draft/status leakage in public DTOs.

### Canonical public URLs

```text
/{locale}/publications/
/{locale}/publications/{slug}/
/{locale}/books/
/{locale}/books/{slug}/
/{locale}/talks/
/{locale}/talks/{slug}/
/{locale}/downloads/
/{locale}/downloads/{slug}/
```

Legacy `/{locale}/research/publications/{slug}/` permanently redirects to `/{locale}/publications/{slug}/`.

### Public API

| Method | Path |
|---|---|
| GET | `/api/publications/{locale}` (paginated) |
| GET | `/api/publications/{locale}/{slug}` |
| GET | `/api/research/publications/...` (kept; same public queryset) |
| GET | `/api/books/{locale}` / `{slug}` |
| GET | `/api/talks/{locale}` / `{slug}` |
| GET | `/api/downloads/{locale}` / `{slug}` |
| GET | `/api/downloads/{locale}/{slug}/file` (public access + active media only) |

## Verification and release

- Tests/commands: `uv run ruff check .`; targeted pytest for P8 ACL + admin schema; `npm run check` + `npm run build` in `apps/web`; admin-frontend check if SPA touched.
- Acceptance criteria:
  - Draft / inactive media / restricted access never appear as public file links.
  - Citation text only when editor-supplied and core bibliographic fields present.
  - Empty CMS build remains honest (no invented items).
- Rollback: revert commit; migration reverse is Alter/Add only (owner dumpdata first).
- Documentation: WORK_LOG LOG-0213, CHANGELOG, Task-list §13, plan README, BACKLOG.

## Handoff

- Branch/worktree: `feat/wave3-p8-publications` @ `.worktrees/feat-wave3-p8-publications`
- Owner migrate: dumpdata + backup → attended `migrate_cms=true` for `content.0013` → `rebuild-web.sh`
- Wave 4 blockers: bundle budget 35KB vs three.js; GSAP license; ADR-0028 acceptance checklist (§98)
