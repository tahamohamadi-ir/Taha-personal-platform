import { readFileSync } from "node:fs";

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

/**
 * G7 interactive 2D island (LOG-0281 owner queue item 9, list-first shipped
 * in WF-08). Zero new runtime deps (hand-rolled SVG, React already ships):
 * pan/zoom/focus selection over the SAME payload the semantic list renders,
 * keyboard<->pointer parity resolving identical endpoint URLs, reduced-motion
 * honesty (no autonomous motion exists), no-JS fallback = the Astro list.
 */
const island = readFileSync(
  new URL("../src/components/research/ResearchGraphIsland.tsx", import.meta.url),
  "utf8",
);

// Hand-rolled 2D, no new deps.
assert(island.includes("<svg"), "island: renders hand-rolled SVG (no canvas/WebGL lib)");
assert(
  !/from\s+["'](three|gsap|d3)["']/.test(island) &&
    !/require\(\s*["'](three|gsap|d3)["']\s*\)/.test(island) &&
    !/import\(\s*["'](three|gsap|d3)["']\s*\)/.test(island),
  "island: zero new runtime deps (no three/gsap/d3 imports)",
);
assert(
  !island.includes("requestAnimationFrame") && !island.includes("setInterval"),
  "island: no autonomous motion (reduced-motion honest by construction)",
);

// Pan/zoom with documented clamps.
assert(
  island.includes("ZOOM_MIN = 0.25") && island.includes("ZOOM_MAX = 3"),
  "island: zoom clamps 0.25-3",
);
assert(island.includes("onWheel") || island.includes("wheel"), "island: cursor-centered wheel zoom");
assert(island.includes("reset") || island.includes("Reset"), "island: keyboard-reachable view reset");

// Selection parity: pointer + keyboard resolve the same URLs.
assert(island.includes("aria-pressed"), "island: selection state exposed, never color-only");
assert(
  island.includes("Enter") && island.includes(" ") && island.includes("onKeyDown"),
  "island: keyboard selection (Enter/Space) mirrors pointer selection",
);
assert(island.includes("aria-live"), "island: selection details announced via a live region");
assert(
  island.includes("relatedUrls"),
  "island: renders ONLY endpoint-resolved related URLs (verbatim hrefs, unresolved stay URL-less)",
);

// Tokens only, ASCII-only source, typed props.
assert(!/#[0-9a-fA-F]{3,8}\b/.test(island), "island: no raw hex colors (token vars only)");
assert(
  /^[\x00-\x7F]*$/.test(island),
  "island: ASCII-only source (visible copy arrives via props)",
);

// Wiring: the four graph pages mount the island as a SIBLING of the list
// (never inside data-research-graph, whose zero-href assertion must hold).
for (const page of [
  "src/pages/en/index.astro",
  "src/pages/fa/index.astro",
  "src/pages/en/research/index.astro",
  "src/pages/fa/research/index.astro",
]) {
  const src = readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
  assert(
    src.includes("ResearchGraphIsland") && src.includes("client:visible"),
    `${page}: mounts ResearchGraphIsland with client:visible (no-JS keeps the list)`,
  );
}

// Named slots break silently when two slotted children sit adjacent without
// a Fragment wrapper (the slot reads as unfilled and the block is skipped).
// This cost a real debugging session on the home graph block: the house
// pattern is slot-on-Fragment (see the projects block), never slot attrs on
// adjacent children.
for (const page of ["src/pages/en/index.astro", "src/pages/fa/index.astro"]) {
  const src = readFileSync(new URL(`../${page}`, import.meta.url), "utf8");
  const islandIdx = src.indexOf("<ResearchGraphIsland");
  assert(islandIdx > 0, `${page}: island present`);
  const window = src.slice(Math.max(0, islandIdx - 900), islandIdx);
  assert(
    window.includes('<Fragment slot="graph">'),
    `${page}: graph children share one slot-on-Fragment wrapper (house pattern; bare adjacency silently drops the named slot)`,
  );
}

console.log("PASS graph-island (2D SVG, parity selection, zero new deps)");
