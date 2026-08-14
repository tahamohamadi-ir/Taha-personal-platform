# ADR-0011: Bilingual URL and locale behavior

**Status:** Accepted.  
**Date:** 2026-08-14

## Decision

- `/` is a Language Gateway; it is not a content homepage.
- `/fa/` is Persian/RTL and `/en/` is English/LTR; both are direct entry points.
- Browser preference may suggest or remember a language choice but never forces a geo/IP/browser redirect.
- The language switcher remains visible. Missing translation is explicit and offers a locale parent or the original-language page; it is never a silent fallback or unrelated redirect.
- Each locale has its own canonical URL and may have a different slug.

## Consequences

Future CMS/API and frontend routes must maintain translation identity, locale-specific status, canonical and hreflang only for published/public equivalents.
