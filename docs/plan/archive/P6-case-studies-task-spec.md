# Task Specification — P6 Projects + Engineering Case Studies

## Task: P6 — Projects + Engineering Case Studies

- Goal: extend canonical `Project` with typed case-study details, diagram/screenshot rows, publish gate for featured depth, Ninja public projection, and Astro `/{locale}/projects/*` routes with optional `CMS_API_BASE` (honest empty lists when unset). No public Caddy `/api/` or `/media/`.
- User/actor and journey: CMS editors attach case-study depth, problem/decisions/trade-offs, diagrams (a11y metadata), and screenshots to existing projects. Public visitors browse engineering case studies at `/{locale}/projects/` and read full case-study detail; research-context view at `/{locale}/research/projects/{slug}/` remains with cross-link when extension exists.
- Release type: `STANDARD`
- Risk level: Medium (publish gate, diagram/screenshot redact, confidentiality on assets)
- Owner and handoff recipient: Project owner (gate) → agent implements → CI → owner review; prod migrate blocked on `RISK-0003`.
- Status: `PARTIAL` (code-first complete; prod migrate + content smoke owner / RISK-0003)

## Prerequisites

| # | Prerequisite | Evidence required | Status |
|---|---|---|---|
| P1 | P5 Research on main | canonical `Project`, research API/Astro pattern | Done (`59bf91e`) |
| P2 | Mixins + `public()` | `LifecycleMixin`, `ContentQuerySet.public()` | In place |
| P3 | P3 CMS runtime | `/admin/` + MFA | Required |

## Scope

- In scope:
  - `ProjectCaseStudyDetails` OneToOne → `Project`; `ProjectDiagram` / `ProjectScreenshot` FK → `Project`.
  - Featured publish gate: `depth=featured_case_study` + `status=published` requires `problem`, `role`, `trade_offs`, `outcomes_summary`, explicit availability states, `license`.
  - Wagtail snippet admin panels on canonical `Project` (+ diagram/screenshot choosers; PII/credentials help text).
  - Ninja: extend `ProjectListOut` / `ProjectDetailOut`; `/api/projects/{locale}` list with `has_case_study`; detail with redacted diagrams/screenshots.
  - Astro: `/{locale}/projects/`, `/{locale}/projects/{slug}/`; research project cross-link; header nav Projects link.
  - SEO: sitemap entries; BreadcrumbList; `CreativeWork` JSON-LD only when real fields exist.
  - Tests: OneToOne integrity, featured gate, diagram/screenshot redact, draft 404, forbidden fields.
  - Ledgers: DEFER-0017 scope note (projects/case studies); DEFER-0021 live demo embed; confidentiality reuse P5 runbook.
- Non-goals:
  - Opening Caddy `/api/` or `/media/` (**DEFER-0017** stays OPEN; scope expanded to projects).
  - Parallel `ResearchProject` or second Project model.
  - Live demo iframe/embed (**DEFER-0021**).
  - About static `researchProjects` rewrite.
  - Infra/Caddy changes.
- Allowed files: `apps/cms/apps/content/**`, `apps/cms/apps/api/**`, `apps/cms/tests/**`, `apps/web/src/{lib/cms,components/projects,pages/*/projects,data,components/Header.astro,pages/sitemap.xml.ts}/**`, `docs/plan/P6-case-studies-task-spec.md`, `docs/status/**`, `docs/plan/S-PLAN-STATE.md`, `Task-list.md`, `AGENTS.md`, `docs/governance/INCIDENT_RUNBOOK.md` (confidentiality note).
- Forbidden files: `infra/**`, `.github/workflows/**`, secret files, About profile static research content rewrite.

## Contracts and data

### ProjectCaseStudyDetails (OneToOne → Project)

| Field | Type | Notes |
|---|---|---|
| `depth` | choices | `featured_case_study` \| `standard` \| `experiment` |
| `problem` | TextField | required when featured + published |
| `constraints` | TextField | |
| `technical_decisions` | RichTextField | `ARTICLE_RICHTEXT_FEATURES` |
| `trade_offs` | TextField | required when featured + published |
| `outcomes_summary` | TextField | required when featured + published |
| `lessons_learned` | TextField | optional |
| `testing_summary` | TextField | optional |

Reuse from P5 on `Project`: `role`, availability URLs/states, `license`, `ProjectEvidence`.

### ProjectDiagram (FK → Project)

| Field | Notes |
|---|---|
| `title`, `version`, `diagram_date` | required for public projection |
| `alt_text`, `long_description` | a11y |
| `diagram_image` | FK nullable — admin only until `/media/` |
| `visibility` | `EvidenceVisibility`; public only with alt + metadata |

Public UI: alt + long_description + version/date; **no** public image URL.

### ProjectScreenshot (FK → Project)

| Field | Notes |
|---|---|
| `caption`, `alt_text`, `external_url` | public requires alt + caption |
| `screenshot_image` | FK nullable |
| `visibility` | redact like evidence |

### Ninja endpoints

| Method | Path | Notes |
|---|---|---|
| GET | `/api/projects/{locale}` | paginated; default `has_case_study=true` |
| GET | `/api/projects/{locale}/{slug}` | detail + case study + redacted media rows |
| GET | `/api/research/projects/{locale}/{slug}` | unchanged path; DTO gains `has_case_study` |

### Astro routes

| Route | Behavior |
|---|---|
| `/{locale}/projects/` | list projects with case study extension |
| `/{locale}/projects/{slug}/` | full case study detail |
| `/{locale}/research/projects/{slug}/` | P5 research view + cross-link to case study when `has_case_study` |

## Verification and release

- `uv run ruff check` + `uv run pytest` (cms)
- `npm run check` + `npm run build` (web)
- Independent security review before merge
- Rollback: revert P6 commits; reverse migration non-prod only
- Documentation: WORK_LOG, CHANGELOG, Task-list §11, AGENTS gate note

## Deferred items

| ID | Item | Why | Target |
|---|---|---|---|
| DEFER-0017 | Public Caddy `/api/` (+ `/media/`) | Edge needs separate Spec; scope includes blog + research + **projects/case studies** | publish-API Task Spec |
| DEFER-0021 | Live demo embed / iframe | Out of P6 scope | post-P6 Task Spec |

## Confidentiality incident path

Reuse P5 path (`docs/governance/INCIDENT_RUNBOOK.md`): unpublish project, revoke diagram/screenshot assets (owner), incident log. VPS execution owner-only.

## Handoff

- Prod migrate `0004_p6_case_study_*` owner-only after `RISK-0003`.
- Real case-study content + diagram/screenshot assets owner approval.
- Blockers: `RISK-0003`; optional publish-API Spec for edge `/api/`.
