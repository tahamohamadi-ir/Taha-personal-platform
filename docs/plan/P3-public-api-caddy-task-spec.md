# Task Spec — P3/P4 public Caddy `/api/` + `/media/` edge (DEFER-0017)

**Status:** OPEN (repo snippet + runbook ready; owner VPS apply pending)  
**ID:** P3-public-api-caddy  
**Related:** DEFER-0017, P4-blog-writing-task-spec, P5-research-task-spec, P6 case studies, ADR-0020, LOG-0137

## Goal

When the owner authorizes public read-only CMS APIs and published media, add Caddy
handles for `/api/` and `/media/` on `tahamohamadi.ir` so:

1. Build-time `CMS_API_BASE=https://tahamohamadi.ir` works from CI or off-VPS builders.
2. Featured images and renditions load on blog/research/projects pages.
3. Draft/private/inactive assets remain blocked by CMS projection (not Caddy).

Until this Task Spec is **owner-approved and applied**, keep `/api/` and `/media/`
unpublished. Astro builds use loopback `CMS_API_BASE=http://127.0.0.1:18000` on
the VPS only (`infra/deploy/build-static-with-cms.sh`).

## Scope

### In (repo — done in this slice)

- [x] Optional Caddy fragment: `infra/cms/Caddyfile.cms.api.snippet`
- [x] Cross-reference in `infra/cms/Caddyfile.cms.snippet` and README
- [x] Build/deploy runbook: `build-static-with-cms.sh`, `rebuild-static.sh`
- [x] Smoke helper: `infra/deploy/smoke-blog.sh`
- [x] This Task Spec + ledger links

### In (owner — required to CLOSE DEFER-0017)

- [ ] Owner approves opening read-only `/api/` + `/media/` on production
- [ ] Merge `Caddyfile.cms.api.snippet` into `/etc/caddy/Caddyfile` **before**
      `import taha_application_routes`
- [ ] `sudo caddy validate --config /etc/caddy/Caddyfile && sudo systemctl reload caddy`
- [ ] Verify:
  - `curl -sS https://tahamohamadi.ir/api/articles/en | head` → JSON 200 (may be `[]`)
  - `curl -sI https://tahamohamadi.ir/media/...` → 200 for a published rendition only
  - Draft article slug → 404 at public URL
  - `/admin/login/` still Wagtail 200; `/health.json` still static artifact
- [ ] Rebuild static with `CMS_API_BASE=https://tahamohamadi.ir`:
      `bash infra/deploy/rebuild-static.sh`
- [ ] Record non-secret evidence in WORK_LOG (PASS/FAIL only)

### Out

- Write APIs, contact persistence, upload from public web
- Rate limiting at Caddy (optional follow-up; Ninja read-only today)
- RSS/Atom (`DEFER-0018`)
- Opening `/rebuild-trigger/` at the edge (stays CMS-internal / disabled)

## Caddy apply (owner copy-paste)

```bash
# 1. Backup
sudo cp -a /etc/caddy/Caddyfile "/etc/caddy/Caddyfile.pre-api.$(date -u +%Y%m%dT%H%M%SZ)"

# 2. Insert infra/cms/Caddyfile.cms.api.snippet handles inside tahamohamadi.ir
#    site block BEFORE import taha_application_routes (same order as admin/static/health)

# 3. Validate + reload
sudo caddy validate --config /etc/caddy/Caddyfile
sudo systemctl reload caddy

# 4. Smoke
bash /home/deploy/cms-repo/infra/deploy/smoke-cms.sh https://tahamohamadi.ir
bash /home/deploy/cms-repo/infra/deploy/smoke-blog.sh https://tahamohamadi.ir
curl -sS -o /dev/null -w "%{http_code}\n" https://tahamohamadi.ir/api/articles/en
```

## Static rebuild with CMS content (owner, after migrate + publish)

```bash
cd /home/deploy/cms-repo
git pull --ff-only origin main

# CMS must be on current image with migrations 0002–0004 applied
export CMS_IMAGE=ghcr.io/tahamohamadi-ir/taha-cms:<sha>
sudo -n /opt/taha/bin/update-cms.sh "$CMS_IMAGE"

# Loopback build (works without public /api/)
bash infra/deploy/rebuild-static.sh

# Or build-only:
# SKIP_DEPLOY=1 bash infra/deploy/rebuild-static.sh
```

## Rollback

1. Restore Caddy backup; validate; reload (removes public `/api/`/`/media/`).
2. `sudo -n /opt/taha/bin/update-release.sh /opt/taha/site/releases/<previous-release>`.
3. CMS image rollback via `update-cms.sh` with previous tag if needed.

## Acceptance criteria

- Repo documents exact Caddy blocks, build commands, and smoke paths.
- Owner evidence closes DEFER-0017 when applied + rebuild smoke PASS.
- No secrets in Git or WORK_LOG.
