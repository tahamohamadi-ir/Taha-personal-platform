# Backlog

> Task queue (owner/phase queue) sorted by priority. Rows come from `Task-list.md`, Risk Register and Deferred Validation; this file is a browsable snapshot, not the source of truth. Newest at top.

| ID | Phase | Item | Blocked by / prerequisite | Owner | Evidence |
|---|---|---|---|---|---|
| OWNER_CUTOVER | OPS | **Required gates CLOSED** â€” migrate [32554382271](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32554382271); rebuild-web [32555455704](https://github.com/tahamohamadi-ir/Taha-personal-platform/actions/runs/32555455704); scheduled-publish timer (owner attestation 2026-08-22, LOG-0201). Optional: HMAC (`DEFER-0027`) / Caddy edge (`DEFER-0031`) | Keep `CMS_CD_AUTO_MIGRATE` unset; owner interactive SPA MFA | Project owner | LOG-0201; LOG-0199; LOG-0196 |
| ADR-0027 | OPS | Slice 2 attended path **PASS** (`RISK-0012` CLOSED); Slice 4 Caddy cutover still owner (`DEFER-0031`) | Keep `CMS_CD_AUTO_MIGRATE` unset | Project owner | LOG-0179; LOG-0180; LOG-0191 |
| QA-playwright | QA | Playwright lifecycle CLOSED (`DEFER-0026`); remaining matrix â†’ `DEFER-0032` | â€” | Project owner | LOG-0184 |
| ADM-0 | ADM | Wagtail uninstall **CLOSED** (`DEBT-0003` / PR #69); SPA `/admin/` + Django `/staff/` | Owner cutover required gates **CLOSED** (LOG-0201); optional HMAC/Caddy remain | Project owner | LOG-0193; LOG-0201; Task-list Â§17 |
| ADM-1 | ADM | Custom admin foundation + cutover | DONE (LOG-0156..0158, LOG-0163); `DEFER-0023` CLOSED | Project owner | Task-list Â§17 |
| ADM-2 | ADM | Media library + alt-by-locale | DONE (LOG-0159); `DEFER-0014` CLOSED | Project owner | Task-list Â§17 |
| ADM-6 | ADM | Astro wiring + rebuild trigger + E2E JSON | PARTIAL â€” primaryColor/CV + entity stories repo CLOSED; featuredâ†’Media shipped; production rebuild-web PASS (LOG-0199); HMAC `DEFER-0027` OPEN (optional) | Project owner | Task-list Â§17; LOG-0185â€“0190; LOG-0201 |
| P4-reading | P4 | Reading time real + TOC + JSON-LD additions as needed (F1/F6/F2 â€” partially DONE on main) | P4 follow-up | Project owner | custom-admin-rebuild-fa.md Â§14.1 |
| P6-gallery | P6 | Ú¯Ø§Ù„Ø±ÛŒ lightbox Ù¾Ø±ÙˆÚ˜Ù‡â€ŒÙ‡Ø§ (F7) + ÙÛŒÙ„ØªØ±Ù‡Ø§ÛŒ URL-driven (F3) | P6 start | Project owner | custom-admin-rebuild-fa.md Â§14.1 |
| ADM-5-featured | ADM | Featured spotlight Ø¨Ø§ Ù¾Ù†Ø¬Ø±Ù‡â€ŒÛŒ Ø²Ù…Ø§Ù†ÛŒ (F4) + CV Â«ÛŒÚ© Ø³Ù†Ø¯ Ø¬Ø§Ø±ÛŒÂ» Ø§Ø² Ø§Ø¯Ù…ÛŒÙ† (F5) | F4 DONE (LOG-0162); F5 DONE (LOG-0185) | Project owner | custom-admin-rebuild-fa.md Â§14.1 |
| QA-vitest | QA | Vitest + ØªØ³Øªâ€ŒÙ‡Ø§ÛŒ colocated Ø¨Ø±Ø§ÛŒ Ú©Ø§Ù…Ù¾ÙˆÙ†Ù†Øªâ€ŒÙ‡Ø§ÛŒ ÙˆØ¨ (S3) + Lighthouse budget (S5) | â€” | Project owner | custom-admin-rebuild-fa.md Â§14.2 |
| ADM-3 | ADM | Page composition Section/Block + layout presets (1/2/3 columns, ratios) + preview | ADM-1 â€” **DONE (LOG-0160): composition API + editorØ› projection Ø¹Ù…ÙˆÙ…ÛŒ â†’ ADM-6** | Project owner | Task-list Â§17 |
| ADM-4 | ADM | Workflow transitions + translation queue + content health | ADM-2/ADM-3 â€” **DONE (LOG-0161 + LOG-0181): lifecycle + translation queue + content health + revisions/schedule (DEBT-0005 CLOSED)** | Project owner | Task-list Â§17 |
| ADM-5 | ADM | Site settings (nav/header/footer/tokens/SEO) + tags/filters + contact inbox | ADM-4 â€” **DONE (LOG-0162): site settings (`/api/v1/admin/site`) + ØªÚ¯â€ŒÙ‡Ø§ (TopicTag CRUD) + featured spotlight (Ø¨Ø§Ø²Ù‡â€ŒÛŒ Ø²Ù…Ø§Ù†ÛŒØŒ Ø¯Ù‚ÛŒÙ‚Ø§Ù‹ ÛŒÚ© Ø¢ÛŒØªÙ… ÙØ¹Ø§Ù„)Ø› contact inbox + CV â†’ DEBT-0006** | Project owner | Task-list Â§17 |
| P4+P5 CMS prod | P4â€“P5 | Publish CMS content + `rebuild-static.sh` (loopback `CMS_API_BASE`) | RISK-0003 CLOSED; migrate 0002â€“0004 already on `b369885` | Project owner | LOG-0131, LOG-0140 |
| P3 versioned CI/CD | P3 | GHCR sha-tagged CMS image + proxy/health fixes + update-cms.sh | merge branch; VPS pull + Caddy snippet + smoke-cms.sh | Project owner | P3-cms-versioned-cicd-task-spec.md, LOG-0120 |
| P3-07 preview | P3 | Staff draft preview + noindex/no-store | DONE in repo â€” optional CMS rebuild | Project owner | LOG-0132 |
| RISK-0003 | P0-A | CMS-aware backup + isolated restore | DONE â€” CLOSED 2026-08-17 | Project owner | LOG-0140 |
| DEFER-0015 | P3 | TOTP recovery codes + disable/re-enroll | DONE in repo â€” owner CMS rebuild to use on production | Project owner | LOG-0131 |
| DEFER-0016 | P3-07 | Public preview share-token | Closed 2026-08-22 â€” HMAC share URL | Project owner | deferred-validation.md |
| P3 deploy | P3 | CMS runtime hygiene (password + TOTP) | DONE â€” RISK-0009 CLOSED 2026-08-16 | Project owner | LOG-0129 |
| Old-stack decommission | ops | Shutdown of pre-existing compose stack (`taha-prod-frontend`/`backend`/`postgres` at `/opt/taha/repository`) â€” AUTHORIZED 2026-08-16; execution is owner-sudo | owner-sudo execution + runbook | Project owner | infra/deploy/decommission-old-stack.md |
| B2 | P0-B | Canonical SSH port decision | owner | Project owner | S-PLAN-STATE B2 |
| RISK-0005 | P0-A | Patch posture â€” 57 pending updates (owner pasted `apt list --upgradable`) | owner maintenance-window decision | Project owner | RISK-0005 OPEN; B1 inventory DONE 2026-08-16 |
| RISK-0006 | P0-A | SSH attack surface â€” UFW allows ports 22+2222 | owner canonical port decision | Project owner | RISK-0006 OPEN |
| DEFER-0009 | P1 | OG image + social preview | owner provides a real image (Gemini contact sheets not production-ready) | Project owner | deferred-validation.md; owner decision 2026-08-16 |
| DEFER-0013 | P1/P2 | Real 200% zoom visual evidence + full mobile visual matrix | manual owner verification on real browser | Project owner | deferred-validation.md; CI suites cover synthetic viewports |
| P3-05 rest | P3 | Media rendition contract + archive/inactive race tests | after deploy runtime | Project owner | ADR-0021 |
| P3-09 | P3 | P3 high-risk verification (migrations forward/fallback, backup/import, permissions, XSS, upload, projection) | deploy runtime | Project owner | Task-list Â§8 |
| DEFER-0014 | P3-05 | Media alt-by-locale | media runtime phase | Project owner | deferred-validation.md; Task-list P3-05 note |
| DEFER-0017 | P4â€“P6 | Public Caddy `/api/` (blog + research + projects) | DONE â€” CLOSED 2026-08-17 | Project owner | deferred-validation.md; LOG-0143 |
| DEFER-0018 | P4 | RSS/Atom blog feed | Deferred â€” SEO/sitemap/JSON-LD shipped without feed | Project owner | deferred-validation.md |
| DEFER-0019 | P5 | Research Statement PDF | CLOSED (repo LOG-0212) — prod migrate `content.0013` + upload | Project owner | deferred-validation.md |
| DEFER-0020 | P5 | Curated collections (graph viz partial via ADR-0028 / LOG-0214) | Collections still deferred — interactive relationship map shipped | Project owner | deferred-validation.md |
| DEFER-0021 | P6 | Live demo embed / iframe | PARTIAL — CSP Report-Only + click-to-load; owner allowlist + enforce open | Project owner | deferred-validation.md |
| P4 | P4 | Blog/Writing (Article/Series, list/detail, feed) | DONE in repo (PR #14/#15); prod migrate blocked on RISK-0003; feed DEFER-0018; public `/api/` DEFER-0017 | Project owner | Task-list Â§9, LOG-0133, LOG-0134 |
| P5 | P5 | Research (Topic/Statement/Project/Publication minimal) | DONE in repo (code-first); prod migrate blocked on RISK-0003; DEFER-0017/0019/0020 | Project owner | P5-research-task-spec.md, Task-list Â§10, LOG-0136 |
| P6 | P6 | Projects + case studies | DONE in repo (code-first); prod migrate blocked on RISK-0003; DEFER-0017/0021 | P5 on main | P6-case-studies-task-spec.md, Task-list Â§11, LOG-0137 |
| P7 | P7 | Professional admin â€” **superseded by ADM (Â§17, ADR-0026)** | â€” | Project owner | Task-list Â§12 note |
| P8 | P8 | Publications/Books/Downloads/Talks | Repo Wave 3 done (LOG-0213); owner attended migrate `content.0013` + rebuild-web | Project owner | Task-list Â§13; P8 task spec |
| P9 | P9 | Teaching + Creative | P8 | Project owner | Task-list Â§14 |
| P10 | P10 | Topics + Pagefind search + collections | P4-P9 content | Project owner | Task-list Â§15 |
| P11 | P11 | AI/semantic/knowledge graph | P10 | Project owner | Task-list Â§16 |
| D15 | P3 verification | Docker Compose candidates verified locally (health checks, resources, env passthrough correct) | S-model | infra/cms/*, LOG-0117 |
| D16 | P4 prep | P4 Blog/Writing task spec written (199 lines) | S-model | docs/plan/P4-blog-writing-task-spec.md, LOG-0117 |
