# Old pre-existing stack decommission — runbook (OWNER-executed)

> Status: prepared 2026-08-16. Owner-authorized to bring down the old stack.
> **Ready for owner (LOG-0215):** agent work is docs-only; do **not** ask an
> agent to SSH or stop containers. Linked from `docs/status/BACKLOG.md`
> (`Old-stack decommission`).
> This runbook is executed by the OWNER with interactive sudo (the `deploy`
> user's NOPASSWD sudo covers only `/opt/taha/bin/update-release.sh` and
> `/opt/taha/bin/caddy-apply.sh`; all `docker` commands below need the owner's
> password, e.g. in MobaXterm). No agent executes these commands.

## What is being decommissioned

The old pre-existing Compose project at `/opt/taha/repository/`
(`compose.yaml` / `compose.production.yaml`), currently running:

| Container | Image | Ports |
|---|---|---|
| `taha-prod-frontend-1` | `ghcr.io/tahamohamadi-ir/tahamohamadi-personal-website-frontend:36168a09…` | 127.0.0.1:13000 → 3000 |
| `taha-prod-backend-1` | `ghcr.io/tahamohamadi-ir/tahamohamadi-personal-website-backend:36168a09…` | 127.0.0.1:18080 → 8080 |
| `taha-prod-postgres-1` | `postgres:17-alpine` | none published |

These containers have no role in the current site: the public site is a static
Astro artifact served directly by Caddy from `/opt/taha/site/current`, and
Caddy does not reverse-proxy any of the old containers. `RISK-0004` closed
2026-08-16 with this inventory.

## Step 0 — pre-down inventory (owner, sudo)

```sh
cd /opt/taha/repository && sudo docker compose ps
sudo docker compose ls
```

- Record the running container names and the compose project name before
  anything is stopped.
- If the default project does not match the running containers (the project
  may use `compose.production.yaml`), repeat the commands with
  `-f compose.production.yaml` and use that file for the stop/down/up steps.
- Confirm the public site is currently 200 before starting:

```sh
curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/
```

## Step 1 — stop (not remove)

```sh
cd /opt/taha/repository && sudo docker compose stop
```

- Verify the public site is still served after stopping:

```sh
curl -s -o /dev/null -w "%{http_code}" https://tahamohamadi.ir/
```

Expect `200`. The site is served by Caddy from disk and does not depend on any
of these containers.

## Step 2 — down, volumes preserved (no `-v`)

```sh
cd /opt/taha/repository && sudo docker compose down
```

- **NEVER** pass `-v` (`docker compose down -v`) unless the owner has a
  confirmed, tested backup of the PostgreSQL data. Without `-v`, named volumes
  (including the postgres data volume) are preserved on disk.

## Step 3 — image prune (owner-confirmed only)

```sh
sudo docker image prune -f
```

- Runs ONLY if the owner confirms the images are no longer needed locally.
  Even after pruning, the frontend/backend images remain in
  `ghcr.io/tahamohamadi-ir/…` and can be pulled again if ever needed.

## Rollback / recovery

If the old stack must be restored:

```sh
cd /opt/taha/repository && sudo docker compose up -d
```

Volumes were preserved by `docker compose down` (no `-v`), so the postgres
data volume is still present and the stack comes back with its data.

## Warnings

- **PostgreSQL data:** never delete the postgres volume without a confirmed
  backup. `docker compose down` (no `-v`) is the only sanctioned down command.
- **Backups:** the restic repository and backup destination in
  `/opt/taha/backups` belong to the owner project — do not touch, do not
  stop the backup timer, do not reuse this stack's volumes as backup targets.
- **Images:** the frontend/backend images stay in ghcr for redeploy; pruning
  local images is optional and owner-only.
- **Caddy:** the static site is independent of this stack; no Caddyfile change
  is part of this decommission.
