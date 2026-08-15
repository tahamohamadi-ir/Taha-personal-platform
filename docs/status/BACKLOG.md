# Backlog

> کارهای تاییدشدهٔ آینده (owner/phase queue) به‌ترتیب اولویت. ردیف‌ها از `Task-list.md`، Risk Register و Deferred Validation می‌آیند؛ این فایل snapshot قابل مرور است، نه منبع حقیقت. جدیدترین در بالا.

| ID | Phase | Item | Blocked by / prerequisite | Owner | Evidence |
|---|---|---|---|---|---|
| C4 | P2 | Resume/CV pages + downloads | فایل‌های PDF واقعی مالک (Academic CV / Professional Resume) در `apps/web/public/downloads/` | Project owner | S-PLAN-STATE C4 |
| C7 | P2 | P2 verification + release (About/C6 ساخته و CI-verif شده) | C4 (اگر CV منتشر شود) | Project owner | LOG-0104 |
| B1 | P0-B | Pending updates inventory (caddy/docker package names) | مالک باید خروجی `apt list --upgradable` و نام پکیج‌ها را paste کند | Project owner | S-PLAN-STATE B1 |
| B2 | P0-B | Canonical SSH port decision | مالک | Project owner | S-PLAN-STATE B2 |
| KI-0001 | P2 | اصلاح handle گیت‌هاب fa (`tahamohammadi-ir` → `tahamohamadi-ir`) در `profile.fa.ts:192,165` | مالک | Project owner | known-issues.md |
| DEFER-0009 | P1 | OG image + social preview | asset تأییدشدهٔ مالک | Project owner | deferred-validation.md |
| DEFER-0013 | P1/P2 | Real 200% zoom visual evidence + full mobile visual matrix | محیط واقعی مرورگر/مالک | Project owner | deferred-validation.md |
| P3 deploy | P3 | CMS runtime deploy (Compose/Caddy/MFA/DB import) | تصمیم ظرفیت (`RISK-0007`) + `RISK-0003` DB-import evidence + Task Spec جدا | Project owner | AGENTS.md gate |
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
