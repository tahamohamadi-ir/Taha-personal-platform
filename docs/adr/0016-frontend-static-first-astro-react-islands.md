# ADR-0016: Public frontend is static-first Astro with optional React islands

**Status:** Proposed.  
**Date:** 2026-08-14

## Context

The public site must remain readable without JavaScript, ship a bilingual
`/fa/` and `/en/` locale tree behind a `/` Language Gateway, and be served
directly from Caddy as a static artifact without a Node.js production runtime.
The approved baseline already names Astro + TypeScript + React Islands, but the
boundary between server/static HTML and client-hydrated islands was not yet
recorded as a decision.

## Decision

- The public site is built with Astro as a static-first site; the primary HTML
  and main content MUST render and remain navigable without client JavaScript.
- React is used only as an island (`client:*` component) when a concrete,
  tested, valuable interaction is approved; it is never the page shell.
- In R2 (P1 Language Gateway + bilingual landing) no React island is installed;
  all interactions are static links, so no client bundle is required.
- TypeScript is used for source; build-time validation covers the typed static
  content contract for `fa` and `en`.

## Consequences

- The `apps/web/` output is a plain static artifact served by Caddy; there is no
  Node.js public runtime.
- Adding React, Tailwind, shadcn/Radix or motion libraries later requires a
  dedicated, tested slice and a Task Spec; none are assumed present in R2.
- Public content readability without JS is a release gate, not a progressive
  enhancement.
