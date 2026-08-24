# Task Spec — P0A-01 read-only inventory of the existing VPS stack

**Status:** Pending owner execution (read-only; no server change).  
**Date:** 2026-08-14  
**Owner:** Project owner (executes from an operator/root shell)  
**Release type:** documentation-only inventory  
**Risk level:** Low (read-only)  
**Risk IDs:** `RISK-0004`, `RISK-0007` (updated with findings)

## Goal

Inventory the existing production stack — Caddy routing, Compose project names,
containers, networks, ports, volumes, static roots and resource usage — with
read-only commands, so that the static P1 deploy can be planned with a known
blast radius and rollback, without reading or logging any secret.

## In scope (read-only)

- Caddy service unit and Caddyfile location; hostnames/site blocks present.
- Docker Compose project name(s) and their containers/health.
- Container metadata: networks, published ports, mount points/volumes.
- Resource baseline: `free -m`, `df -h`, `docker stats --no-stream`.
- Current behavior: external `curl` for production root and staging hostname.

## Explicit non-goals / forbidden

- No file write, no `docker` state change, no service restart, no Caddy change,
  no DNS change, no package install/update.
- No reading, printing or logging of environment files, secrets, OAuth tokens,
  passwords, volume content or private data.

## Suggested read-only commands (owner executes; record summaries only)

```bash
systemctl status caddy --no-pager -l          # unit state
systemctl cat caddy | grep -i execstart       # unit path (no content secrets)
grep -rn '^[^#]*\b[a-z0-9.-]*\.\w*\.\w*' /etc/caddy/Caddyfile | head -50   # hostname blocks (adjust path from unit)
docker compose ls                             # project names
docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
docker inspect --format '{{.Name}} net={{range $k,$v := .NetworkSettings.Networks}}{{$k}} {{end}}' $(docker ps -q)
docker inspect --format '{{.Name}} mounts={{range .Mounts}}{{.Source}}->{{.Destination}} {{end}}' $(docker ps -q)
docker stats --no-stream                      # memory snapshot
free -m && df -h /
curl -sI https://tahamohamadi.ir/ | head -5
curl -sI https://staging.tahamohamadi.ir/ | head -5
```

## Acceptance criteria

- Recorded in `docs/status/WORK_LOG.md`: Caddy unit/Caddyfile path, Compose
  project name(s), container names/health, published ports, volume mount list
  (paths only), memory/disk baseline, and the exact rollback evidence for the
  current Caddyfile.
- `RISK-0004` (existing stack) is either closed with evidence or narrowed to a
  concrete remaining item; `RISK-0007` (capacity) gets a measured static-capacity
  decision.
- No secret or sensitive value appears anywhere in the ledger or chat.

## Rollback

- Read-only inventory has no rollback; nothing is changed on the server.
