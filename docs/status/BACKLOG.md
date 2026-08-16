# Backlog

> کارهای تاییدشدهٔ آینده (owner/phase queue) به‌ترتیب اولویت. ردیف‌ها از `Task-list.md`، Risk Register و Deferred Validation می‌آیند؛ این فایل snapshot قابل مرور است، نه منبع حقیقت. جدیدترین در بالا.

| ID | Phase | Item | Blocked by / prerequisite | Owner | Evidence |
|---|---|---|---|---|---|
| C4 | P2 | Resume/CV pages + downloads — **CLOSED 2026-08-16**: Academic CV + Professional Resume published as Markdown downloads on `/en/cv/` + `/fa/cv/` (owner files in `Assets/`)؛ PDF replacement optional (owner decision 2026-08-16) | — | Project owner | S-PLAN-STATE C4 (DONE) |
| C7 | P2 | P2 verification + release — **CLOSED 2026-08-16** (no-CV scope per owner decision 2026-08-15؛ C4 delivered as md)؛ production deploy of the new artifact (logo + CV) pending owner | — | Project owner | S-PLAN-STATE C7 (DONE) |
| B1 | P0-B | Pending updates inventory — **CLOSED 2026-08-16**: owner pasted `apt list --upgradable` (57 pkgs: docker-ce 29.7.2، docker-compose-plugin 5.4.0، containerd.io 2.3.3، grub-pc، linux-firmware*، bind9*، ubuntu-* meta، apparmor 5.0.2، libgcrypt20 — Ubuntu 26.04 "resolute" updates). Inventory only؛ the actual upgrade needs an owner maintenance-window decision (P0B-01 execution) | owner maintenance-window decision | Project owner | S-PLAN-STATE B1 (DONE)؛ LOG next |
| Old-stack decommission | ops | Shutdown of pre-existing compose stack (`taha-prod-frontend`/`backend`/`postgres` at `/opt/taha/repository`) — **AUTHORIZED 2026-08-16**؛ execution is owner-sudo | owner-sudo execution + runbook | Project owner | infra/deploy/decommission-old-stack.md (in progress) |
| B2 | P0-B | Canonical SSH port decision | مالک | Project owner | S-PLAN-STATE B2 |
| KI-0001 | P2 | اصلاح handle گیت‌هاب fa (`tahamohammadi-ir` → `tahamohamadi-ir`) — **CLOSED 2026-08-15**: در `profile.fa.ts` اصلاح شد؛ `rg tahamohammadi apps/web/src` → no matches | مالک | Project owner | known-issues.md (CLOSED)؛ LOG-0110 |
| DEFER-0009 | P1 | OG image + social preview | asset تأییدشدهٔ مالک | Project owner | deferred-validation.md |
| DEFER-0013 | P1/P2 | Real 200% zoom visual evidence + full mobile visual matrix | محیط واقعی مرورگر/مالک | Project owner | deferred-validation.md |
| P3 deploy | P3 | CMS runtime deploy (Compose/Caddy/MFA/DB import) | ظرفیت حل شد (`RISK-0007` CLOSED 2026-08-15 — plan 4 GiB؛ ADR-0025)؛ هنوز: MFA enforcement + `RISK-0003` DB-import evidence + Task Spec جدا | Project owner | AGENTS.md gate؛ RISK-0009 BLOCKED |
| P3-05 rest | P3 | Media rendition contract + archive/inactive race tests | بعد از deploy runtime | Project owner | ADR-0021 |
| P3-09 | P3 | P3 high-risk verification (migrations forward/fallback، backup/import، permissions، XSS، upload، projection) | deploy runtime | Project owner | Task-list §8 |
| P4 | P4 | Blog/Writing (Article/Series، list/detail، feed) | P3 runtime | Project owner | Task-list §9 |
| P5 | P5 | Research (Topic/Project/Publication minimal) | P4 | Project owner | Task-list §10 |
| P6 | P6 | Projects + case studies | P5 | Project owner | Task-list §11 |
| P7 | P7 | Professional admin (roles/revisions/dashboard/composition) | P3 runtime + P5 | Project owner | Task-list §12 |
| P8 | P8 | Publications/Books/Downloads/Talks | P6/P7 | Project owner | Task-list §13 |
| P9 | P9 | Teaching + Creative | P8 | Project owner | Task-list §14 |
| P10 | P10 | Topics + Pagefind search + collections | P4-P9 content | Project owner | Task-list §15 |
| P11 | P11 | AI/semantic/knowledge graph | P10 | Project owner | Task-list §16 |
