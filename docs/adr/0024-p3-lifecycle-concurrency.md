# ADR-0024: P3 content lifecycle and edit-concurrency

**Status:** Accepted (2026-08-15, P3 code-first gate).

## Context

P3 content (Landing/Profile/Article shell) needs a lifecycle
(draft → review → published → archived) and public projections that never leak
drafts/private data. Concurrent edits must never silently overwrite.

## Decision

- Lifecycle is a first-class enum (`LifecycleStatus`: draft/review/published/
  archived) on a shared mixin, with `published_at` and timestamps; a single
  `public()` queryset (`status=published` AND `published_at <= now`) is the
  ONLY public projection path.
- Translation identity: `locale` (fa/en) + `slug` unique together via DB
  `UniqueConstraint`; duplicate slug in the same locale is rejected.
- No polymorphic/EAV/JSON tables; plain Django models with explicit indexes
  on `(locale, slug, status)`.
- Edit-concurrency: last-write-wins is NOT accepted for CMS edits. The
  optimistic-lock / version-field mechanism is deferred to the P7 admin
  revision contract (P7-01); until then edits are single-editor and reviewed
  via the admin audit log (`ADR-0020`).

## Consequences

- Projections are provably leak-free (tested negative for drafts and future
  `published_at`).
- A later revision/versioning feature builds on the lifecycle without a data
  shape rewrite.
