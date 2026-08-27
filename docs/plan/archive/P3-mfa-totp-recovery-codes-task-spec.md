# Task Spec — P3 TOTP recovery codes + device disable

**Status:** DONE (code + tests 2026-08-16; production rebuild owner follow-up)  
**ID:** P3-mfa-totp-recovery-codes  
**Related:** DEFER-0015 CLOSED, ADR-0020, LOG-0131, RISK-0009 CLOSED

## Goal

Staff who enrolled TOTP can store one-time recovery codes, regenerate them, sign in with a recovery code if the authenticator is unavailable, and disable MFA to re-enroll — without VPS `createsuperuser` as the only emergency path.

## Scope

- In: hashed recovery-code model, issue/reveal/regenerate/disable UX under `/admin/account/two-factor/`, login accepts recovery codes, audit events, tests, docs (close DEFER-0015).
- Out: public `/api/`/`/media/`, P4 blog, owner VPS rebuild (follow-up), SMS/email recovery, hardware keys (WebAuthn).

## Contracts

- ADR-0020: MFA remains django-otp TOTP; recovery codes are an additional factor for the same staff boundary.
- Codes are hashed at rest (`django.contrib.auth.hashers`); plaintext shown once after issue/regenerate.
- Consuming a recovery code marks it used and verifies the admin session via the user's confirmed TOTP device (`user.otp_device` + django-otp login signal).
- Disable requires an OTP-verified session and a current authenticator (or unused recovery) code.

## Acceptance criteria

- [x] After TOTP enroll confirm, staff see a one-time recovery-code reveal (10 codes); codes are not re-readable later.
- [x] Login with password + unused recovery code succeeds; reused code fails.
- [x] Enrolled OTP-verified staff can regenerate codes (invalidates unused prior codes) and disable MFA (deletes TOTP + recovery codes → redirect to setup).
- [x] AuditLog records `mfa.recovery_issued`, `mfa.recovery_used`, `mfa.disabled` (no plaintext codes in detail).
- [x] pytest green; ruff clean on touched paths.

## Validation

```powershell
cd apps/cms
uv sync --python 3.12
$env:DJANGO_SETTINGS_MODULE = "config.settings.test"
uv run ruff check apps/security tests/test_mfa.py
uv run pytest -q tests/test_mfa.py
uv run pytest -q
```

## Rollback

Revert the feature branch / deploy previous CMS image; unused recovery rows are harmless if TOTP devices remain.

## Documentation

- `docs/status/deferred-validation.md` (close DEFER-0015)
- `docs/status/WORK_LOG.md`, `CHANGELOG.md`, `BACKLOG.md`
- `docs/adr/0020-p3-admin-auth-boundary.md` (recovery note)
- `AGENTS.md` gate text
