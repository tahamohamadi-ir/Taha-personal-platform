# ADR-0014: Admin route and security boundary

**Status:** Accepted for route; security implementation deferred to P0-A/P3.  
**Date:** 2026-08-14

## Decision

- The CMS/admin route is `/admin/` behind the same origin.
- Admin is not public content: it is noindex, authenticated and authorized server-side, and excluded from the static public path.
- Before a production admin is exposed, MFA, least-privilege roles, session/CSRF policy, rate limiting and minimal audit logging must be implemented and verified.

## Consequences

The selected path does not reduce the security requirements. `/admin/` must not be linked or treated as an obscurity-based protection mechanism.
