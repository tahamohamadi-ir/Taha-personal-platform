# Backlog

> Task queue (owner/phase queue) sorted by priority. Rows come from `Task-list.md`, Risk Register and Deferred Validation; this file is a browsable snapshot, not the source of truth. Newest at top.

| ID | Phase | Item | Blocked by / prerequisite | Owner | Evidence |
|---|---|---|---|---|---|
| P3 versioned CI/CD | P3 | GHCR sha-tagged CMS image + proxy/health fixes + update-cms.sh | merge branch; VPS pull + Caddy snippet + smoke-cms.sh | Project owner | P3-cms-versioned-cicd-task-spec.md, LOG-0120 |
| RISK-0003 | P0-A | Install CMS-aware backup script + isolated restore evidence | Owner VPS; P3-cms-backup-restore-task-spec | Project owner | LOG-0130, infra/backup/README.md |
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
| P4 | P4 | Blog/Writing (Article/Series, list/detail, feed) | P3 runtime | Project owner | Task-list §9 |
| P5 | P5 | Research (Topic/Project/Publication minimal) | P4 | Project owner | Task-list §10 |
| P6 | P6 | Projects + case studies | P5 | Project owner | Task-list §11 |
| P7 | P7 | Professional admin (roles/revisions/dashboard/composition) | P3 runtime + P5 | Project owner | Task-list §12 |
| P8 | P8 | Publications/Books/Downloads/Talks | P6/P7 | Project owner | Task-list §13 |
| P9 | P9 | Teaching + Creative | P8 | Project owner | Task-list §14 |
| P10 | P10 | Topics + Pagefind search + collections | P4-P9 content | Project owner | Task-list §15 |
| P11 | P11 | AI/semantic/knowledge graph | P10 | Project owner | Task-list §16 |
| D15 | P3 verification | Docker Compose candidates verified locally (health checks, resources, env passthrough correct) | S-model | infra/cms/*, LOG-0117 |
| D16 | P4 prep | P4 Blog/Writing task spec written (199 lines) | S-model | docs/plan/P4-blog-writing-task-spec.md, LOG-0117 |
