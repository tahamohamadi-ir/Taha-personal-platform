# Taha Figma Lite Builder

Free local Classic Plugin for Figma Desktop. It uses no MCP call, subscription,
network request, analytics, or external dependency.

## Run

1. Open the existing Figma file in **Figma Desktop**.
2. Open `Plugins → Development → Import plugin from manifest…` and select the
   `manifest.json` beside this README.
3. Run `Plugins → Development → Taha Figma Lite Builder`.

The plugin creates/reuses exactly three pages and rebuilds only top-level frames
whose names begin with `TFL /`. Existing variables, styles, and user frames are
not deleted. Run it again whenever you want to refresh the visual library.

## Output

- `00 — Foundations & Library`: palette, typography, rhythm, motion, and 24
  reusable component specimens.
- `10 — Templates & Screens`: six templates plus desktop, mobile RTL, tablet,
  and state examples.
- `20 — Prototype & Handoff`: the gateway-to-contact path, motion rules, CMS
  boundary, and agent authority order.

The repository JSON and contract documents remain authoritative. This plugin is
a visual index for review and handoff.

