// WF-03 structural QA gate for the public shell + language gateway.
//
// Plain Node script, no dependencies. Parses the shell sources and enforces
// the IA-CONTRACT (S1/S4/S7) + DESIGN-CONTRACT (S2b/S3) rules for WF-03:
//
//   files       : BaseLayout/Header/Footer/Breadcrumbs/ThemeToggle/gateway exist
//   gateway     : pages/index.astro is standalone (no BaseLayout), always-night
//                 (data-theme="dark"), offers BOTH /en/ and /fa/ via the ui
//                 Button primitive (primary + secondary), never auto-redirects,
//                 and keeps the .gateway-actions hook the mobile-overflow QA
//                 drives against
//   theming     : BaseLayout carries a pre-paint inline script that resolves
//                 localStorage("theme") light|dark|system with a
//                 prefers-color-scheme fallback onto data-theme; ThemeToggle
//                 cycles the same three modes, persists to localStorage and
//                 writes the resolved theme
//   landmarks   : skip-link targets #main, <main id="main">, html lang/dir
//                 bound per locale, fa=rtl / en=ltr in the locale dictionary
//   nav         : live nav contract (About/Research/Projects/Writing/More
//                 details with P8 catalogs/CV/Contact/Search/language), the
//                 More <details> summary takes aria-current when a child is
//                 current, parent-section activation is prefix-based while
//                 the brand home link stays exact-match only
//   targets     : header links keep the 44px floor (2.75rem) with the
//                 DEFER-0035 named exception documented
//   honesty     : language switch targets come from the real alternateHref
//                 when a translation exists, else the other locale root
//                 (never path-segment replacement); footer explore covers the
//                 live sitemap; every header/footer route resolves to a real
//                 page file for BOTH locales
//   breadcrumbs : ordered list inside a labelled nav, current page carries
//                 aria-current="page", visual component only (no microdata)
//   glass       : header + gateway consume the shared .glass-surface
//                 utilities; no second glass implementation in the shell

import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const srcRoot = join(webRoot, "src");

const failures = [];
const passed = [];
const check = (ok, message) => {
  if (ok) passed.push(message);
  else failures.push(message);
  return ok;
};

const readSrc = (relPath) => {
  const full = join(srcRoot, ...relPath.split("/"));
  try {
    return readFileSync(full, "utf8");
  } catch {
    return null;
  }
};

// --- 1. files exist -----------------------------------------------------------
const SHELL_FILES = [
  "layouts/BaseLayout.astro",
  "components/Header.astro",
  "components/Footer.astro",
  "components/Breadcrumbs.astro",
  "components/navigation/ThemeToggle.astro",
  "pages/index.astro",
];
for (const relPath of SHELL_FILES) {
  check(readSrc(relPath) !== null, `shell file present: src/${relPath}`);
}

const base = readSrc("layouts/BaseLayout.astro") ?? "";
const header = readSrc("components/Header.astro") ?? "";
const footer = readSrc("components/Footer.astro") ?? "";
const crumbs = readSrc("components/Breadcrumbs.astro") ?? "";
const toggle = readSrc("components/navigation/ThemeToggle.astro") ?? "";
const gateway = readSrc("pages/index.astro") ?? "";
const contentDict = readSrc("data/content.ts") ?? "";
const astroConfig = readFileSync(join(webRoot, "astro.config.mjs"), "utf8");

// --- 2. language gateway (src/pages/index.astro) -------------------------------
check(
  !/import\s+[^;]*layouts\/BaseLayout\.astro/.test(gateway),
  "gateway: standalone page (does not import BaseLayout)",
);
check(/<!doctype html/i.test(gateway), "gateway: renders its own document");
check(
  /<html[^>]*data-theme="dark"/.test(gateway),
  "gateway: always-night via data-theme=\"dark\" on <html>",
);
check(/<html[^>]*lang="en"/.test(gateway), "gateway: lang=en on <html>");
check(/<html[^>]*dir="ltr"/.test(gateway), "gateway: dir=ltr on <html>");
check(
  gateway.includes('content="#071225"'),
  "gateway: theme-color mirrors the --canvas-night token (#071225)",
);
check(
  !/http-equiv=["']refresh/i.test(gateway),
  "gateway: no meta-refresh (the Language Gateway never redirects)",
);
check(
  !/redirects\s*:/.test(astroConfig),
  "gateway: no redirects table in astro.config.mjs (S1: / must not redirect)",
);
check(
  gateway.includes("../components/ui/Button.astro"),
  "gateway: consumes the ui/Button primitive (no second button implementation)",
);
{
  const buttonUses = (gateway.match(/<Button\b/g) || []).length;
  check(buttonUses >= 2, `gateway: two Button actions to the locale roots (found ${buttonUses})`);
  check(
    gateway.includes('variant="primary"') && gateway.includes('variant="secondary"'),
    "gateway: actions use primary + secondary variants (one primary CTA rule)",
  );
}
check(
  gateway.includes('href="/en/"') && gateway.includes('href="/fa/"'),
  "gateway: offers BOTH /en/ and /fa/ entry links",
);
check(
  gateway.includes("gateway.englishLabel") &&
    gateway.includes("gateway.persianLabel") &&
    gateway.includes("gateway.prompt"),
  "gateway: copy comes from the content.ts gateway strings (no invented copy)",
);
check(
  gateway.includes("gateway-actions"),
  "gateway: keeps the .gateway-actions nav (mobile-overflow QA control hook)",
);
check(
  gateway.includes('id="main"') && gateway.includes("skip-link"),
  "gateway: skip link targets #main",
);

// --- 3. theming (BaseLayout pre-paint script + ThemeToggle) --------------------
check(
  base.includes('localStorage.getItem("theme")'),
  "BaseLayout: theme mode read from localStorage key \"theme\"",
);
check(
  base.includes("prefers-color-scheme: dark"),
  "BaseLayout: system mode resolves via prefers-color-scheme",
);
check(
  /dataset\.theme|setAttribute\(["']data-theme/.test(base),
  "BaseLayout: resolved theme written to data-theme on <html>",
);
check(
  /<script[^>]*is:inline[^>]*>/.test(base),
  "BaseLayout: theme script is inline (pre-paint, not module-deferred)",
);
check(
  base.includes('href="#main"') && base.includes('<main id="main"'),
  "BaseLayout: skip-link targets <main id=\"main\">",
);
check(
  base.includes("lang={content.lang}") && base.includes("dir={content.dir}"),
  "BaseLayout: html lang/dir bound per locale props",
);
check(
  contentDict.includes('dir: "rtl"') && contentDict.includes('dir: "ltr"'),
  "content.ts: fa=rtl and en=ltr directions declared",
);

check(
  /["']light["']\s*,\s*["']dark["']\s*,\s*["']system["']/.test(toggle),
  "ThemeToggle: cycles light -> dark -> system",
);
check(
  toggle.includes('localStorage.setItem("theme"'),
  "ThemeToggle: persists the chosen mode to localStorage",
);
check(
  /dataset\.theme|setAttribute\(["']data-theme/.test(toggle),
  "ThemeToggle: writes the resolved data-theme on <html>",
);
check(
  toggle.includes("prefers-color-scheme: dark"),
  "ThemeToggle: system mode applies the OS preference",
);
check(
  /interface Props\b/.test(toggle) && /label\s*:\s*string/.test(toggle) &&
    /label=\{label\}/.test(toggle),
  "ThemeToggle: accessible name arrives localized via the label prop",
);
check(
  header.includes("ThemeToggle"),
  "Header: renders the ThemeToggle control",
);

// --- 4. header nav contract (IA-CONTRACT S4 live block) -------------------------
check(
  header.includes('src="/logo.png"') && /width=\{/.test(header) && /height=\{/.test(header),
  "Header: logo uses the authoritative /logo.png with width/height attrs",
);
for (const segment of ["about", "research", "projects", "writing", "cv", "contact", "search"]) {
  check(
    header.includes(`/${segment}/`),
    `Header: live nav route /${segment}/ present`,
  );
}
check(
  header.includes("<details") && header.includes("nav-more"),
  "Header: P8 catalogs grouped in a no-JS <details> More disclosure",
);
for (const segment of ["publications", "books", "talks", "downloads"]) {
  check(header.includes(`/${segment}/`), `Header: More group lists /${segment}/`);
}
check(
  header.includes(".startsWith("),
  "Header: parent-section activation is prefix-based (startsWith)",
);
check(
  /aria-current=\{[^}]*moreActive[^}]*\}/.test(header) ||
    /aria-current=\{moreActive/.test(header),
  "Header: More <details> summary marks aria-current when a child route is current",
);
check(
  header.includes("isExact") && header.includes("isInSection"),
  "Header: home link exact-match only, section links prefix-matched",
);
check(
  header.includes("glass-surface") && header.includes("glass-surface--dark"),
  "Header: consumes the shared glass-surface utilities (no second glass pattern)",
);
check(
  header.includes("min-height: 2.75rem"),
  "Header: 44px touch target floor on header links (2.75rem)",
);
check(
  header.includes("DEFER-0035"),
  "Header: sub-224px 36px exception stays documented (DEFER-0035)",
);
check(
  header.includes("Astro.props.alternateHref ??") || header.includes("alternateHref ?? "),
  "Header: language switch uses the real alternateHref when present, else locale root",
);
check(
  (header.match(/<a\b/g) || []).length >= 4 && header.includes("<details"),
  "Header: primary nav renders native anchors + details (no-JS readable)",
);
check(
  !/role=["']button["']/.test(header),
  "Header: no role=button fakes (native anchors + details/summary only)",
);

// --- 5. footer -------------------------------------------------------------------
for (const segment of [
  "about",
  "research",
  "projects",
  "writing",
  "publications",
  "books",
  "talks",
  "downloads",
  "cv",
  "contact",
  "search",
]) {
  check(
    footer.includes(`/${segment}/`),
    `Footer: explore nav lists live route /${segment}/`,
  );
}
check(
  footer.includes("alternateHref ?? ") || footer.includes("Astro.props.alternateHref ??"),
  "Footer: language link uses the real alternateHref when present, else locale root",
);
check(
  footer.includes("getSiteContact"),
  "Footer: contact details keep the CMS data source (unchanged)",
);

// --- 6. breadcrumbs (IA-CONTRACT S7) ----------------------------------------------
check(
  /<nav[^>]*aria-label/.test(crumbs),
  "Breadcrumbs: labelled nav landmark",
);
check(/<ol/.test(crumbs), "Breadcrumbs: ordered list semantics");
check(
  crumbs.includes('aria-current="page"') || crumbs.includes("aria-current={"),
  "Breadcrumbs: current page marked with aria-current",
);
check(
  !/itemscope|itemtype/i.test(crumbs),
  "Breadcrumbs: visual component only (structured data handled elsewhere)",
);
check(
  /label\?:\s*string/.test(crumbs),
  "Breadcrumbs: nav label prop overridable per locale (default preserved)",
);

// --- 7. every nav/footer route resolves for BOTH locales --------------------------
const ROUTE_FILES = [
  "index.astro",
  "about.astro",
  "research/index.astro",
  "projects/index.astro",
  "writing/index.astro",
  "cv.astro",
  "contact.astro",
  "search/index.astro",
  "publications/index.astro",
  "books/index.astro",
  "talks/index.astro",
  "downloads/index.astro",
];
for (const locale of ["en", "fa"]) {
  for (const routeFile of ROUTE_FILES) {
    const full = join(srcRoot, "pages", locale, ...routeFile.split("/"));
    check(
      existsSync(full),
      `route resolves: /${locale}/${routeFile.replace(/\/index\.astro$/, "/").replace(/\.astro$/, "/")}`,
    );
  }
}

// --- 8. report ---------------------------------------------------------------------
if (failures.length > 0) {
  console.error(`public-shell.spec: FAIL — ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}

console.log(
  `public-shell.spec: PASS — ${passed.length} checks: gateway standalone+night+both locales, ` +
    "pre-paint theme persistence (light/dark/system), live nav contract with parent-section " +
    "activation and no-JS More disclosure, 44px header targets, honest language switch, " +
    "full live footer sitemap, breadcrumb semantics, every nav route resolves for en+fa",
);
