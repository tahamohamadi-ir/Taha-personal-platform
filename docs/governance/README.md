# Governance index

Goal:
You open the right policy or runbook on the first try.

Rule:
Policy files say **what must be true**. Runbooks say **how to do it**.
A runbook never overrides a policy. If they disagree, the policy wins and the
runbook is a defect — report it.

---

## Read order

1. `AGENTS.md` (repository root) — non-negotiable contracts.
2. `docs/README.md` — which file owns which fact, and the STOP conditions.
3. `PROJECT_MANIFEST.md` — approved versions and canonical commands.
4. The one file below that matches your task.

---

## Files

| File | Use it when | Type |
|---|---|---|
| `RELEASE_POLICY.md` | Deciding whether work may ship. Risk classes, Minimum Safe Gate, release DoD. | Policy |
| `DOCUMENTATION_POLICY.md` | Recording what you did. Which ledger, LOG-ID allocation, deferred-work rules. | Policy |
| `BACKUP_POLICY.md` | Deciding what must be backed up and what counts as restore evidence. | Policy |
| `DEPLOY_RUNBOOK.md` | Building, deploying, smoking or rolling back an artifact. | Runbook |
| `BACKUP_RUNBOOK.md` | Running a backup or an isolated restore rehearsal. | Runbook |
| `INCIDENT_RUNBOOK.md` | The site or CMS is down or degraded. SLOs and severity ladders. | Runbook |
| `SERVER_ACCESS_RUNBOOK.md` | Reaching the VPS. Canonical operator account and scoped sudo. | Runbook |

---

## Facts that repeatedly go stale — check before you trust a sentence

| Fact | Current answer |
|---|---|
| Staging | **Does not exist.** Decommissioned by ADR-0025. Ignore every staging URL, smoke step and restore target in any document. |
| Release gate | CI green plus production smoke. There is no staging smoke step. |
| CMS runtime | Live. `/admin/*`, `/static/*`, `/health/*` proxied. Published-only `/api/` is live (`DEFER-0017` CLOSED). `/media/` is proxied; upload stays unpublished. |
| Restore target | A disposable isolated container or directory — never production, never a staging host. |
| Operator account | `deploy`, key-only, with sudo scoped to two fixed scripts. |
| `/health.json` vs `/health/` | `/health.json` is the static artifact. `/health/` is the CMS. Caddy must match `/health/*`, never `/health*`. |

If you find a sentence that contradicts this table, fix the sentence in the same
task and record it in `docs/status/WORK_LOG.md`.

---

## Changing a policy

A policy change needs owner approval and its own Task Spec. Do not soften a gate
to make a task pass. If a gate blocks you, that is the gate working — stop and
report it.
