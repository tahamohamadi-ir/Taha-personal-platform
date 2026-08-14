# ADR-0009: GitHub Actions hosted CI

**Status:** Accepted.  
**Date:** 2026-08-14

## Context

The canonical remote is a public GitHub repository. The production VPS has only 1 vCPU and 2 GB RAM, so co-locating Gitea or a runner would compete with public traffic and the planned CMS/database. Standard GitHub-hosted runners are free for public repositories.

## Decision

- GitHub is the canonical Git remote and GitHub Actions hosted standard runners are the CI baseline.
- Workflows will live under `.github/workflows/` when P0-A authorizes CI creation.
- CI produces short-lived build/test artifacts only; it does not hold production backups or long-lived secrets.
- Gitea and all self-hosted runners are explicitly not used initially.

## Consequences

- There is no Gitea server, database, runner lifecycle or runner privilege to operate on the VPS.
- If the repository becomes private, Actions minutes/storage and budget must be reviewed before continuing with the same policy.
- A future move to self-hosted CI requires a new ADR, cost/resource evidence and a non-production runner location.
