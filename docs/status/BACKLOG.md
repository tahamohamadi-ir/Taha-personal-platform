# Backlog

> Task queue (owner/phase queue) sorted by priority. Rows come from `Task-list.md`, Risk Register and Deferred Validation; this file is a browsable snapshot, not the source of truth. Newest at top.

| ID | Phase | Item | Blocked by / prerequisite | Owner | Evidence |
|---|---|---|---|---|---|
| OWNER_CUTOVER | OPS | **Required gates CLOSED** + Waves 1�5 prod cutover **PASS** (LOG-0216): CMS `116c241` migrate `0013`/`0014`; `cd-rebuild-web` PASS; old-stack empty. Prior: migrate [32554382271](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554382271); rebuild [32555455704](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32555455704); timer LOG-0201; HMAC/Caddy CLOSED | Keep `CMS_CD_AUTO_MIGRATE` unset | Project owner | LOG-0216; LOG-0201; LOG-0199; LOG-0196 |
| ADR-0027 | OPS | Slices 1�4 live (Compose Caddy edge CLOSED LOG-0210); attended migrate path CLOSED | Keep `CMS_CD_AUTO_MIGRATE` unset | Project owner | LOG-0210; LOG-0216; LOG-0179 |
| QA-playwright | QA | Playwright lifecycle CLOSED (`DEFER-0026`); matrix ? `DEFER-0032` **PARTIAL** (Wave 5 LOG-0215) | Manual S6 checklist remainder | Project owner | LOG-0215; adm-qa-s6.md |
| Old-stack decommission | ops | **CLOSED** 2026-08-23 � no `taha-prod-*` containers; only `taha-cms` running(4); public 200 (LOG-0216). Runbook notes `sudo env` QA placeholders (`sudo -E` ignored) | � | Project owner | [decommission-old-stack.md](../../infra/deploy/decommission-old-stack.md); LOG-0216 |
| ADM-0 | ADM | Wagtail uninstall **CLOSED** (`DEBT-0003` / PR #69); SPA `/admin/` + Django `/staff/` | Owner cutover required gates **CLOSED** (LOG-0201); optional HMAC/Caddy remain | Project owner | LOG-0193; LOG-0201; Task-list �17 |
| ADM-1 | ADM | Custom admin foundation + cutover | DONE (LOG-0156..0158, LOG-0163); `DEFER-0023` CLOSED | Project owner | Task-list �17 |
| ADM-2 | ADM | Media library + alt-by-locale | DONE (LOG-0159); `DEFER-0014` CLOSED | Project owner | Task-list �17 |
| ADM-6 | ADM | Astro wiring + rebuild trigger + E2E JSON | PARTIAL � production rebuild PASS (LOG-0216); HMAC CLOSED; QA `DEFER-0032` PARTIAL | Project owner | Task-list �17; LOG-0215; LOG-0216 |
| P4-reading | P4 | Reading time real + TOC + JSON-LD additions as needed (F1/F6/F2 � partially DONE on main) | P4 follow-up | Project owner | custom-admin-rebuild-fa.md �14.1 |
| P6-gallery | P6 | Lightbox (F7) + URL filters (F3) � **DONE in Waves 1�2** (LOG-0211/0212); live after LOG-0216 rebuild | � | Project owner | LOG-0211; LOG-0212; LOG-0216 |
| ADM-5-featured | ADM | Featured spotlight ?? ??????? ????? (F4) + CV �?? ??? ????� ?? ????? (F5) | F4 DONE (LOG-0162); F5 DONE (LOG-0185) | Project owner | custom-admin-rebuild-fa.md �14.1 |
| QA-vitest | QA | Vitest + ??????? colocated ???? ???????????? ?? (S3) + Lighthouse budget (S5) | � | Project owner | custom-admin-rebuild-fa.md �14.2 |
| ADM-3 | ADM | Page composition Section/Block + layout presets (1/2/3 columns, ratios) + preview | ADM-1 � **DONE (LOG-0160)** | Project owner | Task-list �17 |
| ADM-4 | ADM | Workflow transitions + translation queue + content health | ADM-2/ADM-3 � **DONE (LOG-0161 + LOG-0181)** | Project owner | Task-list �17 |
| ADM-5 | ADM | Site settings + tags/filters + contact inbox | ADM-4 � **DONE (LOG-0162)**; contact ? DEBT-0006 | Project owner | Task-list �17 |
| P4+P5 CMS prod | P4�P5 | Publish CMS content + rebuild (Compose web) | RISK-0003 CLOSED; schema through `0014` live (LOG-0216) | Project owner | LOG-0216; LOG-0131 |
| P3 versioned CI/CD | P3 | GHCR sha-tagged CMS image + proxy/health fixes + update-cms.sh | DONE � live pin `116c241` (LOG-0216) | Project owner | LOG-0216; LOG-0120 |
| P3-07 preview | P3 | Staff draft preview + noindex/no-store | DONE in repo � optional CMS rebuild | Project owner | LOG-0132 |
| RISK-0003 | P0-A | CMS-aware backup + isolated restore | DONE � CLOSED 2026-08-17 | Project owner | LOG-0140 |
| DEFER-0015 | P3 | TOTP recovery codes + disable/re-enroll | DONE in repo � owner CMS rebuild to use on production | Project owner | LOG-0131 |
| DEFER-0016 | P3-07 | Public preview share-token | Closed 2026-08-22 � HMAC share URL | Project owner | deferred-validation.md |
| P3 deploy | P3 | CMS runtime hygiene (password + TOTP) | DONE � RISK-0009 CLOSED 2026-08-16 | Project owner | LOG-0129 |
| B2 | P0-B | Canonical SSH port decision | owner | Project owner | S-PLAN-STATE B2 |
| RISK-0005 | P0-A | Patch posture — 57 pending updates (owner pasted `apt list --upgradable`) | owner maintenance-window decision | Project owner | RISK-0005 OPEN; B1 inventory DONE 2026-08-16 |
| RISK-0006 | P0-A | SSH attack surface — UFW allows ports 22+2222 | owner canonical port decision | Project owner | RISK-0006 OPEN |
| DEFER-0009 | P1 | OG image + social preview | **CLOSED** Wave 1 typographic default (LOG-0211); optional photography still owner | Project owner | deferred-validation.md; LOG-0211 |
| DEFER-0013 | P1/P2 | Real 200% zoom visual evidence + full mobile visual matrix | manual owner verification on real browser | Project owner | deferred-validation.md; CI suites cover synthetic viewports |
| P3-05 rest | P3 | Media rendition contract + archive/inactive race tests | after deploy runtime | Project owner | ADR-0021 |
| P3-09 | P3 | P3 high-risk verification (migrations forward/fallback, backup/import, permissions, XSS, upload, projection) | deploy runtime | Project owner | Task-list §8 |
| DEFER-0014 | P3-05 | Media alt-by-locale | **CLOSED** | Project owner | deferred-validation.md; Task-list ADM-2 |
| DEFER-0017 | P4–P6 | Public Caddy `/api/` (blog + research + projects) | DONE — CLOSED 2026-08-17 | Project owner | deferred-validation.md; LOG-0143 |
| DEFER-0018 | P4 | RSS/Atom writing feed | **CLOSED** Wave 1 (LOG-0211) | Project owner | deferred-validation.md |
| DEFER-0019 | P5 | Research Statement PDF | **CLOSED** repo + prod schema `0013` (LOG-0216); optional Media PDF upload remains editorial | Project owner | deferred-validation.md; LOG-0216 |
| DEFER-0020 | P5 | Curated collections (graph viz partial via ADR-0028 / LOG-0214) | Collections still deferred � interactive relationship map shipped + live | Project owner | deferred-validation.md |
| DEFER-0021 | P6 | Live demo embed / iframe | PARTIAL � CSP Report-Only + click-to-load; owner allowlist + enforce open | Project owner | deferred-validation.md |
| P4 | P4 | Blog/Writing (Article/Series, list/detail, feed) | DONE live (writing-canonical + RSS); feed DEFER-0018 CLOSED | Project owner | Task-list §9; LOG-0211; LOG-0216 |
| P5 | P5 | Research | DONE live; statement PDF schema live; collections DEFER-0020 | Project owner | LOG-0212; LOG-0214; LOG-0216 |
| P6 | P6 | Projects + case studies | DONE live; lightbox + URL filters live; DEFER-0021 PARTIAL | Project owner | LOG-0211; LOG-0212; LOG-0216 |
| P7 | P7 | Professional admin — **superseded by ADM (§17, ADR-0026)** | — | Project owner | Task-list §12 note |
| P8 | P8 | Publications/Books/Downloads/Talks | **DONE live** � migrate `0014` + rebuild (LOG-0216); catalogs empty-honest until content | Project owner | Task-list §13; LOG-0213; LOG-0216 |
| P9 | P9 | Teaching + Creative | P8 | Project owner | Task-list §14 |
| P10 | P10 | Topics + Pagefind search + collections | Pagefind early **live** (LOG-0215/0216); collections still open | Project owner | Task-list §15 |
| P11 | P11 | AI/semantic/knowledge graph | P10 | Project owner | Task-list §16 |
| D15 | P3 verification | Docker Compose candidates verified locally (health checks, resources, env passthrough correct) | S-model | infra/cms/*, LOG-0117 |
| D16 | P4 prep | P4 Blog/Writing task spec written (199 lines) | S-model | docs/plan/P4-blog-writing-task-spec.md, LOG-0117 |
