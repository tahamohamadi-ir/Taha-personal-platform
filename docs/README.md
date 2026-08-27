# Docs entry point — read this first

Goal:
You know which document to trust, which to edit, and when to stop.

You need:
- `AGENTS.md` at the repository root
- `PROJECT_MANIFEST.md` at the repository root
- `Assets/site-redesign/implementation-reference/README.md` for next-gen frontend intent (P14 ATLAS)
- This file

Audience:
Every agent, including small models.

Rule:
If two documents disagree, the **owner** column in §3 wins. Do not average them. Do not guess.

---

## 1. Read order

Read in this order. Stop as soon as you have what the task needs.

1. `AGENTS.md` — contracts you may never break.
2. `PROJECT_MANIFEST.md` — approved versions and canonical commands.
3. `Assets/site-redesign/implementation-reference/README.md` → `MASTER-SPEC.md` (§1–6, §11) + `agent-kit/*.json` (+ `AGENT-COORDINATION.md`, `MULTI-AGENT-TASK-LIST.md`, `ACCEPTANCE-GATES.md`) — canonical next-gen frontend brief (P14 ATLAS, commit `7d9b87f`, branch `p14c-visual-atlas`). Planning/handoff only — not live runtime. For tokens, `MASTER-SPEC.md` outranks `reDesign_plan.md` §12–13.
4. Your Task Spec in `docs/plan/` — see `docs/plan/README.md` for which one is active.
5. Only the contract cards you need:
   - `docs/contracts/IA-CONTRACT.md` — binding navigation and URL rules.
   - `docs/contracts/DESIGN-CONTRACT.md` — binding visual and token rules.
6. Deep reference / history only if the contract card does not answer the question:
   - `docs/design.md` (~3560 lines) — **history**, superseded by `MASTER-SPEC.md`.
   - `docs/user-journey-information-architecture.md` (~3900 lines) — **history**, superseded by `MASTER-SPEC.md`.
   Both are deep reference history; binding runtime rules are in the contract cards, binding next-gen intent is in `MASTER-SPEC.md` + `agent-kit`.

Do not read the deep reference files end to end.
They are reference, not instructions.

Expected result:
You can name the one file that owns the fact you are about to change.

---

## 2. What is true today

Do not infer current state from a plan file. Plans describe intent.

| Question | Answer as of 2026-08-26 | Source of truth |
|---|---|---|
| What is live publicly? | Language Gateway `/`, `/fa/`, `/en/`, About, CV, blog/writing, research, projects, 404, robots, sitemap; P8 catalogs (`publications`, `books`, `talks`, `downloads`) + `/{locale}/search/` (Pagefind) — catalogs empty-honest until CMS content | `apps/web/src/pages/`; LOG-0143; LOG-0150; LOG-0216 |
| Has the P14 frontend rebuild started? | **No** — `Assets/site-redesign/implementation-reference/` is **planning/handoff only**; no token, component, template, or route from it is live. Existing `apps/web` static routes remain current runtime until a P14 packet is accepted and merged. | `Assets/site-redesign/implementation-reference/README.md` (branch `p14c-visual-atlas`, commit `7d9b87f`); `AGENTS.md` Current gate |
| What is the next-gen frontend brief? | `Assets/site-redesign/implementation-reference/` — dual-theme Design System, 24 components, 6 templates, local-only Visual Atlas (`DESIGN_ATLAS=1` → `/_design/`), `agent-kit/*.json` + `ACCEPTANCE-GATES.md`. Not live; `apps/web/src/styles/global.css` remains current runtime token authority. | `MASTER-SPEC.md`; `agent-kit/README.md`; `DOCUMENT-MIGRATION-MAP.md` |
| Is the CMS live? | Yes — Compose `taha-cms` (`db` + `cms` + `web` nginx + `caddy` edge); React SPA `/admin/`, Django staff `/staff/`, `/static/*`, `/health/` + `/health.json` | `infra/cms/Caddyfile.cms.snippet`; LOG-0163; LOG-0193; LOG-0210; LOG-0216 |
| Is `/api/` public? | Yes — **published-only** Ninja JSON for articles, research, and projects | `DEFER-0017` CLOSED; LOG-0143 |
| Is `/media/` public? | Proxied; upload unpublished. Serves files only when `is_active` (anonymous). | LOG-0143; LOG-0167 |
| Is contact published? | No — honest "not published" copy | `DEFER-0007` CLOSED |
| Is About CMS-managed? | Yes on `main` (PR #31). Public About uses CMS when the build has `CMS_API_BASE`; `profile.snapshot.json` only when base is unset (local/offline). With base set, API outage fails the build (no silent snapshot). | LOG-0150; LOG-0182; ADR-0027 Slice 3; `DEFER-0022` |
| Where is the custom admin? | Independent `apps/admin` SPA at `/admin/` (ADR-0032; S5 cutover 2026-08-25, LOG-0251). Wagtail package removed (`DEBT-0003` CLOSED); staff HTML at `/staff/`. | LOG-0163; LOG-0193; `DEFER-0023` CLOSED |
| Is there search? | Yes — `/{locale}/search/` (Pagefind, Wave 5). | LOG-0215; LOG-0216 |
| Is React the public shell? | No — Astro static shell; React is island-only. Atlas is local-only; default build has no `/_design/`. | `apps/web/package.json`; `MASTER-SPEC.md` §2–3; `AGENTS.md` |
| Is `DESIGN_ATLAS=1` live? | No — local playground only. Default `npm run build` must not contain `/_design/`, fixtures, or atlas nav. | `AGENTS.md`; `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` §2 |
| Is staging alive? | No — decommissioned | `docs/adr/0025-staging-decommission.md` |
| Is `RISK-0003` open? | No — CLOSED | LOG-0140 |
| Are `docs/design.md` and `user-journey-…` current? | No — **history / deep reference**. Next-gen visual and journey intent is now in `MASTER-SPEC.md` + `agent-kit/*.json`; current runtime rules are in contract cards. | `AGENTS.md`; `DOCUMENT-MIGRATION-MAP.md`; `SOURCE-INVENTORY.md` |

Warning:
This checkout is not always the same as production. Feature branches may hold
schema or routes that `main` does not have. Before building public pages from a
CMS model, verify the model exists **in the checkout you are building from**.

---

## 3. Who owns which fact

One fact, one owner. Update the owner first, then any file that quotes it.

| Fact | Owner file | Do not also decide it here |
|---|---|---|
| Non-negotiable contracts | `AGENTS.md` | plan files, design.md |
| Approved versions, canonical commands | `PROJECT_MANIFEST.md` | README, task specs |
| Next-gen design tokens, components, templates, atlas, and brief | `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` + `Assets/site-redesign/implementation-reference/agent-kit/*.json` (+ `AGENT-COORDINATION.md`, `MULTI-AGENT-TASK-LIST.md`, `ACCEPTANCE-GATES.md`) | `docs/design.md` (history), `apps/web/src/styles/global.css` (current runtime only until ATLAS-01 accepted) |
| Current runtime visual/token authority | `apps/web/src/styles/global.css` | `agent-kit/tokens.json` (next-gen brief, not active runtime) |
| Architecture decision | `docs/adr/NNNN-*.md` | master plan, design.md |
| Phase order and scope | `docs/taha-personal-platform-development-master-plan-fa.md` | task specs |
| Execution checkboxes | `Task-list.md` | master plan |
| Which spec is active | `docs/plan/README.md` | S-Plan, backlog |
| Navigation / URL rules | `docs/contracts/IA-CONTRACT.md` | design.md |
| Tokens, spacing, colour rules (current runtime) | `docs/contracts/DESIGN-CONTRACT.md` + `apps/web/src/styles/global.css` | design.md |
| Visual / journey history (superseded) | `docs/design.md`, `docs/user-journey-information-architecture.md` — **history / deep reference only** | `MASTER-SPEC.md` + contract cards (next-gen intent / current runtime) |
| What actually happened | `docs/status/WORK_LOG.md` | CHANGELOG |
| Unresolved blocker | `docs/status/RISK_REGISTER.md` | work log |
| Accepted compromise | `docs/status/TECH_DEBT.md` | code comments |
| Skipped test or QA | `docs/status/deferred-validation.md` | task spec |
| User-visible defect | `docs/status/known-issues.md` | backlog |

---

## 4. Where to write when you finish

Every real action gets one `WORK_LOG` entry. No exceptions, including docs-only work.

Pick the ledger with this test:

1. Did you skip a test, QA step, or hardening you should have done?
   Write it in `docs/status/deferred-validation.md` with a new `DEFER-00NN`.
2. Did you accept a known-imperfect implementation?
   Write it in `docs/status/TECH_DEBT.md` with a new `DEBT-00NN`.
3. Is something blocking release, security, or data safety?
   Write it in `docs/status/RISK_REGISTER.md` with a new `RISK-00NN`.
4. Can a visitor see the problem on the live site?
   Write it in `docs/status/known-issues.md` with a new `KI-00NN`.

### LOG ID allocation

This repository has many parallel branches.
Duplicate `LOG-` numbers have already happened.

Before you add a Work Log entry, run:

```powershell
git rev-list --all --remotes | ForEach-Object { git show "$_`:docs/status/WORK_LOG.md" 2>$null } |
  Select-String -Pattern "^## LOG-(\d{4})" -AllMatches |
  ForEach-Object { $_.Matches } | ForEach-Object { $_.Groups[1].Value } |
  Sort-Object -Unique -Descending | Select-Object -First 1
```

Expected result:
One four-digit number. Use that number **plus one**.

If the command fails, use the highest number in your working copy plus ten, and
say in the entry that the ID was allocated defensively.

---

## 5. STOP conditions

Stop and report. Do not improvise.

- A file listed in "Context to read" does not exist.
- Two documents conflict and §3 does not name an owner.
- The task needs a value that is not written anywhere: a URL, an email, a metric, a translation, a version, a secret.
- A verify command fails twice.
- The change would touch a file outside "Allowed files".
- The change would need `sudo`, SSH to the VPS, `git push`, or a production deploy, and the task does not explicitly authorize it.
- You are about to publish content in one locale by copying the other locale.

Stopping costs minutes. Inventing costs a release.

---

## 6. Directory map

| Path | Contains | Edit rule |
|---|---|---|
| `Assets/site-redesign/implementation-reference/` | Next-gen frontend brief: `MASTER-SPEC.md`, `agent-kit/*.json`, `AGENT-COORDINATION.md`, `MULTI-AGENT-TASK-LIST.md`, `ACCEPTANCE-GATES.md` (planning/handoff, not live) | Read-only until P14 packet activated; do not treat as runtime |
| `docs/contracts/` | Short binding cards for IA and design | Change only with the owning deep doc |
| `docs/governance/` | Release, documentation, deploy, backup, incident, server policy | Policy change needs owner approval |
| `docs/adr/` | Architecture decisions | Never rewrite an accepted decision; supersede it |
| `docs/plan/` | Task Specs and planning briefs | See `docs/plan/README.md` for active vs archived |
| `docs/status/` | Ledgers: work log, risks, debt, deferred, known issues, changelog, backlog | Append; never delete history |
| `docs/templates/` | Task Spec template | Copy, do not edit in place |

Deep reference / history files live directly in `docs/`:
`design.md`, `user-journey-information-architecture.md`,
`taha-personal-platform-development-master-plan-fa.md`,
`taha-personal-platform-technology-architecture-baseline-fa.md`.
`design.md` and `user-journey-…` are **history**; next-gen intent is in `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` + `agent-kit/*.json`.

---

## 7. Quality bar for a finished task

A task is done when all of these are true:

- The implementation matches the acceptance criteria in the Task Spec.
- The verify commands were run and the **real** output is in the Work Log.
- Documentation that describes the changed behaviour was updated in the same task.
- Anything skipped has an ID in the right ledger.
- Only task-owned files changed.

If the code is finished but documentation is not, the task is `PARTIAL`, not `DONE`.

---

## Done

You know the read order, the owner of each fact, where to record outcomes, and when to stop.

Next:
Open `Assets/site-redesign/implementation-reference/MASTER-SPEC.md` (§1–6, §11) and `agent-kit/README.md`, then `docs/plan/README.md` and find the active Task Spec.
