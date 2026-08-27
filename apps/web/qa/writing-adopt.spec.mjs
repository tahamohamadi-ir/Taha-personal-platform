// WF-07E route-family adoption QA (source scan; mirrors the structural style
// of qa/projects-adopt.spec.mjs and qa/creative-adopt.spec.mjs). Plain Node
// script, no dependencies.
//
// Asserts the writing family (index, series, tag, detail) is composed from
// the shared template/component layer and that the family behavior
// contracts survive the adoption:
//
//   index/series/tag : compose EditorialIndexTemplate; single H1 via
//                      SectionLead as="h1" (no literal <h1>); results are
//                      ContentRow rows; honest ContentState empty panel
//                      when the loader returns []; filters are the
//                      URL-driven series/tag navigation links; the
//                      featured slot stays honestly unfilled (the article
//                      loader exposes no featured flag/pin) and no
//                      pagination is invented
//   detail           : composes LongFormTemplate; single H1 via
//                      SectionLead as="h1"; the toc slot stays honestly
//                      unfilled (StoryBody exposes no headings extraction
//                      with anchor ids, so no TOC data exists today);
//                      body keeps the StoryBody / set:html fallback
//                      branches plus the license/accessibility footer;
//                      related is real related only (series prev/next via
//                      SeriesNav + topic siblings through the primary tag)
//   dates            : display dates go through the shared build-time
//                      formatDate/formatNumber (Jalali for fa via
//                      fa-IR-u-ca-persian); the legacy
//                      toLocaleDateString and raw iso.slice patterns are
//                      gone from the family
//   preserved        : getStaticPaths + slug-redirect behavior, JSON-LD,
//                      alternate/ogImage wiring; rss.xml route sources and
//                      the /blog/** redirect-only pages untouched
//   adopt=delete     : no ArticleCard/ArticleDetail imports remain in the
//                      adopted routes (the shared layer owns rendering)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const pagesRoot = join(webRoot, "src", "pages");

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

function readSource(relativePath) {
  try {
    return readFileSync(join(pagesRoot, relativePath), "utf8");
  } catch {
    return null;
  }
}

// --- per-locale adoption contract ---------------------------------------------
for (const locale of ["en", "fa"]) {
  const depth = "../../../";
  const indexSrc = readSource(join(locale, "writing", "index.astro"));
  const seriesSrc = readSource(join(locale, "writing", "series", "[slug].astro"));
  const tagSrc = readSource(join(locale, "writing", "tag", "[slug].astro"));
  const detailSrc = readSource(join(locale, "writing", "[slug].astro"));

  check(indexSrc !== null, `${locale}: writing/index.astro is readable`);
  check(seriesSrc !== null, `${locale}: writing/series/[slug].astro is readable`);
  check(tagSrc !== null, `${locale}: writing/tag/[slug].astro is readable`);
  check(detailSrc !== null, `${locale}: writing/[slug].astro is readable`);
  if (indexSrc === null || seriesSrc === null || tagSrc === null || detailSrc === null) {
    continue;
  }

  const indexPages = [
    ["index", indexSrc],
    ["series", seriesSrc],
    ["tag", tagSrc],
  ];

  // --- editorial index pages -> EditorialIndexTemplate ------------------------
  for (const [name, src] of indexPages) {
    const up = name === "index" ? depth : "../../../../";
    check(
      src.includes(`from "${up}layouts/EditorialIndexTemplate.astro"`),
      `${locale} writing ${name}: adopted onto EditorialIndexTemplate`,
    );
    check(
      !/<h1[\s>]/.test(src),
      `${locale} writing ${name}: no literal <h1> (single H1 arrives via SectionLead as="h1")`,
    );
    check(
      src.includes("<SectionLead") && src.includes('as="h1"'),
      `${locale} writing ${name}: section lead opens the page as the single H1`,
    );
    check(
      src.includes("<ContentRow"),
      `${locale} writing ${name}: results are ContentRow rows`,
    );
    check(
      src.includes('kind="empty"') && src.includes("blog.empty"),
      `${locale} writing ${name}: honest ContentState empty panel when the loader returns []`,
    );
    check(
      src.includes("formatDate"),
      `${locale} writing ${name}: display dates go through the shared formatDate (Jalali for fa at build time)`,
    );
    check(
      !src.includes("toLocaleDateString"),
      `${locale} writing ${name}: legacy toLocaleDateString date rendering removed`,
    );
    check(
      !src.includes("iso.slice("),
      `${locale} writing ${name}: no raw iso.slice date strings (formatDate owns display dates)`,
    );
    check(
      !src.includes("FeaturedRecord"),
      `${locale} writing ${name}: featured slot honestly unfilled (article loader exposes no featured flag/pin)`,
    );
    check(
      !src.includes("ArticleCard"),
      `${locale} writing ${name}: legacy ArticleCard import removed (adopt equals delete)`,
    );
  }

  // index filters: URL-driven series/tag navigation links
  check(
    indexSrc.includes("/writing/series/") && indexSrc.includes("/writing/tag/"),
    `${locale} writing index: filters slot carries the URL-driven series/tag navigation links`,
  );
  check(
    indexSrc.includes("seriesNavLabel"),
    `${locale} writing index: series nav is labelled with the existing locale copy (blog.seriesNavLabel)`,
  );
  check(
    indexSrc.includes('<Chip variant="taxonomy">'),
    `${locale} writing index: topic tags render as Chip taxonomy links`,
  );
  check(
    !indexSrc.includes('slot="pagination"'),
    `${locale} writing index: pagination slot honestly unfilled (loader has no pagination today)`,
  );

  // --- detail -> LongFormTemplate ----------------------------------------------
  check(
    detailSrc.includes('from "../../../layouts/LongFormTemplate.astro"'),
    `${locale} writing detail: adopted onto LongFormTemplate`,
  );
  check(
    !/<h1[\s>]/.test(detailSrc),
    `${locale} writing detail: no literal <h1> (single H1 arrives via SectionLead as="h1")`,
  );
  check(
    detailSrc.includes("<SectionLead") && detailSrc.includes('as="h1"'),
    `${locale} writing detail: article lead opens the page as the single H1`,
  );
  check(
    detailSrc.includes('slot="articleLead"'),
    `${locale} writing detail: articleLead slot filled (title + meta)`,
  );
  check(
    detailSrc.includes('slot="body"'),
    `${locale} writing detail: body slot filled`,
  );
  check(
    detailSrc.includes('slot="related"'),
    `${locale} writing detail: related slot filled`,
  );
  check(
    !detailSrc.includes("TableOfContents"),
    `${locale} writing detail: toc slot honestly unfilled (StoryBody exposes no headings extraction with anchor ids)`,
  );
  check(
    detailSrc.includes("formatDate") && detailSrc.includes("formatNumber"),
    `${locale} writing detail: lead meta uses formatDate + formatNumber (Jalali + Persian digits for fa at build time)`,
  );
  check(
    !detailSrc.includes("toLocaleDateString"),
    `${locale} writing detail: legacy toLocaleDateString date rendering removed`,
  );
  check(
    detailSrc.includes("import StoryBody") && detailSrc.includes("<StoryBody"),
    `${locale} writing detail: published-story body branch preserved (StoryBody rendering unchanged)`,
  );
  check(
    detailSrc.includes("set:html={article.body}"),
    `${locale} writing detail: plain-body fallback branch preserved`,
  );
  check(
    detailSrc.includes("import SeriesNav") && detailSrc.includes("<SeriesNav"),
    `${locale} writing detail: series prev/next preserved via SeriesNav`,
  );
  check(
    detailSrc.includes("articlesForTag"),
    `${locale} writing detail: topic siblings derive from the existing tag loader (real related only)`,
  );
  check(
    /writing\/\$\{/.test(detailSrc),
    `${locale} writing detail: related links target the canonical writing detail routes`,
  );
  check(
    detailSrc.includes("accessibility_notes") && detailSrc.includes("licenseLabel"),
    `${locale} writing detail: license/accessibility footer content preserved`,
  );
  check(
    detailSrc.includes("getStaticPaths") &&
      detailSrc.includes("redirect:") &&
      detailSrc.includes("Astro.redirect"),
    `${locale} writing detail: static path generation + slug-redirect behavior preserved`,
  );
  check(
    detailSrc.includes("blogPostingJsonLd") && detailSrc.includes("breadcrumbJsonLd"),
    `${locale} writing detail: JSON-LD structured data preserved`,
  );
  check(
    detailSrc.includes("ogImage={article.featured_image"),
    `${locale} writing detail: featured-image og:image wiring preserved`,
  );
  check(
    !detailSrc.includes("ArticleDetail"),
    `${locale} writing detail: legacy ArticleDetail import removed (adopt equals delete)`,
  );

  // --- series/tag keep their existing data sources -------------------------------
  check(
    seriesSrc.includes("articlesForSeries") && seriesSrc.includes("getPublishedSeries"),
    `${locale} writing series: existing series loader data sources preserved`,
  );
  check(
    tagSrc.includes("articlesForTag") && tagSrc.includes("getTopicTags"),
    `${locale} writing tag: existing tag loader data sources preserved`,
  );
  check(
    !seriesSrc.includes("<form") && !tagSrc.includes("<form"),
    `${locale} writing series/tag: no filter form invented (family had none)`,
  );
}

// --- /blog/** redirect-only pages untouched (IA-CONTRACT) ------------------------
for (const locale of ["en", "fa"]) {
  const blogPages = [
    "index.astro",
    "[slug].astro",
    join("series", "[slug].astro"),
    join("tag", "[slug].astro"),
  ];
  for (const page of blogPages) {
    const src = readSource(join(locale, "blog", page));
    check(
      src !== null && src.includes("Astro.redirect"),
      `${locale}/blog/${page.replaceAll("\\", "/")}: redirect-only page untouched (Astro.redirect preserved)`,
    );
  }
}

// --- rss.xml route sources untouched ----------------------------------------------
for (const locale of ["en", "fa"]) {
  const rssSrc = readSource(join(locale, "writing", "rss.xml.ts"));
  check(
    rssSrc !== null,
    `${locale}/writing/rss.xml.ts: RSS route source still present`,
  );
  if (rssSrc !== null) {
    check(
      rssSrc.includes('export const prerender = true') &&
        rssSrc.includes("<rss version=") &&
        rssSrc.includes("getPublishedArticles"),
      `${locale}/writing/rss.xml.ts: RSS generation contract intact (prerendered, rss root, article loader)`,
    );
    check(
      !rssSrc.includes("EditorialIndexTemplate") && !rssSrc.includes("formatDate"),
      `${locale}/writing/rss.xml.ts: RSS route untouched by the template adoption (feed dates stay RFC 822)`,
    );
  }
}

// --- report -------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`writing-adopt.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `writing-adopt.spec: PASS — ${passed.length} adoption checks: fa/en writing index+series+tag compose EditorialIndexTemplate, detail composes LongFormTemplate, ContentRow results with honest empty states, URL-driven series/tag filters, honest featured/pagination/toc omissions, formatDate/formatNumber build-time dates, redirect + RSS + JSON-LD contracts preserved`,
);
