# Docs entry point — read this first

Goal:
You know which document to trust, which to edit, and when to stop.

You need:
- `AGENTS.md` at the repository root
- `PROJECT_MANIFEST.md` at the repository root
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
3. Your Task Spec in `docs/plan/` — see `docs/plan/README.md` for which one is active.
4. Only the contract cards you need:
   - `docs/contracts/IA-CONTRACT.md` — binding navigation and URL rules.
   - `docs/contracts/DESIGN-CONTRACT.md` — binding visual and token rules.
5. Deep reference only if the contract card does not answer the question:
   - `docs/user-journey-information-architecture.md` (~3900 lines)
   - `docs/design.md` (~3560 lines)

Do not read the deep reference files end to end.
They are reference, not instructions.

Expected result:
You can name the one file that owns the fact you are about to change.

---

## 2. What is true today

Do not infer current state from a plan file. Plans describe intent.

| Question | Answer as of 2026-08-18 | Source of truth |
|---|---|---|
| What is live publicly? | Language Gateway `/`, `/fa/`, `/en/`, About, CV, blog, research, projects, 404, robots, sitemap | `apps/web/src/pages/`; LOG-0143; LOG-0150 |
| Is the CMS live? | Yes — Wagtail `/admin/` with TOTP, `/static/*`, `/health/` | `infra/cms/Caddyfile.cms.snippet` |
| Is `/api/` public? | Yes — published-only Ninja JSON for articles, research, and projects | `DEFER-0017` CLOSED; LOG-0143 |
| Is `/media/` public? | Proxied; media *upload* is unpublished | LOG-0143 |
| Is contact published? | No — honest "not published" copy | `DEFER-0007` CLOSED |
| Is About CMS-managed? | Code is on `main` (PR #31). Production still needs owner `migrate` through `0005`/`0006` and `import_profile_seed`. Until then the static site uses `profile.snapshot.json`. | LOG-0150; `DEFER-0022` |
| Is there search? | No. Pagefind remains later | `PROJECT_MANIFEST.md` |
| Is React the public shell? | No | `apps/web/package.json` |
| Is staging alive? | No — decommissioned | `docs/adr/0025-staging-decommission.md` |
| Is `RISK-0003` open? | No — CLOSED | LOG-0140 |

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
| Architecture decision | `docs/adr/NNNN-*.md` | master plan, design.md |
| Phase order and scope | `docs/taha-personal-platform-development-master-plan-fa.md` | task specs |
| Execution checkboxes | `Task-list.md` | master plan |
| Which spec is active | `docs/plan/README.md` | S-Plan, backlog |
| Navigation / URL rules | `docs/contracts/IA-CONTRACT.md` | design.md |
| Tokens, spacing, colour rules | `docs/contracts/DESIGN-CONTRACT.md` + `apps/web/src/styles/global.css` | design.md |
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
| `docs/contracts/` | Short binding cards for IA and design | Change only with the owning deep doc |
| `docs/governance/` | Release, documentation, deploy, backup, incident, server policy | Policy change needs owner approval |
| `docs/adr/` | Architecture decisions | Never rewrite an accepted decision; supersede it |
| `docs/plan/` | Task Specs and planning briefs | See `docs/plan/README.md` for active vs archived |
| `docs/status/` | Ledgers: work log, risks, debt, deferred, known issues, changelog, backlog | Append; never delete history |
| `docs/templates/` | Task Spec template | Copy, do not edit in place |

Deep reference files live directly in `docs/`:
`design.md`, `user-journey-information-architecture.md`,
`taha-personal-platform-development-master-plan-fa.md`,
`taha-personal-platform-technology-architecture-baseline-fa.md`.

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
Open `docs/plan/README.md` and find the active Task Spec.
