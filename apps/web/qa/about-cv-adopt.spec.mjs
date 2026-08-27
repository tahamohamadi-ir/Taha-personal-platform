// WF-07G adoption QA gate for the About/CV family (source-scan; mirrors the
// structural style of qa/teaching-adopt.spec.mjs). Plain Node script, no
// dependencies. Scans the route sources to enforce the TRACK-WF WF-07G
// contract (adopt the shared template/component layer, keep the family's
// no-JS behavior contracts alive):
//
//   about index : composes UtilityTemplate with the breadcrumbs slot ABSENT
//                 (IA-CONTRACT S7 forbids breadcrumbs on About); single H1
//                 via SectionLead as="h1"; the radio-CSS tab mechanism
//                 markers survive (the exact class/selector hooks
//                 qa/about-tabs.spec.mjs drives); the sticky toolbar offset
//                 consumes --space-sticky-offset; gated-detail link logic
//                 preserved (Latin slug + non-empty body/story); the journey
//                 Timeline renders from profile experience/education when
//                 present; the legacy About component import is retired
//   details     : the gated sub-routes (section index + detail) compose
//                 UtilityTemplate, KEEP breadcrumbs (sub-pages may carry
//                 them; IA-CONTRACT S7 forbids them only on the About index),
//                 and keep the build-time gating (hasDetailContent +
//                 detailSlug) plus the published-story body branch
//   cv          : fa/en CV pages compose UtilityTemplate (no breadcrumbs, per
//                 existing behavior), single H1 via SectionLead as="h1", the
//                 CV download resolver stays the data source and the download
//                 attribute survives, CMS contact source preserved
//   doctrine    : route sources keep token discipline (no raw hex; px only as
//                 1-2px hairlines, sr-only 1px sizing and underline offsets)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");

const pagePaths = {
  enAbout: join(webRoot, "src", "pages", "en", "about.astro"),
  faAbout: join(webRoot, "src", "pages", "fa", "about.astro"),
  enCv: join(webRoot, "src", "pages", "en", "cv.astro"),
  faCv: join(webRoot, "src", "pages", "fa", "cv.astro"),
  sectionIndex: join(webRoot, "src", "pages", "[locale]", "about", "[section]", "index.astro"),
  sectionDetail: join(webRoot, "src", "pages", "[locale]", "about", "[section]", "[slug].astro"),
};

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

const sources = {};
for (const [key, path] of Object.entries(pagePaths)) {
  try {
    sources[key] = readFileSync(path, "utf8");
  } catch {
    sources[key] = null;
    failures.push(`missing route source: ${key} (${path})`);
  }
}

const UTILITY_IMPORT = /import\s+UtilityTemplate\s+from\s+"(\.\.\/)+layouts\/UtilityTemplate\.astro"/;
const SECTION_LEAD_IMPORT = /import\s+SectionLead\s+from\s+"(\.\.\/)+components\/content\/SectionLead\.astro"/;
const TIMELINE_IMPORT = /import\s+Timeline\s+from\s+"(\.\.\/)+components\/content\/Timeline\.astro"/;

// px discipline: 1-2px only, except the kit-practiced text-underline-offset
// (hairline widths, sr-only 1px sizing and underline offsets are the accepted
// px roles; anything else must come from tokens).
function pxViolations(source) {
  const styleBlocks = [...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  const problems = [];
  for (const block of styleBlocks) {
    const css = block.replace(/\/\*[\s\S]*?\*\//g, " ");
    for (const rule of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      for (const decl of rule[2].split(";").map((d) => d.trim()).filter(Boolean)) {
        if (/^text-underline-offset/.test(decl)) continue;
        for (const m of decl.matchAll(/\b(\d+(?:\.\d+)?)px\b/g)) {
          const hairline = m[1] === "1" || m[1] === "2";
          if (!hairline) problems.push(decl);
        }
      }
    }
  }
  return problems;
}

// --- about index (both locales) ---------------------------------------------
const TAB_HOOKS = [
  'name="about-sections"',
  "about-show-all",
  "about-tab-toolbar",
  "about-tab-panels",
  "about-tab-panel",
  "about-tab-label",
  "about-panel-heading",
  "about-panel-skills",
  "about-filter-input",
  "about-filter-item",
  "about-filter-chip",
  "about-filter-empty",
  'label[for="about-show-all"]',
];

for (const locale of ["en", "fa"]) {
  const src = sources[`${locale}About`];
  if (src === null) continue;

  check(
    UTILITY_IMPORT.test(src),
    `${locale} about: adopted onto UtilityTemplate`,
  );
  check(
    SECTION_LEAD_IMPORT.test(src) && /<SectionLead\s+slot="lead"\s+as="h1"/.test(src),
    `${locale} about: single H1 arrives via SectionLead as="h1" in the lead slot`,
  );
  check(
    !/<h1[\s>]/.test(src),
    `${locale} about: no literal <h1> (single H1 via the lead slot)`,
  );
  check(
    !src.includes("slot=\"breadcrumbs\"") &&
      !src.replace(/\/\*[\s\S]*?\*\//g, " ").includes("Breadcrumbs"),
    `${locale} about: breadcrumbs slot ABSENT (IA-CONTRACT S7 forbids breadcrumbs on About)`,
  );

  // Tab mechanism markers must survive (about-tabs.spec drives these hooks).
  for (const hook of TAB_HOOKS) {
    check(src.includes(hook), `${locale} about: tab mechanism marker preserved: ${hook}`);
  }
  check(
    /top:\s*var\(--space-sticky-offset\)/.test(src),
    `${locale} about: sticky toolbar consumes --space-sticky-offset`,
  );

  // Gated-detail link logic preserved (Latin slug + non-empty body/story).
  check(
    /detailHref\(/.test(src) &&
      src.includes("detailBody") &&
      src.includes("detail_body") &&
      src.includes("entry.story") &&
      /\/about\/\$\{/.test(src),
    `${locale} about: gated-detail link logic preserved (slug + body/story gate)`,
  );

  // Journey Timeline renders from profile experience/education when present.
  check(
    TIMELINE_IMPORT.test(src) && /<Timeline\s+items=/.test(src),
    `${locale} about: journey renders via the shared Timeline component`,
  );
  check(
    /profile\.experience\.length\s*>\s*0/.test(src) && /profile\.education\.length\s*>\s*0/.test(src),
    `${locale} about: journey Timeline is gated on profile experience/education data`,
  );

  // Adopt equals retire: the legacy family component no longer renders About.
  check(
    !src.includes("components/About.astro") && !src.includes("<About"),
    `${locale} about: legacy About component import retired`,
  );

  check(
    src.includes("loadPublicProfile") && src.includes("cmsBuildOrigin={profileResult.source}"),
    `${locale} about: CMS profile loader stays the data source; cms-build-origin preserved`,
  );

  const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${locale} about: no raw hex colors${hex ? ` (found ${hex.join(", ")})` : ""}`);
  const px = pxViolations(src);
  check(
    px.length === 0,
    `${locale} about: px only as 1-2px hairline widths${px.length ? ` (found ${px.join(" | ")})` : ""}`,
  );
}

// --- gated sub-routes: section index + detail (locale-generic [locale] files) --
{
  const indexSrc = sources.sectionIndex;
  const detailSrc = sources.sectionDetail;
  if (indexSrc !== null) {
    check(UTILITY_IMPORT.test(indexSrc), "section index: adopted onto UtilityTemplate");
    check(
      /<Breadcrumbs\s+slot="breadcrumbs"/.test(indexSrc),
      "section index: breadcrumbs kept on the gated sub-page (slot filled)",
    );
    check(
      SECTION_LEAD_IMPORT.test(indexSrc) && /<SectionLead\s+slot="lead"\s+as="h1"/.test(indexSrc),
      "section index: single H1 via SectionLead as=\"h1\" in the lead slot",
    );
    check(
      !/<h1[\s>]/.test(indexSrc),
      "section index: no literal <h1>",
    );
    check(
      indexSrc.includes("hasDetailContent") &&
        indexSrc.includes("detailSlug") &&
        indexSrc.includes("getStaticPaths"),
      "section index: build-time detail gating preserved (hasDetailContent + detailSlug)",
    );
    check(
      indexSrc.includes("loadPublicProfile"),
      "section index: CMS profile loader stays the data source",
    );
  }
  if (detailSrc !== null) {
    check(UTILITY_IMPORT.test(detailSrc), "section detail: adopted onto UtilityTemplate");
    check(
      /<Breadcrumbs\s+slot="breadcrumbs"/.test(detailSrc),
      "section detail: breadcrumbs kept on the gated sub-page (slot filled)",
    );
    check(
      SECTION_LEAD_IMPORT.test(detailSrc) && /<SectionLead\s+as="h1"/.test(detailSrc),
      "section detail: single H1 via SectionLead as=\"h1\" in the lead slot",
    );
    check(
      !/<h1[\s>]/.test(detailSrc),
      "section detail: no literal <h1>",
    );
    check(
      detailSrc.includes("hasDetailContent") &&
        detailSrc.includes("detailSlug") &&
        detailSrc.includes("getStaticPaths"),
      "section detail: build-time detail gating preserved (hasDetailContent + detailSlug)",
    );
    check(
      /import\s+StoryBody\s+from/.test(detailSrc) && /<StoryBody/.test(detailSrc),
      "section detail: published-story body branch preserved via StoryBody",
    );
    check(
      detailSrc.includes("hasPublishedStory") && detailSrc.includes("detailBody"),
      "section detail: detailBody fallback paragraphs preserved",
    );
  }
}

// --- CV pages (both locales) ---------------------------------------------------
for (const locale of ["en", "fa"]) {
  const src = sources[`${locale}Cv`];
  if (src === null) continue;

  check(
    UTILITY_IMPORT.test(src),
    `${locale} cv: adopted onto UtilityTemplate`,
  );
  check(
    SECTION_LEAD_IMPORT.test(src) && /<SectionLead\s+slot="lead"\s+as="h1"/.test(src),
    `${locale} cv: single H1 arrives via SectionLead as="h1" in the lead slot`,
  );
  check(
    !/<h1[\s>]/.test(src),
    `${locale} cv: no literal <h1> (single H1 via the lead slot)`,
  );
  check(
    !src.includes("slot=\"breadcrumbs\"") &&
      !src.replace(/\/\*[\s\S]*?\*\//g, " ").includes("Breadcrumbs"),
    `${locale} cv: no breadcrumbs (existing CV behavior kept)`,
  );
  check(
    src.includes("resolveCvDownloadFiles"),
    `${locale} cv: CV download resolver stays the data source`,
  );
  check(
    /download=\{file\.downloadName\}/.test(src) && /href=\{file\.href\}/.test(src),
    `${locale} cv: download rows keep href + download attribute`,
  );
  check(
    src.includes("getSiteContact"),
    `${locale} cv: CMS contact source preserved (approved contact path)`,
  );
  check(
    src.includes("downloads.fallback"),
    `${locale} cv: honest download-fallback notice preserved`,
  );
  check(
    !src.includes("components/Downloads.astro") && !src.includes("<Downloads"),
    `${locale} cv: legacy Downloads component import retired`,
  );

  const hex = src.match(/#[0-9a-fA-F]{3,8}\b/g);
  check(!hex, `${locale} cv: no raw hex colors${hex ? ` (found ${hex.join(", ")})` : ""}`);
  const px = pxViolations(src);
  check(
    px.length === 0,
    `${locale} cv: px only as 1-2px hairline widths${px.length ? ` (found ${px.join(" | ")})` : ""}`,
  );
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`about-cv-adopt.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `about-cv-adopt.spec: PASS — ${passed.length} adoption checks: fa/en About + CV composed from ` +
    "UtilityTemplate (About/CV without breadcrumbs, gated sub-routes with), single H1 via " +
    "SectionLead, radio-CSS tab mechanism + sticky-offset token preserved, gated-detail logic " +
    "and published-story branch kept, journey Timeline from profile data, legacy family " +
    "components retired, doctrine-clean sources",
);
