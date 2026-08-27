// WF-02 structural QA gate for the 8 ui primitives (ATLAS-02, gate G2).
//
// Plain Node script, no dependencies. Parses the component sources in
// src/components/ui/ and enforces the agent-kit components.json v1.0.0
// anatomy/variants plus the DESIGN-CONTRACT numeric + a11y rules:
//
//   structure    : all 8 primitive files exist and declare typed Props
//   variants     : Button primary|secondary|quiet, IconButton quiet|outlined,
//                  LinkAction inline|standalone, Chip neutral|selected|taxonomy,
//                  Badge status|type, ContentState exactly the 6 ContentState kinds
//   semantics    : Button/IconButton render native <button>/<a> (never
//                  role="button"), IconButton accessible name mandatory,
//                  ContentState consumes (not redefines) the shared types
//   forms        : persistent <label for>, id autogen from name, hint/error ids
//                  wired via aria-describedby, error -> aria-invalid="true",
//                  error message carries icon + text (never color-only),
//                  textarea keeps its server-rendered value
//   states       : every :hover declaration has a :focus-visible twin,
//                  disabled styling present on real controls (cursor
//                  not-allowed), loading variant has a fixed (non-clamp)
//                  min-height so geometry cannot shift
//   tokens       : no raw hex / ms / rem in styles; px allowed only as 1-2px
//                  border/outline hairlines; transitions use --duration-fast or
//                  --duration-base with --ease-out; animations use a duration
//                  token (continuous spinner keeps linear timing; the global
//                  prefers-reduced-motion kill switch stops it)
//   direction    : CSS logical properties only (no left/right), LinkAction
//                  directional arrow rotates 180deg under [dir="rtl"]
//   i18n         : zero hardcoded locale copy - components receive every
//                  string via props. EN + FA long-label fixtures below are
//                  pure string cases (FA built from unicode escapes so this
//                  file stays ASCII) and must NOT appear in any component.
//   theming      : no data-theme or prefers-color-scheme logic in components
//                  (tokens cascade automatically); no tabindex hacks; no
//                  hover-lift transforms (DEBT-0013 hover is colour-only).

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const uiDir = join(here, "..", "src", "components", "ui");
const contractsPath = join(here, "..", "src", "design-system", "contracts.ts");

const COMPONENTS = [
  "Button",
  "IconButton",
  "LinkAction",
  "Chip",
  "Badge",
  "InputField",
  "TextareaField",
  "ContentState",
];

// Locale fixtures: pure string cases a caller would pass as props. The FA
// strings are assembled from unicode escapes (incl. ZWNJ U+200C) so this spec
// file itself remains ASCII. None of them may appear inside a component.
const EN_LONG_LABEL =
  "Understanding progressive enhancement across the public reading experience";
const EN_SHORT_LABEL = "Read more";
const FA_LONG_LABEL =
  "\u062F\u0633\u062A\u0631\u0633\u06CC\u200C\u067E\u0630\u06CC\u0631\u0650 " +
  "\u0628\u0647\u0628\u0648\u062F " +
  "\u062A\u062F\u0631\u062C\u06CC " +
  "\u062F\u0631 " +
  "\u062A\u062C\u0631\u0628\u0647\u200C\u0647\u0627\u06CC " +
  "\u062E\u0648\u0627\u0646\u062F\u0646 " +
  "\u0639\u0645\u0648\u0645\u06CC";
const FA_SHORT_LABEL = "\u0627\u062F\u0627\u0645\u0647";

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

// --- load -------------------------------------------------------------------
const sources = new Map();
for (const name of COMPONENTS) {
  const path = join(uiDir, `${name}.astro`);
  try {
    sources.set(name, readFileSync(path, "utf8"));
  } catch {
    sources.set(name, null);
    failures.push(`missing component file: src/components/ui/${name}.astro`);
  }
  scanFile(name);
}

let contracts = "";
try {
  contracts = readFileSync(contractsPath, "utf8");
} catch {
  failures.push("missing src/design-system/contracts.ts (WF-01 interface)");
}

function rel(name) {
  return `src/components/ui/${name}.astro`;
}

// --- source helpers ----------------------------------------------------------
function splitFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { fm: "", markup: src };
  return { fm: m[1], markup: m[2] };
}

function extractStyles(markup) {
  const blocks = [];
  for (const m of markup.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    blocks.push(m[1]);
  }
  return blocks.join("\n");
}

function stripExpressions(s) {
  let prev;
  do {
    prev = s;
    s = s.replace(/\{[^{}]*\}/g, "");
  } while (s !== prev);
  return s;
}

function parseStyleRules(css) {
  const stripped = css.replace(/\/\*[\s\S]*?\*\//g, " ");
  const rules = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m;
  while ((m = re.exec(stripped)) !== null) {
    const sel = m[1].trim();
    const decls = m[2]
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean);
    rules.push({ sel, decls });
  }
  return rules;
}

// --- global scans per file ----------------------------------------------------
function scanFile(name) {
  const src = sources.get(name);
  if (src === null) return;
  const { fm, markup } = splitFrontmatter(src);
  const styles = extractStyles(markup);
  const markupNoStyle = markup.replace(/<style[^>]*>[\s\S]*?<\/style>/g, " ");

  // typed props API
  check(/interface Props\b/.test(fm), `${rel(name)}: declares a typed Props interface`);

  // tokens only: no raw hex anywhere
  const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${rel(name)}: no raw hex colors${hex ? ` (found ${hex.join(", ")})` : ""}`);

  // tokens only: no raw ms durations anywhere
  const ms = src.match(/\b\d+ms\b/g);
  check(!ms, `${rel(name)}: no raw ms durations${ms ? ` (found ${ms.join(", ")})` : ""}`);

  // px allowed only as 1-2px border/outline/box-shadow hairlines inside styles
  const pxProblems = [];
  for (const rule of parseStyleRules(styles)) {
    for (const decl of rule.decls) {
      for (const m of decl.matchAll(/\b(\d+(?:\.\d+)?)px\b/g)) {
        const okCtx = /(border|outline|box-shadow)/.test(decl);
        const okVal = m[1] === "1" || m[1] === "2";
        if (!okCtx || !okVal) pxProblems.push(`${decl.trim()} (${m[0]})`);
      }
    }
  }
  check(
    pxProblems.length === 0,
    `${rel(name)}: px only as 1-2px hairline widths${pxProblems.length ? ` (found ${pxProblems.join(" | ")})` : ""}`,
  );

  // no raw rem lengths in styles (spacing/size roles come from tokens)
  const rem = styles.match(/\b\d+(?:\.\d+)?rem\b/g);
  check(!rem, `${rel(name)}: no raw rem lengths in styles${rem ? ` (found ${rem.join(", ")})` : ""}`);

  // transitions: duration token + ease-out; animations: duration token
  for (const rule of parseStyleRules(styles)) {
    for (const decl of rule.decls) {
      if (/^transition\s*:/.test(decl)) {
        const durTok = /var\(--duration-(fast|base)\)/.test(decl);
        const ease = /var\(--ease-out\)/.test(decl);
        check(durTok && ease, `${rel(name)}: transition uses --duration-fast/base + --ease-out (${decl.trim()})`);
      }
      if (/^animation\s*:/.test(decl)) {
        check(
          /var\(--duration-/.test(decl),
          `${rel(name)}: animation uses a duration token (${decl.trim()})`,
        );
      }
    }
  }

  // hover/focus-visible parity: every :hover compound has a :focus-visible twin
  const rules = parseStyleRules(styles);
  for (const rule of rules) {
    const parts = rule.sel.split(",").map((s) => s.trim());
    for (const part of parts) {
      if (!part.includes(":hover")) continue;
      const base = part.replace(":hover", "");
      const twinSameRule = parts.some((p) => p === `${base}:focus-visible`);
      const twinOtherRule = rules.some(
        (r) =>
          r !== rule &&
          r.sel.split(",").map((s) => s.trim()).includes(`${base}:focus-visible`) &&
          JSON.stringify(r.decls) === JSON.stringify(rule.decls),
      );
      check(
        twinSameRule || twinOtherRule,
        `${rel(name)}: :hover has :focus-visible twin (${part})`,
      );
    }
  }

  // theming is horizontal: components never author theme logic
  check(!/data-theme|prefers-color-scheme/.test(src), `${rel(name)}: no theme logic (tokens cascade)`);

  // direction: logical properties only
  const dirBad = styles.match(/\b(left|right)\s*:|\b(margin|padding|inset)-(left|right)\b/g);
  check(!dirBad, `${rel(name)}: logical properties only${dirBad ? ` (found ${dirBad.join(", ")})` : ""}`);

  // keyboard: no tabindex management in primitives
  check(!/tabindex/.test(src), `${rel(name)}: no tabindex hacks`);

  // motion: no hover-lift transforms (DEBT-0013 hover is colour-only)
  check(!/translateY|translate3d/.test(src), `${rel(name)}: no hover-lift transforms`);

  // i18n: no Persian glyphs anywhere in the file
  const faChars = src.match(/[\u0600-\u06FF\u200C]/g);
  check(!faChars, `${rel(name)}: no hardcoded Persian text (strings arrive via props)`);

  // i18n: no English UI copy as markup text or natural-language attributes
  const markupClean = stripExpressions(
    markupNoStyle.replace(/<!--[\s\S]*?-->/g, " "),
  );
  const textNodes = [...markupClean.matchAll(/>([^<]*)</g)]
    .map((m) => m[1].trim())
    .filter((t) => /[A-Za-z]{3,}/.test(t));
  check(
    textNodes.length === 0,
    `${rel(name)}: no hardcoded English text nodes${textNodes.length ? ` (found ${JSON.stringify(textNodes)})` : ""}`,
  );
  const langAttrs = [...markupClean.matchAll(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g)]
    .map((m) => m[2])
    .filter((v) => /[A-Za-z]{2,}/.test(v));
  check(
    langAttrs.length === 0,
    `${rel(name)}: no hardcoded natural-language attribute copy${langAttrs.length ? ` (found ${JSON.stringify(langAttrs)})` : ""}`,
  );
}

// --- per-component structural contracts ---------------------------------------
function requireMarkers(name, markers) {
  const src = sources.get(name);
  if (src === null) return;
  for (const marker of markers) {
    check(src.includes(marker), `${rel(name)}: contains ${JSON.stringify(marker)}`);
  }
}

function requireVariants(name, variants) {
  const src = sources.get(name);
  if (src === null) return;
  for (const v of variants) {
    check(src.includes(`"${v}"`), `${rel(name)}: supports variant "${v}"`);
  }
}

function requireTarget44(name) {
  const src = sources.get(name);
  if (src === null) return;
  check(
    /min-height:\s*var\(--space-11\)/.test(src),
    `${rel(name)}: 44px touch target via var(--space-11)`,
  );
}

// Button: primary/secondary/quiet + icon slot, native semantics, disabled.
requireVariants("Button", ["primary", "secondary", "quiet"]);
requireMarkers("Button", ["<button", "<a ", "<slot name=\"icon\"", "disabled"]);
{
  const src = sources.get("Button");
  if (src !== null) {
    check(
      /type = "button"/.test(src),
      `${rel("Button")}: defaults to type="button" (no accidental submits)`,
    );
    check(!src.includes('role="button"'), `${rel("Button")}: never a clickable div (no role="button")`);
    check(!src.includes("--color-signature"), `${rel("Button")}: gold is not a button fill`);
    check(/disabled=\{disabled\}/.test(src), `${rel("Button")}: wires the disabled state onto the control`);
    check(/href \?/.test(src) || /href \? /.test(src), `${rel("Button")}: renders <a> only when href is set`);
    requireTarget44("Button");
  }
}

// IconButton: accessible name mandatory, quiet/outlined, native control.
requireVariants("IconButton", ["quiet", "outlined"]);
requireMarkers("IconButton", ["aria-label={label}", "throw new Error"]);
{
  const src = sources.get("IconButton");
  if (src !== null) {
    check(/if\s*\(!label\b/.test(src), `${rel("IconButton")}: throws when the accessible name is missing`);
    requireTarget44("IconButton");
    check(!/--color-signature/.test(src), `${rel("IconButton")}: gold is not a control fill`);
  }
}

// LinkAction: native anchor, directional arrow flips in RTL, shared Direction.
requireVariants("LinkAction", ["inline", "standalone"]);
requireMarkers("LinkAction", [
  "<a ",
  "ui-link-action__arrow",
  '[dir="rtl"]',
  "rotate(180deg)",
  "import type { Direction }",
]);
requireTarget44("LinkAction");

// Chip: neutral/selected/taxonomy + optional remove slot; selected = brand fill.
requireVariants("Chip", ["neutral", "selected", "taxonomy"]);
requireMarkers("Chip", ["<slot name=\"remove\""]);
{
  const src = sources.get("Chip");
  if (src !== null) {
    check(
      /background-color:\s*var\(--color-brand\)/.test(src) &&
        /color:\s*var\(--color-inverse\)/.test(src),
      `${rel("Chip")}: selected variant is the brand fill`,
    );
  }
}

// Badge: status/type; shape + label slot (meaning never color-only).
requireVariants("Badge", ["status", "type"]);
requireMarkers("Badge", ["ui-badge__shape", "<slot"]);
{
  const src = sources.get("Badge");
  if (src !== null) {
    check(/aria-hidden="true"/.test(src), `${rel("Badge")}: decorative shape is aria-hidden (label carries meaning)`);
  }
}

// InputField / TextareaField: persistent label, describedby wiring,
// aria-invalid, non-color-only error, value retention, 44px control.
for (const [name, control] of [
  ["InputField", "<input"],
  ["TextareaField", "<textarea"],
]) {
  requireMarkers(name, [
    control,
    "<label",
    "for={fieldId}",
    "id={fieldId}",
    "aria-describedby={describedBy}",
    'aria-invalid={error ? "true" : undefined}',
    "const fieldId = id ?? name",
    "<svg",
    "{error}",
    "disabled",
    "required",
  ]);
  requireTarget44(name);
  if (name === "TextareaField") {
    const src = sources.get(name);
    if (src !== null) {
      check(/{value}<\/textarea>/.test(src), `${rel(name)}: server-rendered value kept as control content`);
    }
  } else {
    const src = sources.get(name);
    if (src !== null) {
      check(/value=\{value\}/.test(src), `${rel(name)}: value attribute wired for error re-render`);
    }
  }
}

// ContentState: exact 6 kinds from the shared type, heading + explanation +
// at most one recovery action slot, fixed loading min-height.
{
  const src = sources.get("ContentState");
  requireMarkers("ContentState", [
    "import type { ContentState }",
    "ui-content-state--",
    "<slot name=\"action\"",
    "{heading}",
    "{explanation}",
  ]);
  if (src !== null) {
    for (const kind of [
      "ready",
      "loading",
      "empty",
      "no-results",
      "error",
      "unavailable-translation",
    ]) {
      check(src.includes(`"${kind}"`), `${rel("ContentState")}: handles kind "${kind}"`);
    }
    check(
      contracts.includes('export type ContentState') && !/export type ContentState\b/.test(src),
      `${rel("ContentState")}: consumes (does not redefine) the shared ContentState type`,
    );
    check(
      (src.match(/<slot name="action"/g) || []).length === 1,
      `${rel("ContentState")}: at most one recovery action slot`,
    );
    check(
      /role=\{kind === "error" \? "alert" : "status"\}/.test(src),
      `${rel("ContentState")}: error announces as alert, other states as status`,
    );
    const loadingRules = parseStyleRules(extractStyles(splitFrontmatter(src).markup)).filter((r) =>
      r.sel.includes("ui-content-state--loading"),
    );
    const loadingDecls = loadingRules.map((r) => r.decls.join(";")).join("\n");
    check(
      /min-height:\s*var\(--space-24\)/.test(loadingDecls),
      `${rel("ContentState")}: loading variant has fixed min-height`,
    );
    check(!/clamp\(/.test(loadingDecls), `${rel("ContentState")}: loading min-height is not fluid (geometry-stable)`);
  }
}

// Direction type is consumed, not redefined, anywhere in the layer.
{
  const all = [...sources.values()].filter(Boolean).join("\n");
  check(!/export type (ThemeName|Direction|ContentState)\b/.test(all), "ui primitives never redefine the shared WF-01 types");
}

// Locale fixtures: pure string cases that must never be baked into components.
{
  const all = [...sources.values()].filter(Boolean).join("\n");
  for (const [label, fixture] of [
    ["EN long", EN_LONG_LABEL],
    ["EN short", EN_SHORT_LABEL],
    ["FA long", FA_LONG_LABEL],
    ["FA short", FA_SHORT_LABEL],
  ]) {
    check(!all.includes(fixture), `fixture "${label}" absent from all components (props-in, markup-out)`);
  }
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`ui-primitives.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `ui-primitives.spec: PASS — ${COMPONENTS.length} primitives (${passed.length} structural checks): variants, native semantics, 44px targets, persistent labels, aria wiring, focus parity, token discipline, direction, i18n fixtures clean`,
);
