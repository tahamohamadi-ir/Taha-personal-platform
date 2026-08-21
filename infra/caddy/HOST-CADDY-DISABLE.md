# Host Caddy disable path (ADR-0027 Slice 4 / DEFER-0031)

When Compose service `caddy` (profile `edge`) owns public **80/443**, host
systemd Caddy must not bind those ports.

## Preferred (production)

```bash
# 1. Timestamped backup of the live host config
sudo cp -a /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.bak-$(date +%Y%m%d%H%M%S)"

# 2. Stop and disable host Caddy so Compose can bind 80/443
sudo systemctl disable --now caddy

# 3. Confirm ports are free
sudo ss -lntp | grep -E ':80|:443' || echo "80/443 free"
```

Do **not** leave host Caddy running with an empty site block “just in case” —
two processes fighting for 80/443 will fail the cutover.

## After disable

- CD must use repository variable `CADDY_EDGE=compose` so Actions reloads
  Compose Caddy (`Caddyfile.compose`) instead of `caddy-sync.sh` → host.
- Loopback `127.0.0.1:13080` / `127.0.0.1:18000` remain published for smoke and
  rollback diagnostics.

## Rollback to host Caddy

See `docs/governance/DEPLOY_RUNBOOK.md` § “Caddy-in-Compose cutover” (rollback
rehearsal). Short form:

```bash
cd /home/deploy/cms-repo
docker compose -f infra/cms/docker-compose.cms.yml --profile edge stop caddy
sudo cp -a /etc/caddy/Caddyfile.bak-YYYYMMDDHHMMSS /etc/caddy/Caddyfile
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl enable --now caddy
bash infra/deploy/smoke-cms.sh https://tahamohamadi.ir
```
