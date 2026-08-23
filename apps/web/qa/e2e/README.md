# Playwright content lifecycle + ADM QA matrix

Browser suites against a disposable CMS:

- `content-lifecycle.spec.ts` — create → publish → public `fa`/`en` JSON (`DEFER-0026` CLOSED)
- `admin-qa-matrix.spec.ts` — RTL/keyboard/noindex/LTR slug/bulk archive (`DEFER-0032` PARTIAL)

Manual remainder: `docs/plan/manual-test-checklists/adm-qa-s6.md`.

## Prerequisites

- Python 3.12 + `uv` in `apps/cms`
- Node 24 + npm in `apps/web` and `apps/cms/admin-frontend`
- Bash (Git Bash on Windows is fine for `run_e2e_stack.sh`)

## Local run

```bash
# 1) Build admin SPA (served by Django at /admin/)
cd apps/cms/admin-frontend && npm ci && npm run build && cd ../../..

# 2) Install web QA deps + Chromium
cd apps/web && npm ci
npx playwright install chromium

# 3) Run suite (starts migrate + seed + runserver via webServer)
npm run test:e2e
```

E2E settings enable `FEATURE_ADMIN_BULK_ARCHIVE` for the bulk archive UI/spec.
Production must keep that flag **off** unless the owner enables it.

Fixture login (not production secrets):

| Field | Value |
|-------|-------|
| Email | `e2e@example.com` |
| Password | `e2e-pass-not-a-real-secret` |
| TOTP key | RFC 6238 example hex (see `fixtures/credentials.ts`) |

Override with `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD`, `E2E_TOTP_KEY_HEX` if needed.

Point at an already-running CMS (skip webServer):

```bash
CMS_BASE_URL=http://127.0.0.1:8000 npm run test:e2e
```

Optional static HTML check after a rebuild (skipped when unset):

```bash
PUBLIC_BASE_URL=http://127.0.0.1:4321 npm run test:e2e
```

Artifacts: `qa/playwright-report/` (HTML), `qa/test-results/` (trace/video on retry).

## CI

Job `playwright-lifecycle` in `.github/workflows/ci-cms.yml` builds the admin
SPA, installs Playwright Chromium, and runs `npm run test:e2e` from `apps/web`.
