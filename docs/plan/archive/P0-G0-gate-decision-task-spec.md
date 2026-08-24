# Task Spec — G0-02/G0-03/G0-06 gate decision and P0-G0 PASS (static-only P1)

**Status:** Completed as a governance/decision slice.  
**Date:** 2026-08-14  
**Owner:** Project owner  
**Release type:** `FAST-TRACK` documentation-only  
**Risk level:** Low  
**Risk IDs:** `RISK-0001` (closed), `RISK-0003` (limited acceptance)

## Goal

Record the owner's first-live decisions and formally move the gate to
`P0-G0: PASS for static-only P1`, which authorizes the `apps/web/` scaffold for
the static P1 release only.

## In scope

- Record the limited `RISK-0003` acceptance for a static-only P1 (reason, expiry
  trigger, mitigation, backup evidence, fallback) in `docs/status/RISK_REGISTER.md`.
- Close `RISK-0001` with the PASS evidence.
- Update `PROJECT_MANIFEST.md` and `AGENTS.md` current-gate sections.
- Create the `fa`/`en` content pack proposal `docs/plan/P0-G0-content-pack-proposal.md`
  (owner approves each locale before production; no fabricated links/metrics/evidence).
- Append WORK_LOG entries.

## Non-goals

- No scaffold, dependency, API/schema, Docker/Caddy, DNS, VPS, backup, CI or
  deployment yet. The PASS authorizes scaffold but does not perform it here.
- No full CMS PASS is claimed.

## Allowed files

- `docs/status/RISK_REGISTER.md`, `docs/status/WORK_LOG.md`
- `PROJECT_MANIFEST.md`, `AGENTS.md`
- `docs/plan/P0-G0-content-pack-proposal.md`, this Task Spec

## Verification

- `git diff --check` passes.
- Risk Register rows and Manifest/AGENTS gate text reflect the PASS without
  claiming a CMS PASS.

## Rollback

- Documentation-only; reversible via Git.
