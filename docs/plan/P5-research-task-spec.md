# Task Specification — P5 Research

## Task: P5 — Research (Topic / Statement / Project / Publication)

- Goal: ship code-first Research domain — ResearchTopic, ResearchStatement, canonical Project, minimal Publication — with Wagtail snippet admin, in-process Ninja public projection, and Astro `/{locale}/research/*` routes using optional `CMS_API_BASE` (honest empty lists when unset). No public Caddy `/api/` or `/media/`.
- User/actor and journey: CMS editors manage research entities in Wagtail. Public visitors browse overview, topics, statement, projects, and publications with Topic→Project→Publication relationships as accessible lists/trees. Contact remains an honest link to About/contact status (no new form).
- Release type: `STANDARD`
- Risk level: Medium (new models + projection/redact rules; confidentiality mistake requires immediate unpublish path)
- Owner and handoff recipient: Project owner (gate) → agent implements → CI → owner review; prod migrate blocked on RISK-0003.
- Status: `PARTIAL` (code-first complete; prod migrate + content smoke owner / RISK-0003)

## Prerequisites

| # | Prerequisite | Evidence required | Status |
|---|---|---|---|
| P1 | P3 CMS runtime | RISK-0009 CLOSED; `/admin/` + MFA | Required |
| P2 | P4 Blog code-first on main | PR #14/#15/#16; Article/Series API pattern | Done on `origin/main` |
| P3 | Mixins + `public()` | `LifecycleMixin`, `LocalizedContentMixin`, `ContentQuerySet.public()` | In place |

## Scope

- In scope:
  - Models: `ResearchTopic`, `ResearchStatement`, canonical `Project` (no parallel `ResearchProject`), minimal `Publication`, plus collaborator/funding/evidence rows with `publication_approved` / visibility gates.
  - Availability enums for code/data/demo: `public | available_on_request | private | not_available | not_applicable` (+ `restricted` for data).
  - Wagtail `SnippetViewSet` admin for each entity (no Page subclasses).
  - Ninja list/detail (paginated where appropriate), locale filter, draft exclusion, redact of non-public evidence/collaborators/funding/citation.
  - Astro routes: `/{locale}/research/`, `.../topics/{slug}/`, `.../statement/`, `.../projects/{slug}/`, `.../publications/{slug}/`.
  - SEO: sitemap entries; BreadcrumbList; ScholarlyArticle JSON-LD only when identifier is real; no fabricated citations.
  - Tests: uniqueness, `public()`, redact, draft 404, availability/license explicit, XSS allowlist body.
  - Confidentiality incident path documented (unpublish + revoke + incident log) — VPS execution is owner-only.
- Non-goals:
  - Opening Caddy `/api/` or `/media/` (keep **DEFER-0017**, scope includes research).
  - Research Statement PDF / tailored PDF (**DEFER-0019**).
  - Curated collections / complex graph/D3 (**DEFER-0020**).
  - Parallel case-study model (P6), Book/Talk/Download full (P8).
  - Contact form/persistence (DEFER-0007 already closed as omit).
  - Changing About static `researchProjects` (leave untouched).
  - Clinical validation claims; private repo exposure; inventing metrics.
- Allowed files: `apps/cms/apps/content/**`, `apps/cms/apps/api/**`, `apps/cms/tests/**`, `apps/web/src/{lib/cms,pages/*/research,components/research,data,components/Header.astro,pages/sitemap.xml.ts}/**`, `docs/plan/P5-research-task-spec.md`, `docs/status/**`, `docs/plan/S-PLAN-STATE.md`, `docs/governance/INCIDENT_RUNBOOK.md` (P5 confidentiality note), `Task-list.md`, `AGENTS.md`, `PROJECT_MANIFEST.md` (gate note only), `docs/status/CHANGELOG.md`.
- Forbidden files: `infra/**`, `.github/workflows/**`, secret files, About profile static research content rewrite, inventing DTO fields beyond this Spec.

## Contracts and data

- Documents read: Task-list §10, master plan P5, P4 Spec/API/Astro patterns, ADR-0022 rich text, this Spec.
- Contracts changed: new CMS tables; Ninja research endpoints; Astro research routes + copy; sitemap/JSON-LD; DEFER-0017 scope note; new DEFER-0019/0020.
- Migration/data impact: additive migration `0003_p5_research_*`; no destructive prod migrate until RISK-0003 evidence.
- Locale/visibility: fa/en independent; public projection = `status=published` + `published_at <= now` via `public()`; restricted/internal never in DTO.
- Security/privacy: rich text allowlist; redact collaborators/funding unless `publication_approved`; citation_count only with `source` + `last_verified` + public visibility; evidence without source or non-public visibility omitted.

### Field contracts (frozen)

#### ResearchTopic

| Field | Type | Notes |
|---|---|---|
| locale, slug, title | mixin | unique (locale, slug) |
| summary, motivation, problems, research_questions, methods, future_directions | TextField | plain text for P5 |
| status, published_at, timestamps | LifecycleMixin | |

#### ResearchStatement

| Field | Type | Notes |
|---|---|---|
| locale, slug, title | mixin | P5: at most one published per locale (enforced in validation/tests) |
| body | RichTextField | `ARTICLE_RICHTEXT_FEATURES` allowlist |
| status, published_at, timestamps | LifecycleMixin | |
| PDF | — | **DEFER-0019** |

#### Project (canonical)

| Field | Type | Notes |
|---|---|---|
| locale, slug, title | mixin | unique (locale, slug) |
| project_type | CharField | research \| engineering \| ai \| data \| design \| experiment |
| objective, methods_summary, role | TextField | |
| start_date, end_date | DateField | nullable |
| license | License choices (reuse P4) | required explicit |
| code_availability, data_availability, demo_availability | Availability | data may be `restricted` |
| code_url, data_url, demo_url | URLField | blank; public DTO only when matching availability=`public` |
| topics | M2M ResearchTopic | |
| publications | M2M Publication | |
| status, published_at, timestamps | LifecycleMixin | |

#### ProjectEvidence (structured outcomes/evidence)

| Field | Type | Notes |
|---|---|---|
| project | FK | |
| label, value | CharField/TextField | |
| source | TextField | required for public projection |
| last_verified | DateField | nullable |
| visibility | public \| restricted \| internal | only `public` + non-empty source in DTO |

#### ProjectCollaborator / ProjectFunding

| Field | Type | Notes |
|---|---|---|
| project | FK | |
| name / funder (+ optional role/grant_id) | CharField | |
| publication_approved | Boolean | public DTO only if True |

#### Publication (minimal core)

| Field | Type | Notes |
|---|---|---|
| locale, slug, title | mixin | |
| authors | TextField | |
| venue | CharField | blank ok |
| date | DateField | nullable |
| doi | CharField | nullable identifier text |
| url, pdf_url | URLField | optional; pdf_url not served via `/media/` |
| license | License | |
| citation_count | PositiveIntegerField | null; public only if source + last_verified + visibility public |
| citation_source, citation_last_verified, citation_visibility | | gate for citation_count |
| status, published_at, timestamps | LifecycleMixin | |

### Ninja endpoints (in-process / optional CMS_API_BASE)

| Method | Path | Notes |
|---|---|---|
| GET | `/api/research/topics/{locale}` | paginated list |
| GET | `/api/research/topics/{locale}/{slug}` | detail + related public project/publication slugs |
| GET | `/api/research/statements/{locale}` | list (0–1 published typical) |
| GET | `/api/research/statements/{locale}/{slug}` | detail; sanitized body |
| GET | `/api/research/projects/{locale}` | paginated list |
| GET | `/api/research/projects/{locale}/{slug}` | detail + redact |
| GET | `/api/research/publications/{locale}` | paginated list |
| GET | `/api/research/publications/{locale}/{slug}` | detail + citation gate |

Forbidden response fields include: `status`, `created_at`, internal visibility rows, unapproved collaborators/funding, citation without source/verification, URLs when availability ≠ public.

### Astro routes

| Route | Behavior |
|---|---|
| `/{locale}/research/` | Overview: topics, statement link, projects, publications; empty-honest |
| `/{locale}/research/topics/{slug}/` | Topic detail + related projects/publications list |
| `/{locale}/research/statement/` | Published statement for locale (or empty/honest) |
| `/{locale}/research/projects/{slug}/` | Project detail |
| `/{locale}/research/publications/{slug}/` | Publication detail |

Nav: Research link only when routes exist in build (they will). About `researchProjects` static data unchanged.

## Admin

- SnippetViewSets for ResearchTopic, ResearchStatement, Project, Publication (+ nested/inlines for evidence, collaborators, funding where practical).
- No Wagtail Page subclasses.

## SEO

- BreadcrumbList on research pages.
- ScholarlyArticle JSON-LD only when `doi` or absolute `url` present; never invent identifiers.
- Sitemap: research overview + published topic/project/publication/statement URLs when CMS_API_BASE yields data; always include overview routes.

## Verification and release

- Tests/commands:
  - `uv run ruff check` (cms)
  - `uv run pytest` (full cms suite)
  - `npm run check` + `npm run build` (web)
- Acceptance:
  - Draft/restricted never leak via API or Astro.
  - Availability/license explicit on public projects.
  - Statement independent route.
  - Topic→Project→Publication navigable as lists.
  - No infra/Caddy change; DEFER-0017 remains OPEN (scope: blog + research).
- Rollback: revert P5 commits; reverse migration only in non-prod.
- Documentation: WORK_LOG, CHANGELOG, BACKLOG, deferred-validation, S-PLAN-STATE, Task-list §10, AGENTS gate note, INCIDENT_RUNBOOK confidentiality path.

## Deferred items

| ID | Item | Why | Target |
|---|---|---|---|
| DEFER-0017 | Public Caddy `/api/` (+ `/media/`) | Edge needs separate Spec; expand scope to research | publish-API Task Spec |
| DEFER-0019 | Research Statement PDF / tailored PDF | No `/media/` delivery; PDF out of P5 | later + owner media Spec |
| DEFER-0020 | Curated collections / complex research graph viz | Out of P5 scope | post-P5 / P10 |

## Confidentiality incident path (P5-04)

If restricted/confidential research content is published by mistake:

1. Unpublish the entity in Wagtail (`status` ≠ published) immediately.
2. Revoke any mistakenly public asset URLs (owner; `/media/` still unpublished in P5).
3. Append an incident note per `docs/governance/INCIDENT_RUNBOOK.md` (SEV-2/3 as appropriate).
4. Do not leave the mistake only in chat — update RISK/deferred ledgers if needed.

VPS execution and production migrate remain owner-only.

## Handoff

- Files changed: per Allowed files.
- Verification: recorded in WORK_LOG after implementation.
- Deferred/risk IDs: DEFER-0017, DEFER-0019, DEFER-0020; RISK-0003 (owner).
- Blockers / next input: owner RISK-0003 evidence before prod migrate; owner approval of real research content; optional publish-API Spec to open edge `/api/`.
