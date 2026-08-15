# S-Plan — Small-Model Execution Plan

> **Status:** Active playbook. Version 1.0 — 2026-08-15.  
> **Purpose:** let a small/cheap model (S-model) implement tasks at maximum
> quality, while a large model (L-model) is used ONLY for planning, review and
> guidance. This file is the single source of truth for execution until a new
> version replaces it.  
> **Language rule:** normative rules are given in English (precision) with
> Persian summaries where helpful. Commands, paths and code are always English.

---

## 0. Roles and cost strategy

| Role | Who | Does | Never does |
|---|---|---|---|
| S-model (executor) | `.opencode/agent/s-executor` (free/cheap tier, e.g. `opencode/deepseek-v4-flash-free`; paid fallbacks: `opencode-go/deepseek-v4-flash`, `opencode-go/mimo-v2.5`) dispatched via the task tool | Implements READY tasks exactly as written: edits allowed files, runs verify commands, appends WORK_LOG, commits | Planning new tasks, changing decisions, inventing content, touching forbidden files, VPS sudo, production deploy approval |
| Visual QA (multimodal) | `.opencode/agent/visual-reviewer` (`opencode-go/gpt-5.6-luna`) | Reads screenshot image files and reviews them against the design checklist; produces a structured PASS/FAIL report | Any edit, any command, any code suggestion beyond observation |
| L-model (architect/reviewer) | large model (current session or equivalent) | Writes/updates this plan, reviews diffs vs acceptance, plans new phases, unblocks escalations | Bulk implementation (waste of tokens) |
| Owner | human | Decisions marked `BLOCKED(owner)`, runs sudo commands, approvals for HIGH-RISK | — |

**Cost rule:** ≥90% of implementation tokens must be S-model tokens. L-model
reads only: task diff, verify output, WORK_LOG entry. Visual QA runs on the
cheap multimodal agent — never on the L-model.

---

## 1. Non-negotiable rules for the S-model (read before ANY task)

1. **Read order, always:** `AGENTS.md` → this file → your task → every file
   listed under "Context to read". If any listed file does not exist → STOP and
   escalate.
2. **Never invent.** No content, translation, URL, email, metric, endpoint,
   package version, file path, slug, color or copy that is not already written
   in the task or the referenced files.
3. **Edit only "Allowed files".** Anything else is forbidden, including
   `.git/`, ADR decisions, `PROJECT_MANIFEST.md` (unless allowed), ledgers other
   than specified.
4. **One task = one commit = one WORK_LOG entry.** Commit message format:
   `<type>(<scope>): <summary>` where type ∈ feat|fix|docs|infra|test|style.
5. **Run the exact verify commands.** Paste REAL outputs (pass or fail) into the
   WORK_LOG entry. Never write "passed" without the actual command output.
6. **Failure handling:** retry a failing command exactly ONCE. If it fails again
   → STOP, write a `BLOCKED` note in the task state file, escalate to L-model.
7. **Never:** `git push` unless the task says so; never `sudo`; never SSH to the
   VPS unless the task explicitly says `agent-ssh: yes`; never delete files
   outside the task; never rewrite Git history; never print secrets.
8. **Persian text:** copy Persian strings EXACTLY from the source files. Never
   re-type or "fix" Persian punctuation (‌ ZWNJ, ، ، ـ) yourself.
9. **If anything is ambiguous or two rules conflict → STOP and escalate.** A
   stopped task costs minutes; a wrong invention costs a release.

---

## 2. Session bootstrap (paste this into the S-model session)

Preferred (after opencode restart, project agents are registered): dispatch the
`.opencode/agent/s-executor` subagent via the task tool with the prompt below.
Fallback (any cheap model session): paste the prompt directly.

```text
Execute S-Plan task <ID> only.

1. Read AGENTS.md, then docs/plan/SMALL-MODEL-EXECUTION-PLAN.md fully.
2. Read docs/plan/S-PLAN-STATE.md to find the current task.
3. Execute ONLY that one task, following its Steps exactly.
4. Run its Verify commands and record real outputs.
5. Append one entry to docs/status/WORK_LOG.md using the existing format,
   with the next free LOG-00XX number.
6. Update docs/plan/S-PLAN-STATE.md: mark the task NEEDS_REVIEW (or BLOCKED).
7. Commit exactly the task's Allowed files with the given commit message.
8. Do not start the next task. Do not push. Stop and report.

Rules: never invent content/paths/versions; edit only allowed files;
if a command fails twice or anything is ambiguous — stop and report
"ESCALATE: <reason>".
```

---

## 3. Task protocol (state machine)

```text
READY ──S-model──▶ IN_PROGRESS ──verify pass──▶ NEEDS_REVIEW ──L-model──▶ DONE
                        │
                        └─fail/ambiguity──▶ BLOCKED ──L-model/owner──▶ READY
BLOCKED(owner) ──owner decision──▶ READY
HIGH-RISK tasks: NEEDS_REVIEW must also get explicit owner approval before DONE.
```

- Current states live in `docs/plan/S-PLAN-STATE.md` (one line per task).
- The S-model moves a task to `IN_PROGRESS`/`BLOCKED`; only the L-model moves
  it to `DONE`; the owner is recorded for approvals.

---

## 4. Escalation to L-model (exact triggers)

Escalate (`ESCALATE: <one-line reason>`) when ANY of these is true:

- A referenced file, command, path or string in the task does not exist/match.
- A verify command fails twice.
- The change seems to require editing a file not in "Allowed files".
- Two tasks or rules appear to conflict.
- Anything about secrets, credentials, DNS, production or the VPS sudo.
- A Persian string needs rewriting (content decisions are L-model/owner).
- The task is marked `HIGH-RISK` and has no recorded owner approval.

---

## 5. Current snapshot (verify at session start; re-check, don't trust)

- Gate: `P0-G0: PASS for static-only P1`. Staging live at
  `staging.tahamohamadi.ir` serving `release-d55d44e`; `/nonexistent` → 404.
- CI green on `main` (`.github/workflows/ci.yml`).
- Production `tahamohamadi.ir` still serves the LEGACY stack (untouched).
- Open IDs: `DEFER-0007` contact, `DEFER-0009` OG, `DEFER-0010` browser QA,
  `DEFER-0011` Cloudflare robots, `DEFER-0012` external design resources,
  `RISK-0004..0007`, `DEBT-0001`. `motion` 13.1.0, `gsap` 3.15.0 and `three`
  0.185.1 are locked for future use but are not imported or active in P1
  (LOG-0067 / P1-T01).
- Canonical commands live in `PROJECT_MANIFEST.md` §"Canonical commands".

---

## 6. Task backlog

> Task format is fixed. If a field is missing → STOP. Priorities:
> `P0` (release path) > `P1` (soon) > `P2` (next phase).

### Phase A — R2 close: production P1 release

#### A1 — Reusable smoke script (staging/production) — `P0` — LOW risk
- State: READY
- Context to read: `docs/governance/DEPLOY_RUNBOOK.md`, `infra/deploy/stage-p1.sh`, `PROJECT_MANIFEST.md`
- Allowed files: `infra/deploy/smoke.sh`, `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`
- Steps:
  1. Create `infra/deploy/smoke.sh` (bash, `set -euo pipefail`). It takes
     `BASE_URL` as `$1` and an optional `--expect-noindex` flag. It curls and
     asserts status codes: `/`=200, `/en/`=200, `/fa/`=200, `/health.json`=200
     (and body contains `"status":"ok"`), `/robots.txt`=200, `/sitemap.xml`=200,
     `/nonexistent-qa`=404. With `--expect-noindex` it also asserts response
     header `x-robots-tag` contains `noindex` on `/`. Print one line per check
     `PASS|FAIL <name>` and exit non-zero on any FAIL.
  2. Make the assertions exactly as written; add nothing.
  3. Run `bash -n infra/deploy/smoke.sh` then run it against
     `https://staging.tahamohamadi.ir --expect-noindex`.
- Verify: both runs pass; all lines `PASS`.
- Deliverables: script + WORK_LOG entry + state update.
- Commit message: `infra: add reusable http smoke script`
- STOP if: any staging check FAILs twice (escalate with the FAIL lines).

#### A2 — Production Caddy script (write only, do NOT run) — `P0` — HIGH risk
- State: BLOCKED(owner approval to write+review before owner runs it)
- Context to read: `infra/deploy/stage-p1.sh`, `docs/governance/DEPLOY_RUNBOOK.md`, `docs/adr/0017-versioned-static-artifact-deploy.md`
- Allowed files: `infra/deploy/prod-p1.sh`, `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`
- Steps:
  1. Copy `stage-p1.sh` to `prod-p1.sh`. Change ONLY: the python heredoc marker
     from `staging.tahamohamadi.ir {` to `tahamohamadi.ir {`, the replacement
     block serves `root * /opt/taha/site/current` with the SAME
     `taha_security_headers` import, `file_server` and the `handle_errors` 404
     block (NO `X-Robots-Tag` on production), and backup suffix
     `.pre-prod-p1.<timestamp>`. Leave `www`, both `85.192.29.196` blocks and
     everything else untouched — the script replaces only the production site
     block content, exactly like stage-p1.sh does for staging.
  2. `bash -n` the script. Do NOT run it. Do NOT scp it.
- Verify: `bash -n` passes; a `diff infra/deploy/stage-p1.sh infra/deploy/prod-p1.sh` shows changes only in the heredoc block, backup suffix and echo text.
- Deliverables: script + WORK_LOG + state = NEEDS_REVIEW (L-model must review
  the diff line-by-line before owner runs it).
- Commit message: `infra: add production caddy switch script (review required)`
- STOP if: anything in the surrounding Caddyfile logic is unclear.

#### A3 — Release decision record for P1 — `P0` — LOW risk
- State: BLOCKED(A2 review)
- Context to read: `docs/governance/RELEASE_POLICY.md` (release decision template), `docs/status/RISK_REGISTER.md`, `docs/status/deferred-validation.md`
- Allowed files: `docs/plan/RELEASE-P1.md`, `docs/status/WORK_LOG.md`, `docs/plan/S-PLAN-STATE.md`
- Steps: fill the release decision template from RELEASE_POLICY.md with REAL
  data: artifact `release-d55d44e`, checksum from `/opt/taha/site/deploy.log`
  (ask owner or read via `ssh taha-nl "tail -2 /opt/taha/site/deploy.log"`
  — agent-ssh: yes, read-only), open IDs list, rollback
  (restore timestamped Caddy backup + `current` pointer), Release DoD evidence
  pointers to WORK_LOG entries. Mark Completion DoD `NOT MEASURED`.
- Verify: every claim in the file references a real WORK_LOG ID or command.
- Commit message: `docs: record P1 release decision`
- STOP if: any required evidence cannot be found.

#### A4 — Owner executes production switch — `P0` — HIGH risk — owner-only
- State: BLOCKED(A2, A3, owner)
- Steps (owner, not agents): upload artifact `release-<rev>` to `~/taha-stage/`
  (S-model may scp after A2 review), then run
  `sudo bash ~/taha-stage/prod-p1.sh ~/taha-stage/release-<rev>`.
- Then S-model runs `infra/deploy/smoke.sh https://tahamohamadi.ir` (no
  noindex flag) and records results.

#### A5 — Close R2 (P1-15) — `P0` — LOW risk
- State: BLOCKED(A4)
- Allowed files: `docs/status/WORK_LOG.md`, `docs/status/known-issues.md`,
  `Task-list.md`, `docs/plan/S-PLAN-STATE.md`
- Steps: record production URL/version/time; Release DoD vs Completion DoD
  separately; ensure every open ID has owner+target; tick Task-list §5
  checkboxes that have evidence.

### Phase B — P0-B hardening (after first live)

#### B1 — Pending updates inventory — `P1` — owner sudo, S-model records
- State: BLOCKED(owner)
- Steps: owner runs `sudo apt list --upgradable` and pastes the COUNT and any
  caddy/docker packages (names only); S-model updates `RISK-0005` evidence.

#### B2 — SSH port decision — `P1` — owner decision → S-model documents
- State: BLOCKED(owner)

#### B3 — Uptime check definition — `P1` — LOW risk
- State: READY (documentation only)
- Steps: add an "Observability" section to `docs/governance/DEPLOY_RUNBOOK.md`
  defining: external uptime check on `/health.json` every 5 minutes (owner
  chooses free provider), alert target = owner email, deploy-version lookup =
  `curl <host>/health.json`. No accounts are created by agents.

#### B4 — Restore drill cadence — `P1` — LOW risk
- State: READY (documentation only): record quarterly cadence + owner in
  `BACKUP_POLICY.md` (append a "Restore drill cadence" section).

#### B5 — Visual-interaction adoption brief — `P1` — LOW risk
- State: BLOCKED(A5, owner interaction decision)
- Context to read: `PROJECT_MANIFEST.md`, `docs/design.md`,
  `docs/taha-personal-platform-technology-architecture-baseline-fa.md`,
  `Task-list.md` P0B-04, `DEFER-0012` and the relevant route/content contract.
- Preconditions: owner names one user-facing interaction and its route; any
  external asset/component comes with a versioned source and verified use-right.
- Steps:
  1. Write a dedicated Task Spec before implementation; classify it as
     FAST-TRACK/STANDARD from the real scope.
  2. Establish that CSS/native cannot meet the value, then choose exactly one
     of `motion`, `gsap` or `three`; never default to multiple libraries.
  3. Specify island-local lazy loading, no-JS/static fallback,
     `prefers-reduced-motion`, keyboard/RTL/LTR/mobile behavior, error state,
     bundle/performance budget and browser QA evidence.
  4. If the choice is Three/WebGL, provide a text/static fallback and show that
     it cannot delay the hero or primary content.
- Verify: L-model confirms that every field is concrete, the public content is
  complete without JavaScript, and the Task Spec names only task-owned files.
- Deliverables: one approved feature Task Spec; no application code in B5.
- STOP if: user value, route, library choice, fallback or asset use-right is
  missing; do not prototype or import anything.

#### V1 — Screenshot visual QA (DEFER-0010 evidence) — `P0` for release — LOW risk
- State: READY (requires one opencode restart so `visual-reviewer` is registered)
- Executor: `.opencode/agent/visual-reviewer` (multimodal; NOT the S/L model)
- Inputs: owner screenshot files under `~/Pictures/Screenshots/` (e.g.
  `Screenshot 2026-08-15 003016.png` … `003052.png`).
- Steps:
  1. Dispatch visual-reviewer once per screenshot (or one batch dispatch listing
     all paths) with the page each shows (staging `/`, `/en/`, `/fa/`, 404).
  2. Collect the structured reports (7-check rows + severities).
  3. L-model triage: any SEV-HIGH → open a fix task in this plan and keep
     DEFER-0010 OPEN; all PASS/LOW → close DEFER-0010 with the reports as
     evidence.
- Verify: reports exist for every screenshot; triage decision recorded in
  S-PLAN-STATE review log.
- Deliverables: `docs/plan/VISUAL-QA-P1.md` (all reports + triage),
  WORK_LOG entry, DEFER-0010 status update.
- Commit message: `docs: record P1 visual QA reports`

### Phase C — P2 static About / Resume / CV / Contact

#### C1 — Owner content inventory — `P0` for phase C — BLOCKED(owner)
- Owner provides per-locale approved: bio (short/long), experience entries,
  education, skills, CV file + Resume file (title/type/size/language), contact
  decision (DEFER-0007). No agent may draft biographical facts.

#### C2 — Typed profile contract — `P1` — READY after C1
- Context: `apps/web/src/data/content.ts`, `docs/user-journey-information-architecture.md` §43
- Steps: add `Profile`/`Experience`/`Education` typed interfaces in
  `apps/web/src/data/profile.ts`; data lives in `apps/web/src/data/profile.<locale>.ts`;
  every field comes verbatim from C1 inputs; build-time validation function
  `validateProfile()` asserting non-empty titles, ISO dates, URL format; call
  it from both locale pages' frontmatter (throws on invalid → build fails).
- Verify: `npm run check`, `npm run build` with a deliberately empty optional
  field → build fails with the assertion message; restore valid data → passes.

#### C3 — About pages `/fa/about/`, `/en/about/` — `P1`
- Steps: new pages extend `BaseLayout` + a new `About.astro` section component
  (bio, journey line from positioning, contact state from footer contract).
  Reuse existing tokens only. hreflang/canonical like landing. Add to
  `sitemap.xml.ts` urls array ONLY these two URLs.

#### C4 — Resume/CV pages + downloads — `P1` — files provided by owner
- Steps: files go to `apps/web/public/downloads/` with EXACT owner filenames;
  pages `/fa/resume/`, `/en/resume/` (or `/cv/` if owner picks academic split —
  follow C1 decision); download links carry `download` attribute + size/lang
  metadata text; no invented metrics.

#### C5 — Contact path — `P1` — BLOCKED(owner decision per DEFER-0007)
- If owner picks email: footer gets a real `mailto:` with the approved address;
  if profile link: external link with `rel="me noopener"`; if none: keep the
  honest unavailable state. No form, no backend, no analytics.

#### C6 — Navigation update — `P1`
- Steps: add About (and Resume/CV if approved) links to Header nav for both
  locales; order: brand, nav links, language switch. Mobile: same items, no
  hamburger needed for ≤5 items.

#### C7 — P2 verification + release — repeat A1 smoke (both hosts), then the
  same staging→owner-sudo→production flow as Phase A with a new release-<rev>.

### Phase D — P3+ (CMS) — L-model planning only; NO S-model tasks until gated

---

## 7. L-model review protocol (for the big model only)

Review a `NEEDS_REVIEW` task by checking, in order:

1. Diff contains ONLY Allowed files.
2. Every Step done; no extra changes ("surprise diff" = reject).
3. Verify outputs are real (not paraphrased) and match acceptance.
4. Persian strings byte-identical to source (ZWNJ intact).
5. WORK_LOG entry complete: commands, results, IDs, rollback.
6. Commit message matches the task.
7. For HIGH-RISK: owner approval evidence present.
Reply with `APPROVE` (→ state DONE) or `REJECT: <reasons>` (→ state READY with
the fix list appended to the task).

---

## 8. Appendices

### 8.1 Command cheatsheet (all run in `apps/web/` unless noted)
```powershell
npm run check     # astro check — must end "0 errors"
npm run build     # astro build — must end "Complete!"
npm audit --audit-level=high   # must end "found 0 vulnerabilities"
# repo root:
git status --short --branch
git diff --check
bash -n <script.sh>            # WSL bash syntax check
```

### 8.2 File ownership map (abridged; full list in AGENTS.md)
```text
apps/web/**            frontend code            S-model (per task)
infra/deploy/**        deploy scripts           S-model write, L-model review, owner run
docs/status/WORK_LOG.md  append-only ledger    every task
docs/plan/S-PLAN-STATE.md execution states     every task
docs/adr/**            immutable decisions     L-model only
PROJECT_MANIFEST.md    canonical state         L-model (or task that allows it)
```

### 8.3 WORK_LOG entry template (append-only, next free number)
```md
## LOG-00XX — YYYY-MM-DD — <phase/task-id> / <title>
- Outcome:
- Why:
- Scope / files:
- Commands or actions actually performed:
- Verification actually performed and result:
- Decisions / assumptions:
- Deferred or risk IDs:
- Rollback / recovery:
```
