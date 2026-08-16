# S-Plan State — execution tracker

> Single source of truth for task states. S-model edits ONLY its current task's
> line (IN_PROGRESS/BLOCKED + notes). L-model sets NEEDS_REVIEW→DONE. Append
> review notes in the Log section, never rewrite history.

## Tasks

| ID | Title | State | Assignee | Notes |
|---|---|---|---|---|
| A1 | Reusable smoke script | DONE | S-model | approved e2d7796 by L-model 2026-08-15 (independent re-run PASS) |
| A2 | Production Caddy script (write only) | DONE | S-model | approved fdc430b by L-model 2026-08-15; owner runs A4 |
| A3 | Release decision record P1 | DONE | S-model | approved eb95caf by L-model 2026-08-15 |
| A4 | Production switch | DONE | owner | executed 2026-08-15 via Caddy snippet edit (taha_application_routes → static current); prod-p1.sh superseded for this Caddyfile; live on release-4fcd19f (checksum 13849ab7); update to current HEAD pending |
| A5 | Close R2 / P1-15 | DONE | L-model | R2 closed: production live, Task-list §5 ticked with evidence, snapshot+RELEASE-P1 updated (LOG-0079) |
| B1 | Pending updates inventory | BLOCKED(owner) | owner | paste count + caddy/docker package names only |
| B2 | SSH port decision | BLOCKED(owner) | owner | — |
| B3 | Uptime check definition | DONE | S-model | approved 4ef9541 by L-model 2026-08-15 |
| B4 | Restore drill cadence | DONE | S-model | approved ae8a854 by L-model 2026-08-15 |
| B5 | Visual-interaction adoption brief | DONE | S-model | approved e21fbfe by L-model 2026-08-15 |
| V1 | Screenshot visual QA (DEFER-0010) | DONE | visual-reviewer | 7/7 ACCEPT-WITH-NOTES; report VISUAL-QA-P1.md; DEFER-0010 closed, DEFER-0013 (mobile/zoom) open |
| C1 | Owner content inventory (P2) | DONE | owner | form P2-C1 filled; full master CV + SOP delivered; en full, fa per approved-Persian-only rule |
| C2 | Typed profile contract | DONE | S-model | profile.ts + en/fa + validateProfile; full contract; LOG-0085/LOG-0087 |
| C3 | About pages | DONE | S-model | /en/about/ + /fa/about/ live in build; en full / fa minimal; LOG-0085/LOG-0087 |
| C4 | Resume/CV pages + downloads | DONE | owner/S-model | owner placed master CV + industry resume md files 2026-08-16; published as Markdown downloads via `Downloads.astro` on /en/cv/ + /fa/cv/ (title/note/size); PDF replacement optional (owner decision 2026-08-16) |
| C5 | Contact path | DONE | owner | decision: omit in P2 (DEFER-0007 closed); honest state stays |
| C6 | Navigation update | DONE | S-model | About link in header; LOG-0085 |
| C7 | P2 verification + release | DONE | L-model | no-CV scope per owner decision 2026-08-15; C4 delivered as md 2026-08-16; production deploy of the new artifact (logo + CV) pending owner; no deployment claimed |
| D1 | P3 gate move (Task Spec + owner auth) | DONE | owner/L-model | gate code-first 2026-08-15; P3-gate-code-first-task-spec.md; LOG-0107 |
| D2 | P3 environment (Python 3.12.13 + uv + .venv) | DONE | main | uv install + sync; DEFER-0003 CLOSED; LOG-0107 |
| D3 | P3 content contracts + lifecycle + Ninja API | DONE | sub-agent (general) | 19 tests (content+api); public() only; LOG-0107 |
| D4 | P3 media library + upload security | DONE | sub-agent (general) | 18 tests; filetype allowlist; private default; LOG-0107 |
| D5 | P3 admin security + rich text allowlist | DONE | sub-agent (general) | 19 tests; audit+rate limit; allowlist pinned; LOG-0107 |
| D6 | P3 CI workflow + infra candidates + rebuild trigger | DONE | sub-agent (general) | ci-cms.yml; infra/cms NOT-APPLIED; 6 tests; LOG-0107 |
| D7 | P3 runtime deploy (Compose/Caddy/MFA/DB) | DONE | owner/L-model | Runtime live 2026-08-16; RISK-0009 CLOSED (LOG-0129). Residual: RISK-0003 CMS backup/restore evidence (P3-cms-backup-restore-task-spec); DEFER-0015 CLOSED (LOG-0131 recovery codes — owner rebuild); `/api/`/`/media/` unpublished |
| D8 | Staging decommission | DONE | owner/L-model | ADR-0025 accepted 2026-08-15; staging Caddy block removed on VPS (owner, sudo) + DNS removed if present; gate now CI (web + cms) + production smoke; server upgraded (Ubuntu 26.04 LTS, 2 vCPU / ~4 GiB / 30 GB); live stack inventory-confirmed via docker ps 2026-08-16; LOG-0110 |
| D9 | Header logo (Assets → public/logo.png) | DONE | S-model | 8 KB PNG from `Assets/Taha Logo/Taha Logo base.png` (cropped 4000x4000 white margins, transparent bg); visually reviewed ACCEPT-WITH-NOTES (black outline heavy but acceptable at 48px); replaces `brand-mark` text span in `Header.astro` (mark/TM glyph removed from header; footer mark untouched); other logo variants (electric/gold/green/red/yasi/black) unused — alternatives pending final brand pass |
| D10 | CV/Resume md download pages (/en/cv/ + /fa/cv/) | DONE | S-model | `Downloads.astro` + 2 owner md files in public/downloads; header CV link added; sitemap includes both routes; local QA: overflow=0, dir ltr/rtl correct, 2 links/page, logo loads (Playwright on built dist via http.server:8899); `npm run check` 0 errors; build 8 pages |
| D11 | MFA enforcement (django-otp) | DONE | S-model | `apps/security/mfa.py` middleware + django-otp 1.5.4; OTPMiddleware + MFAEnforcementMiddleware wired; 75 pytest PASS (5 new MFA tests); LOG-0116 |
| D12 | CMS deploy Task Spec | DONE | S-model | `docs/plan/P3-cms-deploy-task-spec.md` (~260 lines); 7 prerequisites, 8 deploy steps, 22 ACs, rollback; LOG-0116 |
| D13 | Incident runbook + SLO | DONE | S-model | `docs/governance/INCIDENT_RUNBOOK.md` (126 lines); SLOs (99.5%, <1% 5xx, p95 <2s); SEV-1/2/3 runbooks; DEPLOY_RUNBOOK xref; LOG-0116 |
| D14 | CI hardening (diff-check + secret scan) | DONE | S-model | `ci-cms.yml` +2 steps: git diff --check + secret pattern scan; LOG-0116 |

## Review log (append-only)

| Date | Task | Verdict | Reviewer | Note |
|---|---|---|---|---|
| 2026-08-15 | A1 | APPROVE | L-model | diff=allowed only; spec-exact; independent smoke re-run 8 PASS exit 0; LOG-0064 |
| 2026-08-15 | B3 | APPROVE | L-model | diff=allowed only; 1 Observability heading; no invented provider/email/URL; LOG-0070 complete |
| 2026-08-15 | B4 | APPROVE | L-model | diff=allowed only; 1 Restore-drill heading; no invented dates/RPO-RTO; LOG-0071 complete |
| 2026-08-15 | B5 | APPROVE | L-model | diff=allowed only; 6 exact headings; no motion/gsap/three imports in src (independent grep clean); LOG-0074 complete |
| 2026-08-15 | A2 | APPROVE | L-model | diff stage→prod only usage/backup-suffix/marker/no-X-Robots-Tag/echo; bash -n OK; LOG-0075 |
| 2026-08-15 | A3 | APPROVE | L-model | record=REAL data (deploy.log verbatim, checksum e49e46c7); smoke re-run 8 PASS; CI green; owner command uses fresh artifact fa3c813; LOG-0076 |
| 2026-08-15 | parallel audit | APPROVE | L-model | SEV-HIGH gold contrast fixed (ink+gold rule); token discipline (#fff→inverse, glass tokens) applied; CI smoke+audit steps; RELEASE-QA RELEASE-READY; LOG-0077 |
| 2026-08-15 | C4/C7 | BLOCKED(owner) | owner | P2 closes without CV/Resume (owner decision); C7 partial; backlog row added |
| 2026-08-15 | D1-D6 | DONE (main) | L-model | P3 code-first: 62 pytest PASS, ruff clean, migrations consistent, ci-cms.yml authored, infra NOT-APPLIED; LOG-0107 |
| 2026-08-15 | D7 | BLOCKED(owner) | owner | runtime deploy needs RISK-0007/RISK-0003/MFA/deploy Task Spec; RISK-0009 BLOCKED |
| 2026-08-15/16 | D8 | DONE (owner) | L-model | staging decommissioned (ADR-0025); gate = CI (web + cms) + production smoke; RISK-0007 CLOSED (keep 4 GiB); live stack docker ps evidence 2026-08-16 07:19 UTC; RISK-0004 CLOSED; LOG-0110 |
| 2026-08-16 | C4 | DONE | L-model | owner files placed; md downloads live in build (/en/cv/, /fa/cv/); PDF optional (owner decision 2026-08-16); label+route approved; download smoke HTTP 200 PASS |
| 2026-08-16 | C7 | DONE | L-model | no-CV scope closed (owner decision 2026-08-15); C4 delivered as md; production deploy of new artifact (logo + CV) pending owner |
| 2026-08-16 | B1 | DONE (owner) | L-model | apt list --upgradable pasted (57 pkgs, Ubuntu 26.04 updates); actual upgrade needs owner maintenance-window decision |
| 2026-08-16 | D9/D10 | DONE (main) | L-model | logo + CV pages verified in build: check 0 errors, build 8 pages, Playwright QA overflow=0 (dist via http.server:8899); sitemap includes /en/cv/ + /fa/cv/ |
| 2026-08-15 | B4 | submitted for review | S-model | Restore drill cadence section appended; git diff --check exit 0; single heading; no invented dates/RPO-RTO/owners beyond Project owner |
| 2026-08-15 | B3 | submitted for review | S-model | Observability (P0A-11) section extended per task; git diff --check exit 0; single Observability heading at line 95 |
| 2026-08-15 | B5 | submitted for review | S-model | adoption brief written; all 6 required section headings present; §98 checklist copied verbatim; git diff --check exit 0; no motion/gsap/three import added in apps/web (grep clean) |
| 2026-08-15 | A2 | submitted for review | S-model | prod-p1.sh written (not run, not scp'd); bash -n exit 0; diff vs stage-p1.sh shows ONLY heredoc marker/block (tahamohamadi.ir marker, no X-Robots-Tag), backup suffix .pre-prod-p1., and echo/usage text; git diff --check + --cached --check exit 0; LOG-0075 |
| 2026-08-15 | A3 | submitted for review | S-model | RELEASE-P1.md written per template; artifact verified live (deploy.log: release-d55d44e e49e46c7; prompt's release-fa3c813 does not match served artifact — flagged pending verification); smoke re-run 8 PASS exit 0; CI green on main; git diff --check exit 0; LOG-0076 |
| 2026-08-15 | A4 | DONE (owner) | L-model | production P1 live via owner's Caddy snippet switch; smoke 7 PASS exit 0; d55d44e served; delta to d7db929 documented; LOG-0078 |
| 2026-08-15 | parallel batch | APPROVE | L-model | polish (skip-links, meta, bdi), LICENSES.md (0 missing; gsap proprietary flagged), PROD-ACCEPTED-WITH-NOTES (404 empty-body finding), A5 close-out; LOG-0079 |
| 2026-08-15 | R2 live | DONE | L-model | prod+staging on release-1ce6d9a; custom 404 live (404+body, verified 4127B); smoke prod 7/stage 8 PASS; scoped sudo active; LOG-0083 |
| V1 | Screenshot visual QA | DONE | visual-reviewer | 7/7 ACCEPT-WITH-NOTES; report VISUAL-QA-P1.md; DEFER-0010 closed, DEFER-0013 (mobile) open |
| C1 | Owner content inventory (P2) | DONE | owner | form P2-C1 filled (identity/bio/skills/availability/contact-omit); gaps: long bio, education, experience org/role/date, CV/Resume files |
| C2 | Typed profile contract | DONE | S-model | profile.ts + en/fa + validateProfile; LOG-0085 |
| C3 | About pages | DONE | S-model | /en/about/ + /fa/about/ live in build; LOG-0085 |
| C5 | Contact path | DONE | owner | decision: omit in P2 (DEFER-0007 closed); honest state stays |
| C4 | Resume/CV pages + downloads | BLOCKED(C1-gaps) | - | files+details (title/type/size/route) pending owner |
| C6 | Navigation update | DONE | S-model | About link in header; LOG-0085 |
| C7 | P2 verification + release | IN_PROGRESS | L-model | deploy to staging+prod pending after this batch |
| C1 | Owner content inventory (P2) | DONE | owner | full master CV + SOP delivered; en full, fa per approved-Persian-only rule |
| C2 | Typed profile contract | DONE | S-model | full contract (experience/education/publications/research/certs/socials); LOG-0087 |
| C3 | About pages | DONE | S-model | en full / fa minimal; deployed after this batch; LOG-0087 |
| D15 | Docker Compose local verification | DONE | sub-agent | infra/cms/* candidates verified locally: health checks correct (pg_isready + urllib), resource limits 512MiB cms/db, env passthrough via .env, non-root 10001:10001, no published ports, named volumes; LOG-0117 |
| D16 | P4 Blog/Writing task spec | DONE | sub-agent | docs/plan/P4-blog-writing-task-spec.md; Article/Series/TopicTag models, Wagtail snippet admin, Ninja API, Astro list/detail/series routes, RSS/Atom, SEO; LOG-0117 |
| D17 | P4 Blog/Writing implementation | DONE | agent | Models/snippets/API/Astro/SEO; DEFER-0017/0018; LOG-0133; branch `feat/p4-blog-writing` |
