# Dev Environment Modes + Clean-Cutover Policy (shared by Tracks WF / BK / AB / AF)

> Goal (FA): Ø¯Ùˆ Ø­Ø§Ù„Øª ØªØ³Øª Ù„ÙˆÚ©Ø§Ù„ (Ø¨Ú©Ù†Ø¯+Ø¯ÛŒØªØ§Ø¨ÛŒØ³ Ø±ÙˆÛŒ Ù„Ù¾â€ŒØªØ§Ù¾ØŒ ÛŒØ§ ÙØ±Ø§Ù†Øª Ù„ÙˆÚ©Ø§Ù„ + Ø¨Ú©Ù†Ø¯ Ø³Ø±ÙˆØ±) Ø¢Ù…Ø§Ø¯Ù‡ Ø´ÙˆØ¯Ø› Ø¨Ø¹Ø¯ Ø§Ø² Ø¬Ø§ÛŒÚ¯Ø²ÛŒÙ†ÛŒ Ù¾Ø±ÙˆÚ˜Ù‡Ù” Ø¬Ø¯ÛŒØ¯ Ù‡Ù… Ø¨ØªÙˆØ§Ù† Ú©Ø¯ Ø¨Ø¯ÙˆÙ†â€ŒØ§Ø³ØªÙØ§Ø¯Ù‡ Ø±Ø§ Ø¨Ø§ ÛŒÚ© Ø±ÙˆØ´ Ù…Ø´Ø®Øµ Ùˆ Ø§ÛŒÙ…Ù† Ù¾Ø§Ú© Ú©Ø±Ø¯.
> This file is the SHARED environment contract. Every packet in the four track lists reads Â§1â€“Â§3 before its first command.

---

## 1. Running modes

| Mode | Name | Frontend | Backend | Database | Use when |
|---|---|---|---|---|---|
| S | **SNAPSHOT** (default today) | `apps/web` local build | â€” none | â€” none | Pure token/component/template work with fixture data; fastest loop, zero risk. `CMS_API_BASE` unset â†’ committed snapshots used. |
| A1 | **LOCAL stack (host-run CMS)** | astro dev/preview on `:4321` | Django runserver on host `:18000` via `uv` | Postgres docker container on `:15432` | Need real API writes/reads + admin SPA testing. Recommended main mode from BK-01 onwards. |
| A2 | **LOCAL stack (fully dockered)** | same | cms container built from source | same container inside compose | Final pre-merge rehearsal closer to prod shape; slower rebuilds. |
| B | **HYBRID remote** | local build/preview | **production** `https://tahamohamadi.ir` | production Postgres | Late-stage visual QA with real published data. READ-ONLY usage rules apply (Â§5). |

Staging does NOT exist (ADR-0025). Modes A1/A2 are its replacement during development.

## 2. One-time dev infrastructure â€” packet DEV-00 (owner: integration lead ONLY)

Other tracks CONSUME DEV-00 outputs; they never edit these files:

- CREATE `infra/cms/docker-compose.local.yml` â€” a laptop-sized Compose file:
  - Project name `taha-local` (`name: taha-local` key or `-p taha-local`).
  - Service `db`: image `postgres:17-alpine`, port map `15432:5432`, env `POSTGRES_USER=taha`, `POSTGRES_PASSWORD=taha_local_only`, `POSTGRES_DB=taha`, volume `taha-local-db-data:/var/lib/postgresql/data`, healthcheck `pg_isready -U taha`.
  - NOTE: the prod `admin` container (ADR-0032) is intentionally ABSENT here — AF develops via vite dev in mode A1; add an `admin` service only when rehearsing the nginx admin image. Service `cms` (used by mode A2 only): build context `../../apps/cms`, Dockerfile `Dockerfile.cms`, env `DJANGO_SETTINGS_MODULE=config.settings.local`, `DATABASE_URL=postgres://taha:taha_local_only@db:5432/taha`, depends_on `db: condition: service_healthy`, port `18001:18000`. Do NOT mount prod secrets. No caddy/web here.
- CREATE `infra/deploy/dev-local-stack.ps1` with subcommands: `up-db`, `down`, `reset-db` (`docker compose ... down -v`), each printing the exact executed command.
- Verify: `docker compose -f infra/cms/docker-compose.local.yml config` exits 0 with no `${VAR:?}` errors; `dev-local-stack.ps1 up-db` reaches healthy within 60 s (`docker inspect --format={{.State.Health.Status}} taha-local-db-1` = healthy).

Docker Compose files ending `.local.yml` must be added to no secret scans and contain zero real credentials (the password above is throwaway-local only). `.env` stays untracked per repo policy.

## 3. Packet BK-L0 â€” local Django settings profile (owner: Track BK)

Tiny agents executing BK-00 create this BEFORE any model work so all later verification runs against local Postgres:

1. Read existing `apps/cms/config/settings/test.py` and base settings first; mirror their import style exactly.
2. CREATE `apps/cms/config/settings/local.py`: inherits the project's common/base settings; sets `DEBUG=True`, `ALLOWED_HOSTS=["127.0.0.1","localhost"]`; `DATABASES` parsed from env `DATABASE_URL` with default `postgres://taha:taha_local_only@127.0.0.1:15432/taha`; adds `localhost:4321` to CSRF trusted origins list if that setting exists.
3. Verify sequence (record raw output in WORK_LOG):
   ```powershell
   cd apps/cms
   $env:DJANGO_SETTINGS_MODULE="config.settings.local"
   uv sync --python 3.12
   uv run python manage.py migrate          # against the healthy container DB
   uv run python manage.py createsuperuser  # local throwaway credentials, typed interactively
   uv run pytest -q                         # suite stays green
   ```
4. Commit message: `feat(cms): add local development settings profile`.

## 4. Mode A1 quickstart (daily driver)

```powershell
# Terminal 1 â€” database + optional services
pwsh infra/deploy/dev-local-stack.ps1 up-db

# Terminal 2 â€” Django API/admin on :18000
cd apps/cms
$env:DJANGO_SETTINGS_MODULE="config.settings.local"; $env:DATABASE_URL="postgres://taha:taha_local_only@127.0.0.1:15432/taha"
uv run python manage.py runserver 127.0.0.1:18000

# Terminal 3 â€” public frontend pointed at local backend
cd apps/web
$env:CMS_API_BASE="http://127.0.0.1:18000"; npm run build; npm run preview   # or: npm run dev
```

Sanity probe: `curl.exe http://127.0.0.1:18000/api/articles/fa` returns JSON 200 after any published article exists (see Â§6 seed options). Admin SPA for admin testing: `cd apps/admin; npm ci; npm run dev` then log in at the SPA login route using the throwaway superuser (TOTP not enforced locally unless enabled by that app's settings logic â€” do NOT fake TOTP codes).

Teardown every session end: `dev-local-stack.ps1 down`. Hard reset of data: `dev-local-stack.ps1 reset-db` then repeat migrate/create superuser.

## 5. Mode B hybrid â€” strict safety rules

```powershell
cd apps/web
$env:CMS_API_BASE="https://tahamohamadi.ir"; npm run build; npm run preview
```

- GET-only semantics arrive naturally because production exposes published projections; there is NO authenticated access from this mode. Never attempt logins against production from local scripts.
- Rate courtesy: â‰¤30 requests/minute from any loop (existing Ninja rate limiting may already answer `RATE_LIMITED` â€” treat as a hard stop, not an error to retry-spam).
- Anything requiring state mutation (create/publish/media upload/graph draft save) is IMPOSSIBLE in mode B by design â€” switch to mode A1.
- Record in WORK_LOG any 5xx observed (do not debug-prod from laptop).

## 6. Seed data options (mode A)

| Option | Command path | Privacy gate |
|---|---|---|
| Minimal manual | After A1 migrate+superuser: create one Article, one Project, one Publication through `/admin/` UI | none â€” synthetic content you type |
| Fixture round-trip | From an ALREADY-sanitized local DB: `uv run python manage.py dumpdata content media -o ../fixtures/local-seed.json` later reloaded with `loaddata` | Must contain zero personal contact data before commit; fixtures dir stays inside repo only if sanitized (state check in WORK_LOG) |
| Prod restore | Owner-gated ONLY: explicit owner approval + restic restore evidence path documented in WORK_LOG; NEVER automated | Owner approval mandatory; exposure reported without repeating secrets |

Default recommendation: minimal manual first; fixture once schema stabilizes at BK-06.

## 7. Clean-codebase / easy-delete architecture (the "ØªÚ©Ù…ÛŒÙ„ â†’ Ù¾Ø§Ú©" contract)

### 7.1 Zone map (also the ownership wall)

```text
apps/web/**                      â† new design lives here; legacy deleted per Â§7.3
apps/web/LEGACY-INVENTORY.md     â† deletion ledger (only WF-CLEAN writes final rows)
apps/cms/apps/content,media      â† additive models/migrations (BK); drops via Â§7.4 tickets
apps/cms/apps/api/admin_*        â† new admin endpoints (AB) â€” self-contained modules
apps/admin/src/**   â† SPA screens (AF); replaced screens deleted same-packet
infra/cms/*.local.yml            â† dev-only; deletable anytime, never referenced by prod deploy
```

Cross-boundary imports are forbidden except: AF/ABâ†’models (read), WFâ†’public API HTTP only. This keeps future deletion surface rectangular.

### 7.2 Adopt-equals-delete rule (all four tracks)

Any packet that replaces a visual/route/component/API behavior MUST delete the superseded artifact in the SAME commit: page file rewritten in place (WF), old component file `Remove-Item` + import sweep (verify with ripgrep over `apps/web/src`), or old SPA screen directory removed after route table update (AF). Deleting in a later separate commit is a defect; note it as `DEBT-*` if truly impossible.

### 7.3 LEGACY-INVENTORY mechanics (Track WF)

1. At WF-03, WF-04, each WF-07x close: append rows `<path> :: superseded-by <new-file-or-template> :: verified-deleted YES/NO(+reason)`.
2. Sweep helper commands (allowed, ephemeral npx tools â€” NOT added to package.json):
   ```powershell
   cd apps/web
   npx unimported                       # unused source files report
   npx depcheck --ignores=@types/*      # unused dependencies report
   node ../../scripts? none              # do not invent; rely on above two only
   ```
   If neither tool is network-available, fallback: `rg -l "<OldComponentName>" src` expecting zero hits.
3. WF-CLEAN (final packet, gated G9-pre): execute pending inventory rows, prune dead deps found by depcheck after owner confirms (`gsap`/`three` removal requires motion-governance note since they are bounded-authorized assets), delete empty directories, run full verify suite, update README/architecture tree snippet in `PROJECT_MANIFEST.md` repository-ownership block, commit `chore(web): remove superseded redesign leftovers`.

### 7.4 Schema-drop ticket protocol (Track BK)

Public API fields are append-only forever; DB columns follow different economics:

- Candidate drops accumulate as rows in `docs/plan/BK-DROP-TICKETS.md` (created by whoever notices: `<field> :: last-consumer <none-after-commit-sha> :: proposed-release <N+2>`).
- Removal executes only when: zero grep consumers across ALL tracks' zones, two released builds exist past the removal-of-last-consumer commit, and owner ticks the row. Migration must be forward-safe (`RemoveField`) with prior `dumpdata` backup evidence line appended in WORK_LOG.

### 7.5 Post-cutover physical cleanup (owner checklist, after production smoke PASS)

```text
[ ] git rm infra/cms/docker-compose.local.yml infra/deploy/dev-local-stack.ps1   (or keep if continuing dev)
[ ] delete worktrees listed in docs/status/_worktrees snapshot when packets closed
[ ] re-run npx depcheck; remove retired devDependencies in ONE chore commit
[ ] archive (git mv) none â€” prefer true deletion; history preserves everything
```

## 8. Cross-track conflict matrix (final)

| Resource | WF | BK | AB | AF |
|---|---|---|---|---|
| `apps/web/**` | WRITE | â€“ | â€“ | â€“ |
| `apps/cms/apps/{content,media}/** incl. migrations` | â€“ | WRITE | read-imports only | â€“ |
| `apps/cms/config/settings/**` | â€“ | WRITE (BK-L0) | â€“ | â€“ |
| public API view/url modules under `apps/cms/apps/api/public*` + public url block | â€“ | WRITE | â€“ | â€“ |
| `apps/api/admin_*` + admin url include (`apps/api/admin_urls.py`) | â€“ | â€“ | WRITE | â€“ |
| `config/urls.py` | â€“ | guarded `# [PUBLIC-API]` section only, once (BK baseline) | guarded `# [ADMIN-API]` include line once (AB-00) | â€“ |
| `apps/admin/**` | â€“ | â€“ | type-contract DOC only | WRITE |
| `infra/**` prod files | read-only | read-only | read-only | read-only |
| `infra/cms/docker-compose.local.yml`, `dev-local-stack.ps1` | consume | consume | consume | consume |
| ledgers `docs/status/*` | append | append | append | append |

Ledger append protocol across concurrent agents: insert new entry directly below the `## LOG-` header list top (chronological prepend style already used); conflicts resolve by re-running the ID allocation command and retrying the edit â€” never edit another agent's lines.

Escalation path for ANY ambiguity about boundaries: stop, post question in WORK_LOG `ESCALATE:` line referencing this Â§8 table; do not guess-edit.
