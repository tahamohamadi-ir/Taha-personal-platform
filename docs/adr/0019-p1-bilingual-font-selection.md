# ADR-0019: P1 bilingual font selection

**Status:** Accepted.  

## Context

The initial P1 build used a system stack while the bilingual specimen was
pending. The staging screenshot showed that visual polish and Persian/English
consistency matter for the first impression. `docs/design.md` requires a
specimen-based decision, self-hosting and minimal weights; the public frontend
must not depend on a remote font provider.

## Decision

- Use `Vazirmatn Variable` for `fa`/Arabic-script text and `Inter Variable` for
  `en`/Latin-script text in P1.
- Load both from the npm packages in the static artifact; do not use a Google
  Fonts URL or runtime font fetch.
- Use locale-aware CSS stacks so English technical terms remain legible inside
  Persian content and Persian headings do not fall back unpredictably.
- Keep the package/font decision replaceable by a later owner-approved specimen
  review without changing the content contract.

## Consequences

- The gateway and landing typography become more consistent across machines.
- The artifact gains a small local font payload, traded for deterministic
  rendering and no third-party font request.
- `DEFER-0008` can close after build/audit verification; a later brand refresh
  may replace the pair through a new ADR.
