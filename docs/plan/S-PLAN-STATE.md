# S-Plan State — execution tracker

> Single source of truth for task states. S-model edits ONLY its current task's
> line (IN_PROGRESS/BLOCKED + notes). L-model sets NEEDS_REVIEW→DONE. Append
> review notes in the Log section, never rewrite history.

## Tasks

| ID | Title | State | Assignee | Notes |
|---|---|---|---|---|
| A1 | Reusable smoke script | NEEDS_REVIEW | S-model | submitted for review 2026-08-15 |
| A2 | Production Caddy script (write only) | BLOCKED(owner) | — | needs owner approval to write+review before owner runs |
| A3 | Release decision record P1 | BLOCKED(A2) | — | — |
| A4 | Production switch (owner sudo) | BLOCKED(A2,A3,owner) | owner | — |
| A5 | Close R2 / P1-15 | BLOCKED(A4) | — | — |
| B1 | Pending updates inventory | BLOCKED(owner) | owner | paste count + caddy/docker package names only |
| B2 | SSH port decision | BLOCKED(owner) | owner | — |
| B3 | Uptime check definition | READY | S-model | docs only |
| B4 | Restore drill cadence | READY | S-model | docs only |
| C1 | Owner content inventory (P2) | BLOCKED(owner) | owner | bio/experience/education/skills/CV/Resume/contact per locale |
| C2 | Typed profile contract | BLOCKED(C1) | — | — |
| C3 | About pages | BLOCKED(C2) | — | — |
| C4 | Resume/CV pages + downloads | BLOCKED(C1) | — | — |
| C5 | Contact path | BLOCKED(owner) | owner | DEFER-0007 decision |
| C6 | Navigation update | BLOCKED(C3,C4) | — | — |
| C7 | P2 verification + release | BLOCKED(C6) | — | — |

## Review log (append-only)

| Date | Task | Verdict | Reviewer | Note |
|---|---|---|---|---|
| 2026-08-15 | A1 | submitted for review | S-model | smoke.sh verified against https://staging.tahamohamadi.ir --expect-noindex; all checks PASS |
