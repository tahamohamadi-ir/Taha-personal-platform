# Task Specification — P7 Professional Admin (Wagtail)

> **Status: QUEUED — do not start yet.** P4–P6 models exist. `/admin/profiles/`
> already shipped (`LOG-0150` / PR #31). This spec is the remaining professional
> admin surface (P7-01–P7-04), not a redo of Profile admin.
> Active specs: `docs/plan/README.md`.

## Task: P7 — Publish, compose, and manage content in the same-origin admin

- Goal: make `/admin/` the only same-origin editorial surface for publishing, limited landing composition, and bilingual content operations — without a second-origin admin SPA and without copying Sample page-builders.
- User/actor and journey: the owner drafts, previews, publishes, unpublishes, and checks translation/media health in Wagtail; the public site rebuilds from `ContentQuerySet.public()` only.
- Release type: `STANDARD`
- Risk level: Medium (auth already live; this slice is editorial UX + reports + optional schedule/composition, not a new CMS)
- Owner and handoff recipient: Project owner → agent in `apps/cms/` → `ci-cms.yml` → owner review. Public Astro chrome that reads CMS nav/featured is a separate follow-on slice.

## Keep — do not change

- Same-origin `/admin/` with session + CSRF + TOTP + AuditLog (do not add Vue/Next/JWT admin)
- One content row per locale; no `_en`/`_fa` columns; no silent fallback
- `ContentQuerySet.public()` as the only public projection
- Language Gateway and Astro static-first public shell
- Independent fa/en publish (never require both locales before one locale can go live)
- Rich-text allowlist already in `WAGTAIL_RICHTEXT_FEATURES`
- No Redis/Celery/Elasticsearch on the VPS for this slice

## Scope

### Publishing and detail editing

- In scope:
  - Wagtail editors and, where owner-approved UX needs justify it, focused server-rendered admin detail pages for each typed entity that exists in the owning phase (Article/Series in P4, Research/Project/Publication in P5–P8). This spec does not invent those models; it requires an editor surface when the model exists.
  - Explicit lifecycle actions: draft → review → published → archived, with confirm on publish/archive.
  - Optimistic locking / version checks for concurrent detail edits; stale writes must fail explicitly instead of silently overwriting newer content.
  - Preview URLs: `noindex`, `Cache-Control: no-store`, no draft in sitemap.
  - Per-locale schedule only if implemented without a new always-on worker; fa and en MUST schedule independently.
  - Unpublish/archive removes the row from `public()` and from the next static build.
  - Rebuild remains the existing signed trigger + manual fallback (`P3-08`); this spec does not invent a second deploy path.
  - Latin slugs for both locales; the admin must not assume Persian-script slugs for fa content.
- Non-goals:
  - Requiring both locales’ SEO before publish (Sample A anti-pattern)
  - Feature flags that do not actually gate publish
  - Comments, view counts, Telegram

### Layout / composition

- In scope (Page Composition V1):
  - A **closed** block registry for composed landing/profile regions only: hero, rich-text, media, CTA, collection-of-published-items, skills, downloads.
  - Each block: version, JSON/schema, defaults, allowed parent pages, a11y/RTL notes, no-JS public render in Astro.
  - Featured slots (`slot_key`, exactly one published target: article or project or publication).
  - CMS-managed nav/footer labels as data snapshotted at **build time** into Astro — never a public JS client of `/site`.
- Non-goals:
  - Arbitrary page builder, Composer/Canvas, dnd plugin SDK, unrestricted HTML/CSS
  - Two parallel builders (Sample B debt)
  - Theme presets, layout-density CMS, drag-and-drop as the public site engine

### Content management

- In scope:
  - Locale completeness on list views (fa/en status badges; missing/incomplete/complete/outdated).
  - Translation queue report: filter `MISSING`, `INCOMPLETE`, `COMPLETE`, `OUTDATED`; checklist title, slug, body, SEO.
  - Content-health report: missing alt, orphan media, failed schedule, unpublished-but-linked.
  - Media usage index + archive warning (extends `DEFER-0014` when media is public).
  - Contact inbox `new/read/archived` **only after** a contact Task Spec and `RISK-0003` — design the model here, do not expose the public form in this spec.
  - Bilingual admin chrome with a language toggle that follows real alternate links/records, never string replacement.
  - Seed/demo content stays draft; no demo seeder on production.
- Non-goals:
  - RBAC beyond owner + optional Editor/Publisher groups until a role ADR exists
  - Jazzmin/Unfold/Django-admin as a second skin if Wagtail already covers the job

## Allowed / forbidden files

- Allowed: `apps/cms/apps/content/**`, `apps/cms/apps/media/**`, `apps/cms/apps/security/**` (preview headers only), `apps/cms/apps/rebuild/**` (no new public routes), `apps/cms/apps/admin/**`, `apps/cms/tests/**`, `docs/status/**`, `Task-list.md`, this spec.
- Forbidden: new `apps/web` admin SPA, `infra/` Compose adding Redis/Celery, public `/api/` Caddy proxy, Gateway/`index.astro`.

## Contracts and data

- Documents read: master plan P3/P7, `Task-list.md` P7-01–P7-04, ADR-0014, ADR-0020–0024, `docs/plan/SAMPLES-TRANSFER-RECOMMENDATIONS.md` (`SAMP-ADD-08`–`11`, skip list for Composer), `apps/web/src/data/profile.ts`, `apps/web/src/data/profile.en.ts`, `apps/web/src/data/profile.fa.ts`.
- Contracts changed: editorial UX and reports; public DTO shape unchanged except when a featured/nav snapshot is added at build time in a later web slice.
- Locale: completeness reports MUST NOT auto-copy the other locale. About/CV seed content comes from `profile.ts`, `profile.en.ts` and `profile.fa.ts`, not `content.ts`.
- Security: admin remains noindex; reports must not render message bodies of contact submissions in logs; preview tokens must not be guessable if introduced; JWT and `localStorage` auth remain forbidden.

## Verification and release

- Tests: permission matrix, draft exclusion, locale independence of publish, preview noindex header, content-health does not list drafts as public, featured slot exactly-one-target constraint, block registry rejects unknown types.
- Manual QA: owner publishes one fa-only article; en listing unchanged; preview not in sitemap; archive removes public URL on next build.
- Acceptance: owner can manage P4–P6 entities without SSH/SQL; no second admin; composition cannot inject raw HTML outside the allowlist.
- Rollback: disable new Wagtail hooks; previous CMS image tag.

## Mapping from Samples (transfer, do not port)

| Sample job | Our surface |
|---|---|
| Locale tabs + missing badges | Wagtail/admin listing columns + same-origin detail chrome |
| Translation queue | Admin report view |
| Content-health | Admin report view |
| Featured home slots | Snippet + build-time Astro include |
| Page composer / Canvas | **Not copied.** Closed block registry only |
| Contact inbox | After contact Task Spec |
| JWT SPA admin | **Not copied.** Same-origin session/CSRF admin + TOTP stays |

## Handoff

- Depends on P4–P6 models existing in *this* checkout (reconcile `LOG-0131` production migrations first if the tree still has the P3 Article shell).
- If the focused detail-page UX is needed before the full P7 umbrella slice, execute `docs/plan/P7-admin-detail-pages-task-spec.md` first.
- Public nav-from-CMS is a follow-on Astro slice after this admin data exists.
- Documentation to update: `WORK_LOG.md`, `BACKLOG.md`, `Task-list.md` P7 checkboxes, editor runbook if created.
