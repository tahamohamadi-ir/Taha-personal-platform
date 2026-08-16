# Task Spec — P3 Wagtail TOTP enrollment UI

**Status:** DONE (code + tests + production enroll 2026-08-16)  
**ID:** P3-mfa-totp-enrollment  
**Related:** RISK-0009 CLOSED, ADR-0020, DEFER-0015, LOG-0128, LOG-0129

## Goal

Staff can enroll TOTP from Wagtail Account and must use an authenticator code at login after enrollment. Close the gap where Account showed Password only and `/admin/otp_totp/…` 404'd.

## Scope

- In: Wagtail login form OTP fields, `/admin/account/two-factor/` + QR, Account panel/menu, MFA middleware redirect-to-setup, `qrcode` dependency, tests, docs.
- Out: recovery codes (DEFER-0015), public `/api/`/`/media/`, P4 blog, owner password rotation on VPS.

## Acceptance criteria

- [x] Account Profile shows Two-factor authentication panel with setup link.
- [x] Unenrolled staff hitting `/admin/` redirect to setup; `/admin/account/` still reachable.
- [x] Enrollment confirms device; login without OTP fails once enrolled; with OTP succeeds.
- [x] Enrolled password-only session cannot fetch QR for confirmed secret.
- [x] pytest green; ruff clean.

## Validation

```powershell
cd apps/cms
uv sync --python 3.12
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check .
uv run pytest -q
```

## Production follow-up (owner)

1. ~~`git pull` + `CMS_BUILD=1 bash infra/deploy/update-cms.sh`~~ DONE
2. ~~Change admin password (12+ chars)~~ DONE (owner attestation)
3. ~~Open `/admin/account/two-factor/`, enroll, confirm~~ DONE (owner attestation)
4. ~~Sign out/in with OTP~~ DONE — RISK-0009 CLOSED (LOG-0129)
