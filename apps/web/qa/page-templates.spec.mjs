// WF-05 structural QA gate for the six shared page templates
// (TRACK-WF packet WF-05, gate G3).
//
// Plain Node script, no dependencies. Parses the template sources in
// src/layouts/ and enforces the agent-kit templates.json v1.0.0 region
// contracts plus the TRACK-WF S7 doctrine, mirroring the
// content-components spec style:
//
//   files      : all six template files exist and map 1:1 onto the six
//                templates.json ids
//   route-map  : ROUTE_MAP maps every canonical route family to exactly
//                ONE template and covers exactly the IA-CONTRACT S4 live
//                families plus the kit target families; the gateway /,
//                404, blog/** and rss.xml are not template families
//   slots      : required regions render unconditionally (no
//                Astro.slots.has gate in the markup); optional regions
//                render only when their slot has content (frontmatter
//                guard + conditional wrapper), so an absent optional
//                region leaves no wrapper gap
//   h1         : no literal <h1 in any template - the single H1 arrives
//                through the template's lead region as SectionLead
//                as="h1" filled by the route
//   landmarks  : templates own no site chrome (no main/header/footer
//                elements, zero imports); the single <main id="main">,
//                header and footer come from BaseLayout, which every
//                adopted page composes - landmark order is asserted
//                against the shell source (skip-link -> Header ->
//                main -> Footer)
//   detail     : LongFormTemplate and EvidenceDetailTemplate reject
//                empty linked detail shells - a missing lead/body slot
//                throws at build time instead of rendering a hollow page
//   order      : region order follows templates.json; Home keeps the
//                canonical 8-block narrative and validates the guarded
//                CMS composition seam (WF-07A homeComposition adapter)
//   measure    : --measure-page container everywhere; prose-carrying
//                regions cap at --measure-prose
//   doctrine   : zero imports (no fetch / env / route policy), no raw
//                hex/px/rem/ms, logical properties, no theme logic, no
//                tabindex, no hover-lift, no hardcoded UI text, ASCII
//                sources, style blocks <= 40 lines, "Seams:" documented

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const layoutsDir = join(webRoot, "src", "layouts");
const kitTemplatesPath = join(
  webRoot,
  "..",
  "..",
  "Assets",
  "site-redesign",
  "implementation-reference",
  "agent-kit",
  "templates.json",
);

// templates.json id -> layout file (1:1).
const TEMPLATES = {
  home: "HomeTemplate",
  "collection-index": "CollectionIndexTemplate",
  "editorial-index": "EditorialIndexTemplate",
  "long-form-detail": "LongFormTemplate",
  "evidence-visual-detail": "EvidenceDetailTemplate",
  "about-contact-utility": "UtilityTemplate",
};
const TEMPLATE_IDS = Object.keys(TEMPLATES);
const TEMPLATE_FILES = Object.values(TEMPLATES);

// Region contracts per template (slots live inside the shell <main>).
// Header/Footer are shell regions owned by BaseLayout, so they are not
// template slots. Documented deviations from the raw templates.json
// required list:
//   home   : graph/researchFit/journey are kit-required narrative
//            blocks, but IA-CONTRACT S9 says omit blocks 2-7 rather
//            than invent content and WF-07A omits blocks with missing
//            module data, so they render only when their slot has
//            content; only the narrative frame (lead + cta) is
//            required. The guarded order prop keeps the canonical plan
//            as the default.
//   utility: breadcrumbs keep their templates.json seam, but
//            IA-CONTRACT S7 forbids breadcrumbs on About/Contact/Search
//            while CV may carry them, so the wrapper renders only when
//            the slot is filled.
const REGION_CONTRACT = {
  home: {
    required: ["lead", "cta"],
    optional: ["graph", "researchFit", "journey", "projects", "publications", "previews"],
    order: null, // composition-driven (guarded order prop)
  },
  "collection-index": {
    required: ["breadcrumbs", "sectionLead", "filters", "results", "pagination"],
    optional: [],
    order: ["breadcrumbs", "sectionLead", "filters", "results", "pagination"],
  },
  "editorial-index": {
    required: ["breadcrumbs", "sectionLead", "filters", "results", "pagination"],
    optional: ["featured"],
    order: ["breadcrumbs", "sectionLead", "featured", "filters", "results", "pagination"],
  },
  "long-form-detail": {
    required: ["breadcrumbs", "articleLead", "toc", "body", "related"],
    optional: [],
    order: ["breadcrumbs", "articleLead", "toc", "body", "related"],
  },
  "evidence-visual-detail": {
    required: ["breadcrumbs", "lead", "metadata", "body", "related"],
    optional: ["media", "limitations"],
    order: ["breadcrumbs", "lead", "metadata", "media", "body", "limitations", "related"],
  },
  "about-contact-utility": {
    required: ["lead", "content"],
    optional: ["breadcrumbs"],
    order: ["breadcrumbs", "lead", "content"],
  },
};

// Canonical home narrative (templates.json homepageOrder, kit order).
const HOME_CANONICAL_ORDER = [
  "lead",
  "graph",
  "researchFit",
  "journey",
  "projects",
  "publications",
  "previews",
  "cta",
];
const HOME_FRAME_BLOCKS = ["lead", "cta"];

// IA-CONTRACT S4 "Live today (2026-08-26)" content families. Gateway /,
// 404 (gateway-styled), /{locale}/blog/** (permanent redirects) and
// writing/rss.xml (feed) are NOT template families (IA-CONTRACT S1/S4/S5).
// Research-tree detail pages (statement/topics/projects children) are
// folded into "research statement" / "research topics" / "research
// detail"; the canonical publication detail stays /publications/{slug}/.
const LIVE_FAMILIES = [
  "home",
  "about",
  "cv",
  "writing",
  "writing series",
  "writing tag",
  "writing detail",
  "research",
  "research statement",
  "research topics",
  "research detail",
  "projects",
  "project detail",
  "publications",
  "publication detail",
  "books",
  "book detail",
  "talks",
  "talk detail",
  "downloads",
  "download detail",
  "contact",
  "search",
];

// Kit target families (templates.json routes) not yet in the live list.
const TARGET_FAMILIES = ["creative", "creative detail", "teaching", "teaching detail"];

// Canonical family -> template. One template per family; all six
// templates are used. Publications/books/talks/downloads details are
// evidence records, their indexes are collection catalogs, search is a
// utility page (IA-CONTRACT S7 groups it with About/Contact).
const ROUTE_MAP = {
  home: "HomeTemplate",
  about: "UtilityTemplate",
  cv: "UtilityTemplate",
  contact: "UtilityTemplate",
  search: "UtilityTemplate",
  writing: "EditorialIndexTemplate",
  "writing series": "EditorialIndexTemplate",
  "writing tag": "EditorialIndexTemplate",
  teaching: "EditorialIndexTemplate",
  "writing detail": "LongFormTemplate",
  "teaching detail": "LongFormTemplate",
  "research statement": "LongFormTemplate",
  projects: "CollectionIndexTemplate",
  creative: "CollectionIndexTemplate",
  research: "CollectionIndexTemplate",
  "research topics": "CollectionIndexTemplate",
  publications: "CollectionIndexTemplate",
  books: "CollectionIndexTemplate",
  talks: "CollectionIndexTemplate",
  downloads: "CollectionIndexTemplate",
  "project detail": "EvidenceDetailTemplate",
  "research detail": "EvidenceDetailTemplate",
  "publication detail": "EvidenceDetailTemplate",
  "creative detail": "EvidenceDetailTemplate",
  "book detail": "EvidenceDetailTemplate",
  "talk detail": "EvidenceDetailTemplate",
  "download detail": "EvidenceDetailTemplate",
};

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

// --- load -------------------------------------------------------------------
const sources = new Map();
for (const id of TEMPLATE_IDS) {
  const file = TEMPLATES[id];
  try {
    sources.set(id, readFileSync(join(layoutsDir, `${file}.astro`), "utf8"));
  } catch {
    sources.set(id, null);
    failures.push(`missing template file: src/layouts/${file}.astro`);
  }
}

const rel = (id) => `src/layouts/${TEMPLATES[id]}.astro`;

// --- source helpers (mirrors the content-components spec) ---------------------
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

const pascal = (s) =>
  s
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");

// --- kit integrity -------------------------------------------------------------
{
  let kit = null;
  try {
    kit = JSON.parse(readFileSync(kitTemplatesPath, "utf8"));
  } catch {
    kit = null;
  }
  check(kit !== null, "kit: agent-kit/templates.json is readable");
  if (kit) {
    const ids = Array.isArray(kit.templates) ? kit.templates.map((t) => t.id) : [];
    check(
      ids.length === TEMPLATE_IDS.length && TEMPLATE_IDS.every((id) => ids.includes(id)),
      "kit: templates.json defines exactly the six template ids this packet implements",
    );
    check(
      Array.isArray(kit.homepageOrder) && kit.homepageOrder.length === HOME_CANONICAL_ORDER.length,
      "kit: homepageOrder defines the 8-block home narrative",
    );
  }
}

// --- route map -----------------------------------------------------------------
check(
  JSON.stringify(Object.keys(REGION_CONTRACT).sort()) === JSON.stringify([...TEMPLATE_IDS].sort()),
  "contract: region contracts are defined for exactly the six templates",
);
check(
  Object.keys(ROUTE_MAP).length === LIVE_FAMILIES.length + TARGET_FAMILIES.length,
  `route-map: family count matches live + target families exactly (found ${Object.keys(ROUTE_MAP).length}, expected ${LIVE_FAMILIES.length + TARGET_FAMILIES.length})`,
);
for (const family of LIVE_FAMILIES) {
  check(family in ROUTE_MAP, `route-map: live family "${family}" maps to exactly one template`);
}
{
  const extra = Object.keys(ROUTE_MAP).filter(
    (key) => !LIVE_FAMILIES.includes(key) && !TARGET_FAMILIES.includes(key),
  );
  check(
    extra.length === 0,
    `route-map: no invented families beyond IA live + kit target${extra.length ? ` (found ${extra.join(", ")})` : ""}`,
  );
}
for (const [family, template] of Object.entries(ROUTE_MAP)) {
  check(
    TEMPLATE_FILES.includes(template),
    `route-map: "${family}" maps to a known template (${template})`,
  );
}
{
  const used = new Set(Object.values(ROUTE_MAP));
  check(
    used.size === TEMPLATE_FILES.length && TEMPLATE_FILES.every((file) => used.has(file)),
    "route-map: all six templates cover at least one canonical family",
  );
}
for (const excluded of ["gateway", "404", "blog", "rss.xml"]) {
  check(
    !(excluded in ROUTE_MAP),
    `route-map: "${excluded}" is not a template family (gateway-styled, redirect-only or feed per IA-CONTRACT S1/S4/S5)`,
  );
}

// --- shell landmark guarantee (single <main>, header/footer ownership) ----------
{
  let base = null;
  try {
    base = readFileSync(join(webRoot, "src", "layouts", "BaseLayout.astro"), "utf8");
  } catch {
    base = null;
  }
  check(base !== null, "shell: src/layouts/BaseLayout.astro is readable");
  if (base !== null) {
    const skip = base.indexOf('class="skip-link"');
    const headerTag = base.indexOf("<Header");
    const mainTag = base.indexOf("<main");
    const footerTag = base.indexOf("<Footer");
    check(
      base.includes('<main id="main"') &&
        skip >= 0 &&
        headerTag > skip &&
        mainTag > headerTag &&
        footerTag > mainTag,
      "shell: BaseLayout owns the single main landmark - order skip-link -> Header -> <main id=main> -> Footer",
    );
  }
}

// --- per-template contracts -----------------------------------------------------
for (const id of TEMPLATE_IDS) {
  const src = sources.get(id);
  if (src === null) continue;
  const { fm, markup } = splitFrontmatter(src);
  const contract = REGION_CONTRACT[id];

  // one H1 comes from SectionLead as="h1" in the lead slot - never literal
  check(!/<h1[\s>]/.test(src), `${rel(id)}: no literal <h1> (H1 arrives via the lead slot)`);

  // templates own no site chrome and no dependencies at all
  check(!/<main[\s>]/.test(src), `${rel(id)}: renders no <main> of its own (single shell landmark)`);
  check(!/<header[\s>]/.test(markup), `${rel(id)}: renders no <header> element (shell owns the banner)`);
  check(!/<footer[\s>]/.test(markup), `${rel(id)}: renders no <footer> element (shell owns the footer)`);
  check(!/(^|\n)\s*import\b/.test(src), `${rel(id)}: zero imports (semantic composition only - no shell/cms/data coupling)`);
  check(
    !src.includes("Astro.url") && !src.includes("new URL(") && !/\bfetch\s*\(/.test(src) && !src.includes("import.meta.env"),
    `${rel(id)}: no route policy, canonical construction or data fetching`,
  );

  // extension seams documented at declaration site (S7.4)
  check(fm.includes("Seams:"), `${rel(id)}: frontmatter documents its extension seams`);

  // reading measure
  check(src.includes("--measure-page"), `${rel(id)}: page container uses --measure-page`);

  // style budget (S7.3 row 4)
  const styleBlocks = [...markup.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  check(styleBlocks.length > 0, `${rel(id)}: owns its region layout styles`);
  for (const block of styleBlocks) {
    const lines = block.split("\n").length;
    check(lines <= 40, `${rel(id)}: style block stays within 40 lines (found ${lines})`);
  }

  // doctrine scans (same bar as the content components)
  const styles = extractStyles(markup);
  const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${rel(id)}: no raw hex colors${hex ? ` (found ${hex.join(", ")})` : ""}`);
  const ms = src.match(/\b\d+ms\b/g);
  check(!ms, `${rel(id)}: no raw ms durations${ms ? ` (found ${ms.join(", ")})` : ""}`);
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
    `${rel(id)}: px only as 1-2px hairline widths${pxProblems.length ? ` (found ${pxProblems.join(" | ")})` : ""}`,
  );
  const rem = styles.match(/\b\d+(?:\.\d+)?rem\b/g);
  check(!rem, `${rel(id)}: no raw rem lengths in styles${rem ? ` (found ${rem.join(", ")})` : ""}`);
  check(!/data-theme|prefers-color-scheme/.test(src), `${rel(id)}: no theme logic (tokens cascade)`);
  const dirBad = styles.match(/\b(left|right)\s*:|\b(margin|padding|inset)-(left|right)\b/g);
  check(!dirBad, `${rel(id)}: logical properties only${dirBad ? ` (found ${dirBad.join(", ")})` : ""}`);
  check(!/tabindex/.test(src), `${rel(id)}: no tabindex hacks`);
  check(!/translateY|translate3d/.test(src), `${rel(id)}: no hover-lift transforms`);
  const faChars = src.match(/[\u0600-\u06FF\u200C]/g);
  check(!faChars, `${rel(id)}: no hardcoded Persian text (strings arrive via slots)`);
  check(!/[^\x00-\x7F]/.test(src), `${rel(id)}: ASCII-only source`);
  {
    const markupNoStyle = markup.replace(/<style[^>]*>[\s\S]*?<\/style>/g, " ");
    const markupClean = stripExpressions(markupNoStyle.replace(/<!--[\s\S]*?-->/g, " "));
    const textNodes = [...markupClean.matchAll(/>([^<]*)</g)]
      .map((m) => m[1].trim())
      .filter((t) => /[A-Za-z]{3,}/.test(t));
    check(
      textNodes.length === 0,
      `${rel(id)}: no hardcoded text nodes${textNodes.length ? ` (found ${JSON.stringify(textNodes)})` : ""}`,
    );
    const langAttrs = [...markupClean.matchAll(/\b(aria-label|placeholder|title|alt)="([^"]*)"/g)]
      .map((m) => m[2])
      .filter((v) => /[A-Za-z]{2,}/.test(v));
    check(
      langAttrs.length === 0,
      `${rel(id)}: no hardcoded natural-language attribute copy${langAttrs.length ? ` (found ${JSON.stringify(langAttrs)})` : ""}`,
    );
  }

  if (id === "home") {
    // Home composes the canonical 8-block narrative through the guarded
    // order prop; blocks render in composition order.
    check(fm.includes("interface Props"), `${rel(id)}: declares a typed Props interface`);
    check(fm.includes("order?:"), `${rel(id)}: exposes the guarded CMS composition order seam (order prop)`);
    check(
      fm.includes(`[${HOME_CANONICAL_ORDER.map((b) => `"${b}"`).join(", ")}]`),
      `${rel(id)}: canonical block plan matches the templates.json homepageOrder narrative`,
    );
    check(
      fm.includes(`[${HOME_FRAME_BLOCKS.map((b) => `"${b}"`).join(", ")}]`),
      `${rel(id)}: narrative frame (lead + cta) is required in every composition`,
    );
    check(
      (fm.match(/throw new Error\(/g) || []).length >= 3,
      `${rel(id)}: guarded ordering rejects unknown, duplicate and missing frame blocks`,
    );
    check(
      fm.includes("Astro.slots.has(block)") && fm.includes("Astro.slots.render(block)"),
      `${rel(id)}: optional blocks render only when their slot has content, in composition order`,
    );
    check(
      markup.includes("set:html") && markup.includes("tpl-home"),
      `${rel(id)}: renders the composed block stream inside the template container`,
    );
    continue;
  }

  // static templates: every region has its slot; required regions render
  // unconditionally (no markup-level has() gate); optional regions are
  // slot-guarded with a conditional wrapper (no wrapper gap when absent)
  for (const region of contract.required) {
    check(markup.includes(`<slot name="${region}"`), `${rel(id)}: required region slot present: ${region}`);
    check(
      !markup.includes(`Astro.slots.has("${region}")`),
      `${rel(id)}: required region renders unconditionally (no wrapper gate): ${region}`,
    );
  }
  for (const region of contract.optional) {
    check(src.includes(`Astro.slots.has("${region}")`), `${rel(id)}: optional region is slot-guarded: ${region}`);
    check(
      new RegExp(`has${pascal(region)}\\s*&&\\s*\\(`).test(markup),
      `${rel(id)}: optional region wrapper is conditional: ${region}`,
    );
    check(markup.includes(`<slot name="${region}"`), `${rel(id)}: optional region slot present: ${region}`);
  }
  if (contract.order !== null) {
    const positions = contract.order.map((region) => markup.indexOf(`<slot name="${region}"`));
    check(
      positions.every((p) => p >= 0) && positions.every((p, i) => i === 0 || p > positions[i - 1]),
      `${rel(id)}: region order follows templates.json (${contract.order.join(" -> ")})`,
    );
    check(
      contract.order.length === contract.required.length + contract.optional.length &&
        contract.required.every((r) => contract.order.includes(r)) &&
        contract.optional.every((r) => contract.order.includes(r)),
      `${rel(id)}: region contract covers required + optional exactly`,
    );
  }
}

// --- prose measure on prose-carrying regions -------------------------------------
for (const id of ["long-form-detail", "evidence-visual-detail"]) {
  const src = sources.get(id);
  if (src === null) continue;
  check(src.includes("--measure-prose"), `${rel(id)}: prose-carrying region caps at --measure-prose`);
}

// --- detail templates reject empty linked detail shells ---------------------------
{
  const src = sources.get("long-form-detail");
  if (src !== null) {
    const { fm } = splitFrontmatter(src);
    check(
      fm.includes('Astro.slots.has("articleLead")') &&
        fm.includes('Astro.slots.has("body")') &&
        fm.includes("throw new Error("),
      "long-form: rejects empty linked detail shells (missing articleLead/body throws at build time)",
    );
  }
}
{
  const src = sources.get("evidence-visual-detail");
  if (src !== null) {
    const { fm } = splitFrontmatter(src);
    check(
      fm.includes('Astro.slots.has("lead")') &&
        fm.includes('Astro.slots.has("body")') &&
        fm.includes("throw new Error("),
      "evidence: rejects empty linked detail shells (missing lead/body throws at build time)",
    );
  }
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`page-templates.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `page-templates.spec: PASS — ${TEMPLATE_IDS.length} page templates (${passed.length} structural checks): six templates cover every canonical route family exactly once, required regions render unconditionally, optional regions collapse without wrapper gaps, detail templates reject empty shells, one H1 via the lead slot, shell-owned landmark order, reading measure, token discipline`,
);
