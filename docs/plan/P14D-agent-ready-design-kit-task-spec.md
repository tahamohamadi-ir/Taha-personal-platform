# P14D — Agent-ready design kit and local Figma builder

**Status:** DONE — CANONICAL REFERENCE VALIDATED

## Task

- Goal: make the approved visual direction directly consumable by a coding
  agent without requiring paid Figma access or interpretation of raster mockups.
- Owner: Taha Mohammadi.
- Release type: documentation/design tooling only.
- Risk: low; no runtime, route, CMS schema, API, deployment, or production change.

## Scope

- Canonical implementation reference, multi-agent execution plan,
  machine-readable tokens, component/template contracts and asset references
  under `Assets/site-redesign/implementation-reference/**`.
- A free local Figma Desktop plugin that generates the bounded Figma-Lite
  library from deterministic data and can be rerun safely.
- Preserve the Git worktree as branch/commit/path evidence rather than copying
  nested Git metadata into `Assets/`.
- Update the asset-pack entry point, Figma state ledger, plan index, and work log.

## Boundaries

- `apps/**`, `infra/**`, `.github/**`, CMS data, migrations, production content,
  and deployment are forbidden.
- Allowed files are `Assets/site-redesign/**`, this Task Spec,
  `docs/plan/README.md`, and
  `docs/status/WORK_LOG.md`; `.gitignore` may change only to version the bounded
  `Assets/site-redesign/implementation-reference/**` subtree while all other
  owner assets remain ignored.
- `apps/web/src/styles/global.css` remains the current runtime token authority.
- Dark tokens are design targets only until a separate runtime task updates the
  Design Contract and CSS together.
- Raster concepts are art-direction references, never production controls.
- No biography, metric, citation, employer detail, private contact data, or
  translation may be invented.

## Verification

- Parse every JSON file.
- Run `node --check` on the plugin.
- Verify all referenced local assets exist.
- Verify deterministic plugin ownership prefixes and three-page limit.
- Run `git diff --check` and exact-scope review.

## Acceptance

- An agent can identify authority order, exact tokens, component anatomy,
  states, responsive/RTL behavior, page composition, CMS boundaries, and assets
  without opening Figma.
- A user on Figma Starter can import and run the local plugin without a paid
  subscription or MCP quota.
- Rerunning the plugin replaces only plugin-owned generated frames.
- Multiple implementation agents can select non-overlapping, dependency-aware
  work packets with explicit interfaces, tests, gates and merge order.

## Handoff

- Canonical entry: `Assets/site-redesign/implementation-reference/README.md`.
- Implementation remains not started; CMS migration and production remain
  unchanged and unauthorized by this documentation task.
- The physical Git worktree was not copied into `Assets/`; branch, commit, path,
  base checkout and recovery evidence are recorded in `WORKTREE-SNAPSHOT.md`.
- The bounded implementation-reference subtree is versioned through a narrow
  `.gitignore` exception; other owner assets remain ignored.
