# Backlog

> Task queue (owner/phase queue) sorted by priority. Rows come from `Task-list.md`, Risk Register and Deferred Validation; this file is a browsable snapshot, not the source of truth. Newest at top.

| ID | Phase | Item | Blocked by / prerequisite | Owner | Evidence |
|---|---|---|---|---|---|
| QA-playwright | QA | Playwright config کامل (retries/trace/video/html reporter) به‌جای spec های خام (الگوی نمونه‌ها S2) | — | Project owner | custom-admin-rebuild-fa.md §14.2 |
| P4-reading | P4 | Reading time real + TOC + JSON-LD additions as needed (F1/F6/F2 — partially DONE on main) | P4 follow-up | Project owner | custom-admin-rebuild-fa.md §14.1 |
| P6-gallery | P6 | گالری lightbox پروژه‌ها (F7) + فیلترهای URL-driven (F3) | P6 start | Project owner | custom-admin-rebuild-fa.md §14.1 |
| ADM-5-featured | ADM | Featured spotlight با پنجره‌ی زمانی (F4) + CV «یک سند جاری» از ادمین (F5) | ADM-5 | Project owner | custom-admin-rebuild-fa.md §14.1 |
| QA-vitest | QA | Vitest + تست‌های colocated برای کامپوننت‌های وب (S3) + Lighthouse budget (S5) | — | Project owner | custom-admin-rebuild-fa.md §14.2 |
| ADM-0 | ADM | Wagtail removal prep + Django-level admin auth (ADR-0026) | base = origin/main; dumpdata + backup before changes | Project owner | ADR-0026; Task-list §17; custom-admin-rebuild-fa.md |
| ADM-1 | ADM | Custom admin foundation: Ninja admin auth + CRUD + React SPA shell (dashboard/list/form, RTL) + migrate Wagtail-session admins + cutover | ADM-0 — **auth + SPA shell DONE (LOG-0156); content read API + preview route DONE (LOG-0157); CRUD write/update + cutover باقی** | Project owner | Task-list §17 |
| ADM-2 | ADM | Media: MediaPicker واحد، alt دو زبانه، orphan/usage/replace (closes DEFER-0014) | ADM-1 | Project owner | Task-list §17 |
| ADM-3 | ADM | Page composition Section/Block + layout presets (1/2/3 columns, ratios) + preview | ADM-1 | Project owner | Task-list §17 |
| ADM-4 | ADM | Workflow transitions + revisions + scheduled publish + translation queue + content health | ADM-2/ADM-3 | Project owner | Task-list §17 |
| ADM-5 | ADM | Site settings (nav/header/footer/tokens/SEO) + tags/filters + contact inbox | ADM-4 | Project owner | Task-list §17 |
| ADM-6 | ADM | Astro build-time wiring + rebuild trigger + E2E lifecycle/published-only + QA | ADM-4/ADM-5 | Project owner | Task-list §17 |
| P4+P5 CMS prod | P4–P5 | Publish CMS content + `rebuild-static.sh` (loopback `CMS_API_BASE`) | RISK-0003 CLOSED; migrate 0002–0004 already on `b369885` | Project owner | LOG-0131, LOG-0140 |
| P3 versioned CI/CD | P3 | GHCR sha-tagged CMS image + proxy/health fixes + update-cms.sh | merge branch; VPS pull + Caddy snippet + smoke-cms.sh | Project owner | P3-cms-versioned-cicd-task-spec.md, LOG-0120 |
| P3-07 preview | P3 | Staff draft preview + noindex/no-store | DONE in repo — optional CMS rebuild | Project owner | LOG-0132 |
| RISK-0003 | P0-A | CMS-aware backup + isolated restore | DONE — CLOSED 2026-08-17 | Project owner | LOG-0140 |
| DEFER-0015 | P3 | TOTP recovery codes + disable/re-enroll | DONE in repo — owner CMS rebuild to use on production | Project owner | LOG-0131 |
| DEFER-0016 | P3-07 | Public preview share-token | Deferred — staff session is access boundary | Project owner | deferred-validation.md |
| P3 deploy | P3 | CMS runtime hygiene (password + TOTP) | DONE — RISK-0009 CLOSED 2026-08-16 | Project owner | LOG-0129 |
| Old-stack decommission | ops | Shutdown of pre-existing compose stack (`taha-prod-frontend`/`backend`/`postgres` at `/opt/taha/repository`) — AUTHORIZED 2026-08-16; execution is owner-sudo | owner-sudo execution + runbook | Project owner | infra/deploy/decommission-old-stack.md |
| B2 | P0-B | Canonical SSH port decision | owner | Project owner | S-PLAN-STATE B2 |
| RISK-0005 | P0-A | Patch posture — 57 pending updates (owner pasted `apt list --upgradable`) | owner maintenance-window decision | Project owner | RISK-0005 OPEN; B1 inventory DONE 2026-08-16 |
| RISK-0006 | P0-A | SSH attack surface — UFW allows ports 22+2222 | owner canonical port decision | Project owner | RISK-0006 OPEN |
| DEFER-0009 | P1 | OG image + social preview | owner provides a real image (Gemini contact sheets not production-ready) | Project owner | deferred-validation.md; owner decision 2026-08-16 |
| DEFER-0013 | P1/P2 | Real 200% zoom visual evidence + full mobile visual matrix | manual owner verification on real browser | Project owner | deferred-validation.md; CI suites cover synthetic viewports |
| P3-05 rest | P3 | Media rendition contract + archive/inactive race tests | after deploy runtime | Project owner | ADR-0021 |
| P3-09 | P3 | P3 high-risk verification (migrations forward/fallback, backup/import, permissions, XSS, upload, projection) | deploy runtime | Project owner | Task-list §8 |
| DEFER-0014 | P3-05 | Media alt-by-locale | media runtime phase | Project owner | deferred-validation.md; Task-list P3-05 note |
| DEFER-0017 | P4–P6 | Public Caddy `/api/` (blog + research + projects) | DONE — CLOSED 2026-08-17 | Project owner | deferred-validation.md; LOG-0143 |
| DEFER-0018 | P4 | RSS/Atom blog feed | Deferred — SEO/sitemap/JSON-LD shipped without feed | Project owner | deferred-validation.md |
| DEFER-0019 | P5 | Research Statement PDF | Deferred — rich text only; no `/media/` PDF | Project owner | deferred-validation.md |
| DEFER-0020 | P5 | Curated collections / complex research graph | Deferred — list/tree only in P5 | Project owner | deferred-validation.md |
| DEFER-0021 | P6 | Live demo embed / iframe | Deferred — external links only in P6 | Project owner | deferred-validation.md |
| P4 | P4 | Blog/Writing (Article/Series, list/detail, feed) | DONE in repo (PR #14/#15); prod migrate blocked on RISK-0003; feed DEFER-0018; public `/api/` DEFER-0017 | Project owner | Task-list §9, LOG-0133, LOG-0134 |
| P5 | P5 | Research (Topic/Statement/Project/Publication minimal) | DONE in repo (code-first); prod migrate blocked on RISK-0003; DEFER-0017/0019/0020 | Project owner | P5-research-task-spec.md, Task-list §10, LOG-0136 |
| P6 | P6 | Projects + case studies | DONE in repo (code-first); prod migrate blocked on RISK-0003; DEFER-0017/0021 | P5 on main | P6-case-studies-task-spec.md, Task-list §11, LOG-0137 |
| P7 | P7 | Professional admin — **superseded by ADM (§17, ADR-0026)** | — | Project owner | Task-list §12 note |
| P8 | P8 | Publications/Books/Downloads/Talks | P6/P7 | Project owner | Task-list §13 |
| P9 | P9 | Teaching + Creative | P8 | Project owner | Task-list §14 |
| P10 | P10 | Topics + Pagefind search + collections | P4-P9 content | Project owner | Task-list §15 |
| P11 | P11 | AI/semantic/knowledge graph | P10 | Project owner | Task-list §16 |
| D15 | P3 verification | Docker Compose candidates verified locally (health checks, resources, env passthrough correct) | S-model | infra/cms/*, LOG-0117 |
| D16 | P4 prep | P4 Blog/Writing task spec written (199 lines) | S-model | docs/plan/P4-blog-writing-task-spec.md, LOG-0117 |
