# Taha Personal Platform — implementation reference

**Canonical reference root:** `Assets/site-redesign/implementation-reference/`  
**State:** planning and agent handoff; public frontend/CMS implementation has not started  
**Reference branch:** `p14c-visual-atlas`  
**Reference commit before this package:** `7d9b87f3c2b04542e13c189adab3b57f2108d84a`

This directory is the single entry point for the next frontend generation. It
packages the approved visual direction, machine-readable Design System, asset
catalog, multi-agent work breakdown, review gates, and worktree evidence in one
place. Future agents must not start from screenshots, Figma, chat history, or a
copied prompt.

The package is self-contained in Git. Reviewed brand derivatives, production
artwork, visual concepts, source notes and integrity records are mirrored under
`assets/`. Raw duplicated generations from the owner-only `others/` archive are
intentionally excluded.

## Read order

1. Repository `AGENTS.md`, `docs/README.md`, and `PROJECT_MANIFEST.md`.
2. `MASTER-SPEC.md` in this folder.
3. `AGENT-COORDINATION.md` and `MULTI-AGENT-TASK-LIST.md`.
4. `ACCEPTANCE-GATES.md`.
5. `agent-kit/README.md` and its JSON contracts.
6. Root asset-pack `../README.md`, `../MANIFEST.md`, `../PROMPTS.md`, and
   `../SHA256SUMS.txt`.
7. Concept PNGs only for visual hierarchy and art direction.

## Contents

| Path | Responsibility |
|---|---|
| `MASTER-SPEC.md` | Product, architecture, UX, CMS, accessibility and delivery contract |
| `MULTI-AGENT-TASK-LIST.md` | Dependency-aware executable work packets |
| `AGENT-COORDINATION.md` | Branching, ownership, handoff and conflict rules |
| `ACCEPTANCE-GATES.md` | Objective gates from tokens through production adoption |
| `DOCUMENT-MIGRATION-MAP.md` | Project documents that must later be reconciled with accepted implementation |
| `SOURCE-INVENTORY.md` | Runtime authority, design-history, asset and supersession index |
| `WORKTREE-SNAPSHOT.md` | Reproducible source-branch/worktree evidence; not a copy of `.git` internals |
| `REFERENCE-MANIFEST.json` | Machine-readable reference inventory and authority status |
| `agent-kit/` | Tokens, component/template contracts, asset references, validator and optional Figma builder |
| `figma-lite-state.json` | Historical Figma attempt and local-builder continuation state |

## Authority boundary

- This directory owns the **next-generation implementation brief**.
- Existing route, security, deployment and current-runtime facts remain owned by
  the repository contracts until an accepted task changes those owner files.
- `apps/web/src/styles/global.css` remains current runtime token authority.
- `agent-kit/tokens.json` records current Light values and the proposed Dark
  target without silently activating Dark in production.
- CMS copy and records remain locale-specific and publication-controlled.
- Figma is optional visual documentation. It is not an implementation input.

## Worktree rule

Do not copy a Git worktree or its `.git` administration directory into this
asset folder. That creates nested repository metadata, stale object references,
and a misleading duplicate source tree. `WORKTREE-SNAPSHOT.md` records the exact
branch, commit, path, dirty manifest and recovery commands instead.
