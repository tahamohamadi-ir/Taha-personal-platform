#!/usr/bin/env python3
"""Prepend a WORK_LOG entry without Windows StrReplace em-dash corruption."""

from pathlib import Path

ENTRY = """## LOG-0208 — 2026-08-22 — Goal completion audit (VPS re-attestation)

- Outcome: Completion audit for ADR-0027 Slice 3 / DEFER-0027 / DEFER-0031 / DEFER-0016 / rich blocks v2 / OpenAPI / RISK-0005-0006. **Repo:** `main` at `3572230`; PRs #79–#84 merged. **VPS SSH** `deploy@85.192.29.196:2222` (key `taha-cd-deploy`): CMS health `{"status":"ok","db":"ok"}`; image `ghcr.io/tahamohamadi-ir/taha-cms:e2cd1b6`; `smoke-cms.sh` → **PASS**; `REBUILD_TRIGGER_ENABLED=true` in container; `REBUILD_TRIGGER_SECRET` length 44; bad rebuild token → **403**. **`PREVIEW_SHARE_SECRET` empty** (length 0). Host Caddy **active**; no Compose `caddy`; `sudo -n` → password required; apt upgradable **14**; SSH listens **22+2222**. Live `/en/about/` meta `cms-build-origin=cms`; anonymous `/api/v1/admin/openapi.json` → **404**.
- Why: Independent attestation before closing the multi-item goal; confirm LOG-0207 state still holds.
- Scope / files: VPS read-only checks; `DEPLOY_RUNBOOK.md` HMAC row sync; this entry.
- Commands or actions actually performed: SSH attestation; `curl` public probes from agent host.
- Verification actually performed and result: Evidence matches LOG-0207 for HMAC/CMS; blockers unchanged for Caddy cutover, preview secret, apt, SSH ports.
- Deferred or risk IDs: `DEFER-0027` **CLOSED**; `DEFER-0031`/`RISK-0013` **OPEN** (sudo); `DEFER-0016` repo **CLOSED** / production secret **OPEN**; `RISK-0005` **OPEN** (14 packages); `RISK-0006` **OPEN** (22+2222).
- Rollback / recovery: No VPS changes this session.

"""

WORK_LOG = Path(__file__).resolve().parents[1] / "docs" / "status" / "WORK_LOG.md"
text = WORK_LOG.read_text(encoding="utf-8")
marker = "# Work Log\n\n"
if not text.startswith(marker):
    raise SystemExit(f"Unexpected WORK_LOG header in {WORK_LOG}")
WORK_LOG.write_text(marker + ENTRY + text[len(marker) :], encoding="utf-8")
print(f"Prepended LOG-0208 to {WORK_LOG}")
