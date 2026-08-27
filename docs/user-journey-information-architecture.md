# User Journey & Information Architecture — HISTORY

> **Status (2026-08-26): HISTORY — superseded by Assets/site-redesign/implementation-reference/MASTER-SPEC.md §3 Users and primary journeys and IA contracts. Binding routes remain docs/contracts/IA-CONTRACT.md until ATLAS-05/07. Do not build new routes from this file.**

This file is **not binding**. It is the historical UX/IA baseline (~3888 lines, 169 sections) retained for reference only. Binding next-gen journeys are in `MASTER-SPEC.md` §3; binding live routes are in `docs/contracts/IA-CONTRACT.md`.

## What this file used to define (historical summary)

Principles: **One Identity, Multiple Audience Paths** + **Evidence over Claims**. Three homepage audience routes: `Research` / `Engineering & AI` / `Writing & Learning` (mapping: Professor/PI/Lab → Research; Engineering Manager/R&D/Recruiter → Engineering & AI; Student/Reader → Writing & Learning). Persona priority P0 Critical (Professor/PhD supervisor, Engineering Manager, Recruiter, Collaborator), P1 Important (Admission Committee, Student, etc.), P2 Contextual. Defined entry-point principle (every important page can be entry), sitemap, primary/secondary nav, URL architecture, breadcrumbs, related-content/topic/search, homepage/mobile/footer/CTA, governance, and usability targets. Freeze decisions included `/` as Language Gateway, `/fa/` + `/en/` locale roots, and `Research | Work | Projects | Writing | About | More` nav.

## Superseded by: 6 primary journeys in MASTER-SPEC §3

| # | New journey (MASTER-SPEC §3) | One-line path |
|---|---|---|
| 1 | Potential PhD supervisor | language → identity/research fit → directions → publications/projects → CV/contact |
| 2 | Academic reviewer | research → publication/evidence detail → methods, limitations, files, related outputs |
| 3 | Industry reviewer | identity → selected sanitized work → contribution/systems experience → CV/contact |
| 4 | Reader | Writing index → independent long-form post → series/archive |
| 5 | Learner | Learning index → guide/path detail → resources/references |
| 6 | Creative viewer | Gallery → visual-work detail → ordered media, process, credits, licence |

Old P0–P2 / three-route / prototype journeys are superseded by the six above. Trust/CTA/success criteria now live in journey acceptance criteria and `agent-kit/templates.json` template specs.

## Migration map — old IA → new canonical structure

Reference: `DOCUMENT-MIGRATION-MAP.md` (this file row) + `SOURCE-INVENTORY.md: Current runtime authorities`.

| Old top-level IA in this file (historical) | New canonical structure (`MASTER-SPEC.md` §4 + `agent-kit/templates.json` + `IA-CONTRACT.md`) |
|---|---|
| `Research` (research areas, topics) | **Research** — retained; **Publications** becomes child destination in navigation but URL stays `/{locale}/publications/{slug}/` |
| `Work` (professional identity / experience) | Folded into **About** + **Projects** + **Research** per `MASTER-SPEC.md` §4; no standalone `/work/` in ATLAS target |
| `Projects` (+ `{project}`) | **Projects** — retained `/{locale}/projects/` + `/{locale}/projects/{slug}/` |
| `Writing` (+ `{article}`, `series/{series}`, `tag/{slug}`) | **Blog** — label Blog, URL `/{locale}/writing/` + detail; `/blog/**` remains redirect-only |
| `Publications / Books / Talks / Downloads` (P8 catalogs — publications/books/talks/downloads) | **Live today** and retained: `/{locale}/publications/`, `/books/`, `/talks/`, `/downloads/` + detail; empty-honest until CMS content (`IA-CONTRACT.md` §4b) |
| `Teaching` (+ `{course}`) | **Learning** — label Learning, URL `/{locale}/teaching/` + detail (not live until ATLAS-07 adoption) |
| `Creative` (+ `{work}`) | **Gallery** — label Gallery, URL `/{locale}/creative/` + `/{locale}/creative/{slug}/` (not live until adoption) |
| `Topics` (`/topics/{topic}`) | Replaced by CMS-managed topic/taxonomy linked from collection/detail templates; no top-level `/topics/` in ATLAS target |
| `Now`, `Explore`, misc | Not in ATLAS target; omitted unless a task spec approves |

**Live vs target:** `IA-CONTRACT.md` §4 Live today lists binding live routes (gateway, locale homes, about/cv, writing/research/projects, P8 catalogs, search, 404). ATLAS target nav — About, Research, Projects, Gallery (`/{locale}/creative/`), Blog (`/{locale}/writing/`), Learning (`/{locale}/teaching/`) — becomes binding only when **ATLAS-05 shell/header** and **ATLAS-07 route/template adoption** packets are accepted and merged (`MULTI-AGENT-TASK-LIST.md` execution board). Do not remove or link to Gallery/Learning until adoption.

## How to use the new reference (read order)

1. `Assets/site-redesign/implementation-reference/README.md` → read order
2. `MASTER-SPEC.md` §3 (journeys) + §4 (canonical structure) + §5 (home composition)
3. `agent-kit/templates.json` (6 templates, 6 representative frames) + `components.json` (FilterBar, Pagination, Breadcrumbs, etc.)
4. `docs/contracts/IA-CONTRACT.md` — binding live routes, nav honesty, breadcrumb, search, homepage minimum (§4–9)
5. `Assets/site-redesign/implementation-reference/AGENT-COORDINATION.md` + `MULTI-AGENT-TASK-LIST.md` (ATLAS-07 route adoption per family) + `ACCEPTANCE-GATES.md` (G3 templates, G5 route adoption)

## Rebuild rule

New IA is applied via ATLAS packets, not by editing legacy sections. Every index/detail family migrates to shared templates (`collection-index`, `editorial-index`, `long-form-detail`, `evidence-visual-detail`) with locale-independent slugs, published-only projections, and no invented detail pages. Do not invent Gallery/Learning detail URLs before CMS/publish gates pass.

## Historical preservation

Full 3888-line content preserved in backup: `_archive/pre-redesign-backup_2026-08-26_08-37-10/docs/user-journey-information-architecture.md` and consolidated history in `Assets/site-redesign/implementation-reference/history/` (`SOURCE-INVENTORY.md`, `DOCUMENT-MIGRATION-MAP.md`). See `docs/README.md` §1 for history positioning.
