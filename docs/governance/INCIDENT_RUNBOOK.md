# Incident Runbook & SLO Definitions

> Status: Active. Covers the static P1 site (Language Gateway + bilingual landing) served by Caddy from `/opt/taha/site/current` on the co-hosted VPS (Ubuntu 26.04 LTS, 2 vCPU / ~4 GiB RAM / 30 GB disk, 85.192.29.196). CMS runtime sections apply only when `infra/cms/docker-compose.cms.yml` is authorized and deployed (currently NOT-APPLIED — see RISK-0009).

## 1. SLO Definitions — Static Site

| Metric | Target | Measurement |
|---|---|---|
| Availability | 99.5 % (≤ 3.65 h downtime/month, planned + unplanned) | Uptime of `https://tahamohamadi.ir/health.json` returning 200 |
| Error rate | 5xx < 1 % of requests over a 5-minute window | Caddy access log or external check |
| Latency | p95 < 2 s for HTML pages | Network/server latency; static artifact is served instantly by Caddy |
| Deploy frequency | At most 1 production deploy/day (static artifact); CMS deploys weekly when runtime is live | `deploy.log` entries |

SLO breaches are reviewed by the owner after each incident. No automated SLO budget tracking exists yet.

## 2. Monitoring Points

| What | Where / How | Alert threshold |
|---|---|---|
| Caddy access & error logs | `journalctl -u caddy -n 100` or `/var/log/caddy/` if configured | Owner reviews on incident |
| Health endpoint | `curl -s https://tahamohamadi.ir/health.json` — expect 200 with `{"status":"ok",...}` | Non-200 or missing `"status":"ok"` |
| Disk usage | `df -h /` | Alert if > 80 % used (30 GB disk) |
| Memory | `free -m` | Alert if available < 500 MiB |
| Container health (CMS) | `docker compose -f infra/cms/docker-compose.cms.yml ps` | Any container unhealthy or restarting |
| SSH connectivity | `ssh -p 2222 deploy@85.192.29.196` | Cannot connect |
| DNS / HTTPS | `tahamohamadi.ir` resolves to VPS IP; HTTPS cert valid | Resolution failure or cert expiry < 7 days |

### Health endpoint contract

```json
{"status":"ok","service":"static","version":"<semver>"}
```

Returned by `apps/web/src/pages/health.json.ts` (prerendered static JSON). No secrets or internal paths are exposed.

## 3. Alert Channels

No automated alerting infrastructure exists. The owner performs manual checks. A monitoring service (e.g., UptimeRobot free tier) could be added later — no implementation is planned now. No agent may sign up for any monitoring service; provider selection and account creation are owner-only steps.

## 4. Incident Severity Classification

| Severity | Definition | Response time |
|---|---|---|
| **SEV-1** | Site completely down — 5xx responses or no response from `tahamohamadi.ir` | Immediate — owner SSH |
| **SEV-2** | Site degraded — 5xx spike, slow responses, one locale down | Investigate within 1 hour |
| **SEV-3** | Non-user-visible — CI failure, disk usage warning, pending OS updates, cosmetic issues | Next business day |

## 5. Runbooks — Static Site

### SEV-1: Site completely down

1. SSH to VPS: `ssh -p 2222 deploy@85.192.29.196`
2. Check Caddy status: `systemctl status caddy`
3. Check the symlink: `ls -la /opt/taha/site/current` — should point to a valid release directory
4. Check disk: `df -h /` — if > 80 %, free space before proceeding
5. Check recent Caddy logs: `journalctl -u caddy -n 50 --no-pager`
6. Check last deploy: `cat /opt/taha/site/deploy.log | tail -5`
7. If a bad deploy caused the outage, rollback:

   ```bash
   # identify previous release
   ls /opt/taha/site/releases/
   # restore symlink (replace <previous> with actual directory name)
   sudo ln -sfn /opt/taha/site/releases/<previous> /opt/taha/site/current
   # validate and reload Caddy
   sudo /opt/taha/bin/caddy-apply.sh
   ```

8. Verify recovery: `curl -s https://tahamohamadi.ir/health.json`
9. Run smoke script: `bash infra/deploy/smoke.sh https://tahamohamadi.ir`
10. Log incident to `docs/status/WORK_LOG.md`.

### SEV-2: Site degraded

1. Perform SEV-1 checks 1–6.
2. Run the smoke script: `bash infra/deploy/smoke.sh https://tahamohamadi.ir`
3. Check health endpoint body: `curl -s https://tahamohamadi.ir/health.json` — verify `"status":"ok"`
4. Check Caddy config syntax: `caddy validate --config /etc/caddy/Caddyfile`
5. If config is valid, restart Caddy: `systemctl restart caddy`
6. Verify recovery with smoke script.
7. Log incident to `docs/status/WORK_LOG.md`.

### SEV-3: Non-user-visible

1. Log the issue to `docs/status/WORK_LOG.md` with ID and description.
2. If a risk or deferral applies, register in `docs/status/RISK_REGISTER.md` or `docs/status/deferred-validation.md`.
3. Schedule fix for next business day or appropriate phase.

## 6. CMS Runtime Incident Runbooks

> These apply only when the CMS is deployed via `infra/cms/docker-compose.cms.yml` (currently NOT-APPLIED — blocked per RISK-0009 and AGENTS.md gate).

### Container down

1. Check container status: `docker compose -f infra/cms/docker-compose.cms.yml ps`
2. Check logs: `docker compose -f infra/cms/docker-compose.cms.yml logs cms --tail 50`
3. Check DB logs: `docker compose -f infra/cms/docker-compose.cms.yml logs db --tail 50`
4. Restart services: `docker compose -f infra/cms/docker-compose.cms.yml up -d`
5. Verify: containers show `Up (healthy)`.

### Database issues

1. Check DB readiness: `docker compose -f infra/cms/docker-compose.cms.yml exec db pg_isready -U $POSTGRES_USER -d $POSTGRES_DB`
2. Check disk: `df -h /` — PostgreSQL data lives in a Docker volume; host disk exhaustion affects it
3. Verify connection string in `.env` (never print secrets; check key names only)
4. If DB is down, restart the db service: `docker compose -f infra/cms/docker-compose.cms.yml restart db`

### Admin access issues

1. Verify MFA device exists (owner attestation required)
2. Check OTPMiddleware logs: `docker compose -f infra/cms/docker-compose.cms.yml logs cms | grep -i otp`
3. Expected behavior: anonymous access to `/admin/` redirects to login page
4. If login fails, check Django logs for auth errors

## 7. Escalation

All incidents escalate to the project owner. No automated remediation exists. The `deploy` user's NOPASSWD sudo is limited to `/opt/taha/bin/update-release.sh` and `/opt/taha/bin/caddy-apply.sh`; any other sudo action requires the owner's password.

## 8. Related Documents

- `docs/governance/DEPLOY_RUNBOOK.md` — deploy mechanics and rollback
- `docs/governance/RELEASE_POLICY.md` — release types and gates
- `docs/status/RISK_REGISTER.md` — RISK-0005 (patch posture), RISK-0006 (SSH surface), RISK-0009 (CMS runtime)
- `infra/deploy/smoke.sh` — HTTP smoke checks
- `infra/cms/docker-compose.cms.yml` — CMS Compose topology (NOT-APPLIED)
