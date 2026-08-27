// WF-04 structural QA gate for the 10 shared content components
// (TRACK-WF packet WF-04, gates G2/G3).
//
// Plain Node script, no dependencies. Parses the component sources in
// src/components/content/ and enforces the agent-kit components.json v1.0.0
// anatomy plus the DESIGN-CONTRACT numeric + a11y rules, mirroring the
// ui-primitives spec style:
//
//   structure   : all 10 files exist and declare typed Props
//   collapse    : optional props render NOTHING when absent (no placeholder
//                 stubs, no em-dash facts); PublicationRow omits unverified
//                 venue/date/identifier; FeaturedRecord renders nothing at
//                 all when selected is false
//   semantics   : MetadataGroup is a definition list (dl/dt/dd) with <bdi>
//                 isolation for ltr-flagged values; Timeline renders an
//                 <ol> of TimelineNode <li> items (pre-enhancement fallback);
//                 TableOfContents nests <ol> by level inside a labelled nav
//                 with a current marker; SectionLead emits an h1 only via
//                 as="h1"; MediaTile reserves its box with CSS aspect-ratio
//                 plus width/height, and the failed variant still renders
//                 caption + record link around a content-free placeholder
//   composition : components import ONLY ui primitives or sibling content
//                 components; ContactCTA composes ui/Button (primary +
//                 optional secondary); no fetch, no env reads - every fact
//                 arrives via typed props
//   tokens      : no raw hex / ms / rem in styles; px allowed only as 1-2px
//                 border hairlines; transitions use --duration-fast or
//                 --duration-base with --ease-out
//   direction   : CSS logical properties only; no theme logic authored in
//                 components; no tabindex; no hover-lift transforms
//   i18n        : zero hardcoded locale copy - EN + FA fixtures below are
//                 pure string cases (FA built from unicode escapes so this
//                 file stays ASCII) and must NOT appear in any component

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const contentDir = join(here, "..", "src", "components", "content");

const COMPONENTS = [
  "SectionLead",
  "FeaturedRecord",
  "ContentRow",
  "PublicationRow",
  "MetadataGroup",
  "Timeline",
  "TimelineNode",
  "MediaTile",
  "TableOfContents",
  "ContactCTA",
];

// Locale fixtures: pure string cases a caller would pass as props. The FA
// strings are assembled from unicode escapes (incl. ZWNJ-free samples) so
// this spec file itself remains ASCII. None of them may appear inside a
// component - every label is caller-owned copy.
const EN_FIXTURES = ["Selected publications", "Table of contents", "Read more"];
const FA_FIXTURES = [
  "\u0627\u0646\u062A\u0634\u0627\u0631\u0627\u062A \u0628\u0631\u06AF\u0632\u06CC\u062F\u0647",
  "\u0641\u0647\u0631\u0633\u062A \u0645\u0637\u0627\u0644\u0628",
  "\u0627\u062F\u0627\u0645\u0647",
];

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
  const path = join(contentDir, `${name}.astro`);
  try {
    sources.set(name, readFileSync(path, "utf8"));
  } catch {
    sources.set(name, null);
    failures.push(`missing component file: src/components/content/${name}.astro`);
  }
  scanFile(name);
}

function rel(name) {
  return `src/components/content/${name}.astro`;
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

  // transitions: duration token + ease-out
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

  // keyboard: no tabindex management in content components
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

// SectionLead: eyebrow + heading (h1 ONLY via as="h1", default h2) +
// summary + primary/secondary CTA slots + optional media; one-H1 rule.
requireMarkers("SectionLead", [
  'as?: "h1" | "h2"',
  'as = "h2"',
  "<HeadingTag",
  "eyebrow &&",
  "summary &&",
  '<slot name="cta"',
  '<slot name="secondary"',
  '<slot name="media"',
]);
{
  const src = sources.get("SectionLead");
  if (src !== null) {
    check(!/<h1[\s>]/.test(src), `${rel("SectionLead")}: no literal h1 tag (h1 only via as="h1")`);
  }
}

// FeaturedRecord: whole record collapses when selected=false; metadata is
// composed via MetadataGroup; media + CTA slots; never one giant link target.
requireMarkers("FeaturedRecord", [
  "selected = true",
  "selected && (",
  "import MetadataGroup",
  "summary &&",
  "{label}",
  "{title}",
  '<slot name="media"',
  '<slot name="cta"',
]);
{
  const src = sources.get("FeaturedRecord");
  if (src !== null) {
    const { markup } = splitFrontmatter(src);
    check(
      !/<article[^>]*>\s*<a[\s>]/.test(markup),
      `${rel("FeaturedRecord")}: record is not one giant focus target (title is not wrapped in a single link)`,
    );
  }
}

// ContentRow: type/status badges, taxonomy chips for tags, MetadataGroup,
// title href ternary, excerpt collapse, action slot - absent data = absent nodes.
requireMarkers("ContentRow", [
  'import Badge from "../ui/Badge.astro"',
  'import Chip from "../ui/Chip.astro"',
  'import MetadataGroup from "./MetadataGroup.astro"',
  "excerpt &&",
  "visibleTags.length > 0 &&",
  "status &&",
  'variant="taxonomy"',
  'variant="status"',
  "href ?",
  '<slot name="action"',
]);

// PublicationRow: unverified venue/date/identifier omitted (no em-dash
// facts), identifier bdi-isolated, files slot, citation text never shrinks
// for actions (wrap + non-shrinking files block).
requireMarkers("PublicationRow", [
  'import Badge from "../ui/Badge.astro"',
  'visibleAuthors.join(", ")',
  "venue &&",
  "date &&",
  "identifier &&",
  "<bdi",
  '<slot name="files"',
]);
{
  const src = sources.get("PublicationRow");
  if (src !== null) {
    const styles = extractStyles(splitFrontmatter(src).markup);
    check(
      /flex-wrap:\s*wrap/.test(styles),
      `${rel("PublicationRow")}: row wraps so actions never compress citation text`,
    );
    check(
      /__files\s*\{[^}]*flex-shrink:\s*0/.test(styles),
      `${rel("PublicationRow")}: files block cannot shrink the citation`,
    );
  }
}

// MetadataGroup: definition-list semantics, bdi isolation for ltr-flagged
// values, empty values omitted, whole dl omitted when nothing remains.
requireMarkers("MetadataGroup", [
  "<dl",
  "<dt",
  "<dd",
  "<bdi",
  "item.ltr",
  ".filter(",
  "length > 0",
]);

// Timeline: ordered-list fallback rendered pre-enhancement from items prop.
requireMarkers("Timeline", [
  'import TimelineNode from "./TimelineNode.astro"',
  ".map(",
  "length > 0",
]);
{
  const src = sources.get("Timeline");
  if (src !== null) {
    const { markup } = splitFrontmatter(src);
    check(
      (markup.match(/<ol[\s>]/g) || []).length === 1,
      `${rel("Timeline")}: exactly one ordered-list root`,
    );
    check(!/<ul[\s>]/.test(markup), `${rel("Timeline")}: ordered semantics (no unordered list)`);
  }
}

// TimelineNode: li item with type chip, label, period (unknown dates
// absent), summary, optional detail LinkAction.
requireMarkers("TimelineNode", [
  "<li",
  'import Chip from "../ui/Chip.astro"',
  'import LinkAction from "../ui/LinkAction.astro"',
  "type &&",
  "period &&",
  "summary &&",
  "detail &&",
]);

// MediaTile: reserved aspect box via CSS aspect-ratio + width/height props,
// intrinsic width/height on the img, failed variant keeps caption + record
// link while the placeholder stays content-free inside the frame.
requireMarkers("MediaTile", [
  "aspect-ratio",
  "width: number",
  "height: number",
  "width={width}",
  "height={height}",
  '"failed"',
  "__placeholder",
]);
{
  const src = sources.get("MediaTile");
  if (src !== null) {
    const { markup } = splitFrontmatter(src);
    const captionBlock = markup.match(/<figcaption[\s\S]*?<\/figcaption>/);
    check(captionBlock !== null, `${rel("MediaTile")}: caption element present`);
    if (captionBlock) {
      const block = captionBlock[0];
      check(block.includes("{caption}"), `${rel("MediaTile")}: caption text renders inside figcaption`);
      check(
        block.includes("href={record.href}"),
        `${rel("MediaTile")}: record link renders inside figcaption`,
      );
      check(
        !block.includes("failed"),
        `${rel("MediaTile")}: failed variant keeps caption and record link (unconditional render)`,
      );
    }
    const frameMatch = markup.match(/content-media-tile__frame[\s\S]*?<\/div>/);
    check(
      frameMatch !== null && frameMatch[0].includes("__placeholder"),
      `${rel("MediaTile")}: failed media shows a content-free placeholder inside the reserved frame`,
    );
  }
}

// TableOfContents: labelled nav, nested ordered lists for level 1/2,
// current marker via aria-current, fragment links, static (no-JS) links.
requireMarkers("TableOfContents", [
  "<nav",
  "aria-label={label}",
  "aria-current",
  "level",
  "href={`#",
]);
{
  const src = sources.get("TableOfContents");
  if (src !== null) {
    const { markup } = splitFrontmatter(src);
    check(
      (markup.match(/<ol[\s>]/g) || []).length >= 2,
      `${rel("TableOfContents")}: nested ordered lists for level 1 and level 2`,
    );
  }
}

// ContactCTA: statement + primary action composed from ui/Button + optional
// secondary; no ambient pulse (no animation of any kind).
requireMarkers("ContactCTA", [
  'import Button from "../ui/Button.astro"',
  "{statement}",
  "{primary.label}",
  "{secondary.label}",
  'variant="secondary"',
]);
{
  const src = sources.get("ContactCTA");
  if (src !== null) {
    check(
      !/@keyframes/.test(src) && !/animation\s*:/.test(src),
      `${rel("ContactCTA")}: no ambient pulse (no animation)`,
    );
  }
}

// --- cross-layer contracts ------------------------------------------------------
{
  const all = [...sources.values()].filter(Boolean).join("\n");
  for (const name of COMPONENTS) {
    const src = sources.get(name);
    if (src === null) continue;
    for (const m of src.matchAll(/import\s[^;]*?from\s+["']([^"']+)["']/g)) {
      const spec = m[1];
      check(
        spec.startsWith("../ui/") || spec.startsWith("./"),
        `${rel(name)}: imports only ui primitives or sibling content components (found ${spec})`,
      );
    }
    check(!/\bfetch\s*\(/.test(src), `${rel(name)}: never fetches (props-in, markup-out)`);
    check(!src.includes("import.meta.env"), `${rel(name)}: no env reads (props-in, markup-out)`);
  }
  for (const [label, fixture] of [
    ["EN publications", EN_FIXTURES[0]],
    ["EN toc", EN_FIXTURES[1]],
    ["EN read-more", EN_FIXTURES[2]],
    ["FA publications", FA_FIXTURES[0]],
    ["FA toc", FA_FIXTURES[1]],
    ["FA read-more", FA_FIXTURES[2]],
  ]) {
    check(!all.includes(fixture), `fixture "${label}" absent from all components (props-in, markup-out)`);
  }
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`content-components.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `content-components.spec: PASS — ${COMPONENTS.length} content components (${passed.length} structural checks): typed props only, optional-collapse without placeholders, dl/bdi metadata, ol timeline + toc nesting, reserved media aspect with honest failed variant, ui/Button + Chip + Badge + LinkAction composition, token discipline, direction, i18n fixtures clean`,
);
