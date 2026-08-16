# ADR-0020: P3 admin authentication and authorization boundary

**Status:** Accepted (2026-08-15, P3 code-first gate).

## Context

P3 introduces a Django/Wagtail admin at `/admin/` (same-origin) while the site
runs on a shared VPS with a public static frontend. The repo contracts require
least privilege, MFA before public admin exposure, no account enumeration and
no secrets in Git.

## Decision

- Use a custom `User` model (`apps/users`) with a unique `email` as the
  `USERNAME_FIELD`; no phone/role guessing fields in P3.
- `/admin/` is Wagtail admin, same-origin, server-authorized, and remains
  noindex; it is NOT exposed in this code-first slice.
- Password hashing: Argon2 first, PBKDF2 fallback; Django default password
  validators with `min_length = 12`.
- Admin security baseline in `apps/security`: `AuditLog` (login/admin
  mutations, never request bodies/secrets), cache-backed login rate limit
  (5 attempts / 5 min per IP → 429), read-only audit admin.
- MFA uses django-otp TOTP. Runtime UX (2026-08-16): Wagtail
  `OTPLoginForm`, enrollment at `/admin/account/two-factor/`, Account panel,
  and `MFAEnforcementMiddleware` that redirects staff without a confirmed
  device to enrollment (account/password still reachable). Recovery codes
  remain deferred.

## Consequences

- Admin surfaces are audited and rate-limited from day one; passwords and
  bodies are never logged.
- Any shared-cache dependency (Redis) for production rate limiting is deferred
  to the capacity decision (`RISK-0007`) — locmem cache is used in code.
- The custom user model is fixed before the first migration on a real DB;
  changing it later would be expensive.
