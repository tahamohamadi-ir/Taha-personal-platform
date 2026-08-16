# ADR-0022: P3 rich text sanitization and preview

**Status:** Accepted (2026-08-15, P3 code-first gate).

## Context

Editors will produce rich text; stored XSS must be impossible in editor,
preview and public render. Preview must never be indexed or cached publicly.

## Decision

- Wagtail rich text features are restricted to a fixed allowlist in
  `config/settings/base.py`:
  `["h2","h3","h4","bold","italic","ol","ul","link","document-link","hr","blockquote","code"]`.
  No arbitrary HTML, tables or embeds in P3.
- Content models use the same allowlist wherever rich text is edited; the same
  sanitization is applied in preview and public output (single source of
  truth).
- Preview pages carry `noindex, noarchive` and `no-cache`/`no-store` semantics.
  Staff-session preview is implemented under `/admin/preview/<kind>/<pk>/`
  (Landing/Profile/Article; MFA-gated). Public share-token preview is deferred
  (`DEFER-0016`).
- The allowlist is pinned by a pytest that fails if it drifts.

## Consequences

- Stored-XSS surface is limited to the allowlist; further tightening (per-slice
  entity rules) can extend the list only through a new Task Spec.
- A future frontend-faithful preview (P7) does not relax this minimum.
- Public tokenized preview remains out of the staff-only minimum (DEFER-0016).
