// WF-01 dual-theme token contract QA gate (DESIGN-CONTRACT §2, G1).
//
// Plain Node script, no dependencies. Parses src/styles/global.css and the
// agent-kit tokens.json contract and enforces:
//   a) tokens.json semanticLight roles exist in global.css as CSS custom
//      properties, byte-for-role (camelCase -> kebab map below);
//   b) values match the contract exactly (Light is runtime-authoritative);
//   c) a single [data-theme="dark"] selector block exists containing every
//      semanticDark role mapped to the same custom-property names;
//   d) no raw hex color outside the token definition areas (pragmatic rule:
//      hex is allowed only inside the /* design-tokens: begin/end */ marker
//      span, @theme blocks, and [data-theme="dark"] blocks; hex found in
//      component/class rules after the token section is a failure);
//   e) WCAG 2.x relative-luminance contrast: >= 4.5:1 for ink/canvas and
//      ink-secondary/canvas, >= 3:1 for control-border/canvas, in BOTH
//      themes, and >= 3:1 for danger on Light canvas+surface and Dark
//      canvas (TOK-DANGER, non-text). Brand pairs are computed and PRINTED
//      only (report data, not a gate) so hover/primary rest states stay
//      visible in the log.

import { readFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const repoRoot = join(webRoot, "..", "..");
const cssPath = join(webRoot, "src", "styles", "global.css");
const tokensPath = join(
  repoRoot,
  "Assets",
  "site-redesign",
  "implementation-reference",
  "agent-kit",
  "tokens.json",
);

const TOKEN_BEGIN = "/* design-tokens: begin */";
const TOKEN_END = "/* design-tokens: end */";

// camelCase role -> CSS custom property. brandHover maps to the emphasized
// hover token name (DESIGN-CONTRACT §2.1/§2.2 tables), not plain kebab-case.
const ROLE_TO_PROP = {
  canvas: "--color-canvas",
  surface: "--color-surface",
  surfaceMuted: "--color-surface-muted",
  ink: "--color-ink",
  inkSecondary: "--color-ink-secondary",
  inkTertiary: "--color-ink-tertiary",
  inverse: "--color-inverse",
  brand: "--color-brand",
  brandHover: "--color-brand-emphasis-hover",
  brandSoft: "--color-brand-soft",
  signature: "--color-signature",
  signatureSoft: "--color-signature-soft",
  research: "--color-research",
  researchSoft: "--color-research-soft",
  context: "--color-context",
  contextSoft: "--color-context-soft",
  borderSubtle: "--color-border-subtle",
  borderStrong: "--color-border-strong",
  controlBorder: "--color-control-border",
  focus: "--color-focus",
  danger: "--color-danger",
};

// --- WCAG 2.x relative luminance / contrast ratio -------------------------
function luminance(hex) {
  const h = hex.replace("#", "");
  const chan = (i) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * chan(0) + 0.7152 * chan(2) + 0.0722 * chan(4);
}

function contrastRatio(fg, bg) {
  const l1 = luminance(fg);
  const l2 = luminance(bg);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}

// --- parsing helpers -------------------------------------------------------
// Blank block comments with same-length whitespace so offsets (and therefore
// line numbers) stay valid while comment prose can never match scans.
function blankComments(css) {
  return css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
}

function matchBrace(text, openIdx) {
  let depth = 0;
  for (let i = openIdx; i < text.length; i++) {
    if (text[i] === "{") depth++;
    else if (text[i] === "}") {
      depth--;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function lineOf(text, idx) {
  return text.slice(0, idx).split("\n").length;
}

function parseDeclarations(blockText) {
  const decls = new Map();
  const re = /(--[a-zA-Z0-9-]+)\s*:\s*([^;{}]+);/g;
  let m;
  while ((m = re.exec(blockText)) !== null) {
    decls.set(m[1], m[2].trim());
  }
  return decls;
}

// Locate every `selector... { ... }` region for a given opening regex.
function findBlocks(stripped, openRe) {
  const blocks = [];
  for (const m of stripped.matchAll(openRe)) {
    const openIdx = m.index + m[0].length - 1;
    const closeIdx = matchBrace(stripped, openIdx);
    if (closeIdx !== -1) {
      blocks.push({ start: m.index, end: closeIdx + 1, body: stripped.slice(openIdx + 1, closeIdx) });
    }
  }
  return blocks;
}

// --- load inputs -----------------------------------------------------------
const failures = [];
const check = (ok, message) => {
  if (!ok) failures.push(message);
  return ok;
};

let css;
let tokens;
try {
  css = readFileSync(cssPath, "utf8");
} catch (e) {
  console.error(`FAIL design-tokens.spec — cannot read ${relative(webRoot, cssPath)}: ${e.message}`);
  process.exit(1);
}
try {
  tokens = JSON.parse(readFileSync(tokensPath, "utf8"));
} catch (e) {
  console.error(`FAIL design-tokens.spec — cannot read tokens.json contract: ${e.message}`);
  process.exit(1);
}

const semanticLight = tokens.semanticLight ?? {};
const semanticDark = tokens.semanticDark ?? {};

// The role map must cover the contract exactly, so a role added to
// tokens.json later cannot silently bypass this gate.
const lightRoles = Object.keys(semanticLight).filter((k) => k !== "status").sort();
const darkRoles = Object.keys(semanticDark).filter((k) => k !== "status").sort();
const mappedRoles = Object.keys(ROLE_TO_PROP).sort();
check(
  JSON.stringify(lightRoles) === JSON.stringify(mappedRoles) &&
    JSON.stringify(darkRoles) === JSON.stringify(mappedRoles),
  `ROLE_TO_PROP map out of sync with tokens.json (semanticLight=${lightRoles.join(",")})`,
);

const stripped = blankComments(css);

// --- (c) single [data-theme="dark"] block ----------------------------------
const darkSelectorCount = [...stripped.matchAll(/\[data-theme=["']dark["']/g)].length;
check(darkSelectorCount === 1, `expected exactly one [data-theme="dark"] selector block in global.css, found ${darkSelectorCount}`);

const darkBlocks = findBlocks(stripped, /\[data-theme=["']dark["'][^{}]*\{/g);
const darkDecls = darkBlocks.length > 0 ? parseDeclarations(darkBlocks[0].body) : new Map();

for (const role of darkRoles) {
  const prop = ROLE_TO_PROP[role];
  const actual = darkDecls.get(prop);
  if (!check(actual !== undefined, `dark role missing: ${prop} not declared in [data-theme="dark"] block`)) continue;
  check(
    actual.toLowerCase() === String(semanticDark[role]).toLowerCase(),
    `dark value drift: ${prop} is "${actual}" in global.css but "${semanticDark[role]}" in tokens.json:semanticDark`,
  );
}

// --- token-area markers + (d) raw hex containment ---------------------------
// Markers are block comments, so they only exist in the raw text; offsets are
// identical in `stripped` because blankComments preserves length.
const beginIdx = css.indexOf(TOKEN_BEGIN);
const endIdx = css.indexOf(TOKEN_END);
check(beginIdx !== -1, `missing ${TOKEN_BEGIN} marker around the token definition area`);
check(endIdx !== -1 && endIdx > beginIdx, `missing ${TOKEN_END} marker (or ordered after ${TOKEN_BEGIN})`);

const allowedRanges = [];
if (beginIdx !== -1 && endIdx !== -1 && endIdx > beginIdx) {
  allowedRanges.push([beginIdx, endIdx + TOKEN_END.length]);
}
for (const block of findBlocks(stripped, /@theme[^;{}]*\{/g)) {
  allowedRanges.push([block.start, block.end]);
}
for (const block of darkBlocks) {
  allowedRanges.push([block.start, block.end]);
}

const inAllowedRange = (idx) => allowedRanges.some(([s, e]) => idx >= s && idx < e);

const hexRe = /#[0-9a-fA-F]{3,8}\b/g;
for (const m of stripped.matchAll(hexRe)) {
  if (inAllowedRange(m.index)) continue;
  const line = lineOf(stripped, m.index);
  const lineText = stripped.split("\n")[line - 1].trim();
  failures.push(`raw hex "${m[0]}" outside token areas at global.css:${line} -> ${lineText}`);
}

// --- (a)+(b) Light roles: exist outside the dark block, byte-for-role -------
const lightRegion = stripped.replace(
  /\[data-theme=["']dark["'][^{}]*\{[\s\S]*?\n?\}/g,
  (m) => m.replace(/[^\n]/g, " "),
);
const lightDecls = parseDeclarations(lightRegion);

for (const role of lightRoles) {
  const prop = ROLE_TO_PROP[role];
  const actual = lightDecls.get(prop);
  if (!check(actual !== undefined, `light role missing: ${prop} not declared in global.css`)) continue;
  check(
    actual.toLowerCase() === String(semanticLight[role]).toLowerCase(),
    `light value drift: ${prop} is "${actual}" in global.css but "${semanticLight[role]}" in tokens.json:semanticLight`,
  );
}

// --- (e) contrast gates + report table --------------------------------------
const pairs = [
  { theme: "Light", fgRole: "ink", bgRole: "canvas", min: 4.5 },
  { theme: "Light", fgRole: "inkSecondary", bgRole: "canvas", min: 4.5 },
  { theme: "Light", fgRole: "controlBorder", bgRole: "canvas", min: 3 },
  { theme: "Dark", fgRole: "ink", bgRole: "canvas", min: 4.5 },
  { theme: "Dark", fgRole: "inkSecondary", bgRole: "canvas", min: 4.5 },
  { theme: "Dark", fgRole: "controlBorder", bgRole: "canvas", min: 3 },
  // TOK-DANGER (WF-02 escalation): semantic danger, non-text >= 3:1.
  { theme: "Light", fgRole: "danger", bgRole: "canvas", min: 3 },
  { theme: "Light", fgRole: "danger", bgRole: "surface", min: 3 },
  { theme: "Dark", fgRole: "danger", bgRole: "canvas", min: 3 },
];

for (const p of pairs) {
  const source = p.theme === "Light" ? semanticLight : semanticDark;
  const fg = source[p.fgRole];
  const bg = source[p.bgRole];
  if (!fg || !bg) continue; // role-set drift already reported above
  const ratio = contrastRatio(fg, bg);
  const ok = ratio >= p.min;
  check(
    ok,
    `contrast FAIL (${p.theme}): ${p.fgRole} ${fg} on ${p.bgRole} ${bg} = ${ratio.toFixed(2)}:1 (required >= ${p.min}:1)`,
  );
}

// Report-only brand pairs (rest/hover on each theme's canvas/surface).
const reportPairs = [
  { label: "Light brand rest   on canvas", fg: semanticLight.brand, bg: semanticLight.canvas },
  { label: "Light brand hover  on surface", fg: semanticLight.brandHover, bg: semanticLight.surface },
  { label: "Dark  brand rest   on canvas", fg: semanticDark.brand, bg: semanticDark.canvas },
  { label: "Dark  brand hover  on canvas", fg: semanticDark.brandHover, bg: semanticDark.canvas },
];

console.log("design-token contrast table (WCAG 2.x relative luminance)");
console.log("");
console.log(`  ${"pair".padEnd(36)} ${"fg".padEnd(9)} ${"bg".padEnd(9)} ${"ratio".padStart(7)}  gate`);
for (const p of pairs) {
  const source = p.theme === "Light" ? semanticLight : semanticDark;
  const fg = source[p.fgRole];
  const bg = source[p.bgRole];
  if (!fg || !bg) continue;
  const ratio = contrastRatio(fg, bg);
  console.log(
    `  ${`${p.theme} ${p.fgRole} on ${p.bgRole}`.padEnd(36)} ${fg.padEnd(9)} ${bg.padEnd(9)} ${ratio.toFixed(2).padStart(6)}:1 ${ratio >= p.min ? "PASS" : "FAIL"} (>= ${p.min}:1)`,
  );
}
console.log("");
console.log("  informational (printed, not asserted): brand rest/hover pairs");
for (const p of reportPairs) {
  if (!p.fg || !p.bg) continue;
  const ratio = contrastRatio(p.fg, p.bg);
  console.log(`  ${p.label.padEnd(36)} ${p.fg.padEnd(9)} ${p.bg.padEnd(9)} ${ratio.toFixed(2).padStart(6)}:1`);
}
console.log("");

if (failures.length > 0) {
  console.error(`design-tokens.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `design-tokens.spec: PASS — ${lightRoles.length} Light roles byte-for-role, 1 [data-theme="dark"] block with ${darkRoles.length} Dark roles, no raw hex outside token areas, contrast gates met (both themes)`,
);
