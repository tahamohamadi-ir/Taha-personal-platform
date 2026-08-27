# Source inventory and supersession map

This inventory prevents future agents from treating an older design document,
chat image or duplicated concept as current implementation authority.

## Canonical implementation sources

| Source | Role |
|---|---|
| `README.md` | Entry point and authority order |
| `MASTER-SPEC.md` | Consolidated next-generation product/design contract |
| `MULTI-AGENT-TASK-LIST.md` | Executable work breakdown |
| `AGENT-COORDINATION.md` | Ownership and integration rules |
| `ACCEPTANCE-GATES.md` | Objective completion gates |
| `agent-kit/*.json` | Machine-readable tokens/components/templates/assets |

## Current runtime authorities

- `AGENTS.md`
- `PROJECT_MANIFEST.md`
- `docs/README.md`
- `docs/contracts/IA-CONTRACT.md`
- `docs/contracts/DESIGN-CONTRACT.md`
- `apps/web/src/styles/global.css`

These sources still outrank this reference for current runtime. An authorized
implementation packet updates the owner contract and runtime together; it must
not claim a design target is already live.

## Consolidated design-history inputs

- `history/specs/2026-08-25-personal-platform-experience-redesign.md`
- `history/specs/2026-08-25-public-page-family-visual-atlas.md`
- `history/design-redesign/README.md`
- `history/design-redesign/ADMIN-CMS-FUNCTIONAL-SPEC.md`
- `history/design-redesign/MOTION-GRAPH-HANDOFF.md`
- `history/design-redesign/QUALITY-AUDIT-v2.md`
- `history/design-redesign/page-families/README.md`
- `history/design-redesign/page-families/PAGE-FAMILY-COMPONENT-MATRIX.md`
- `history/design-redesign/page-families/RESPONSIVE-RTL-STATE-SPEC.md`
- `history/design-redesign/page-families/CMS-CONTENT-MAPPING.md`
- `history/design-redesign/page-families/FIGMA-DECISION.md`
- `history/design-redesign/page-families/QUALITY-AUDIT.md`
- `history/design-redesign/page-families/PRODUCTION-REGISTER.md`

These remain evidence/history. Where they differ from `MASTER-SPEC.md` for the
next generation, the Master Spec is the implementation brief. Where a current
runtime contract differs, the runtime contract remains binding until adoption.

## Visual and binary sources

- `assets/brand/` — authoritative existing mark derivatives.
- `assets/art/` — standalone implementation candidates.
- `assets/concepts/` — top-level visual references.
- `assets/concepts/page-families/` — eight family references.
- `assets/concepts/requested-2026-08-25/` — preserved owner inputs.
- `assets/{README.md,MANIFEST.md,PROMPTS.md,SHA256SUMS.txt}` — provenance,
  usage, dimensions and integrity.
- `assets/page-families/PRODUCTION-REGISTER.md` — page-family register mirrored
  from the historical design workspace.

All paths above are relative to this implementation-reference directory and
therefore exist in a clean clone. The owner-only sibling asset archive remains
local evidence and is not required by agents.

Concepts are never sliced into native controls. Generated copy inside images is
not content authority.

## Figma disposition

`figma-lite-state.json` preserves the earlier file/page/variable state.
`agent-kit/figma-plugin/` can generate a free visual index in Figma Desktop.
Neither is required for implementation and neither outranks code or contracts.

## Worktree disposition

`WORKTREE-SNAPSHOT.md` replaces a dangerous physical copy of the Git worktree.
Commits and branch references are reproducible; `.git` worktree administration
files must never be copied into this asset pack.
