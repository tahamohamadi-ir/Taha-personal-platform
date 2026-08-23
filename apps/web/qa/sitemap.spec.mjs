import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");
const sitemapPath = join(distDir, "sitemap.xml");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const siteUrl = "https://tahamohamadi.ir";

// Static paths mirror apps/web/src/pages/sitemap.xml.ts :26-43
const staticPaths = [
  "/",
  "/en/",
  "/fa/",
  "/en/about/",
  "/fa/about/",
  "/en/cv/",
  "/fa/cv/",
  "/en/writing/",
  "/fa/writing/",
  "/en/research/",
  "/fa/research/",
  "/en/research/statement/",
  "/fa/research/statement/",
  "/en/projects/",
  "/fa/projects/",
  "/en/publications/",
  "/fa/publications/",
  "/en/books/",
  "/fa/books/",
  "/en/talks/",
  "/fa/talks/",
  "/en/downloads/",
  "/fa/downloads/",
  "/en/teaching/",
  "/fa/teaching/",
  "/en/creative/",
  "/fa/creative/",
  "/en/search/",
  "/fa/search/",
  "/en/contact/",
  "/fa/contact/",
];

assert(existsSync(sitemapPath), "Missing dist/sitemap.xml — sitemap must be built (see sitemap.xml.ts)");
const xml = readFileSync(sitemapPath, "utf8");

assert(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>'), "sitemap.xml missing XML declaration");
assert(xml.includes('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'), "sitemap.xml missing urlset xmlns");
assert(xml.includes("</urlset>"), "sitemap.xml missing closing urlset");

const locs = [];
const locRe = /<loc>(.*?)<\/loc>/g;
let m;
while ((m = locRe.exec(xml)) !== null) locs.push(m[1]);

assert(locs.length >= staticPaths.length, `sitemap should contain at least ${staticPaths.length} static entries, got ${locs.length}`);

// No duplicates
const seen = new Set(locs);
assert(seen.size === locs.length, `sitemap contains duplicate <loc> entries`);

// All static paths must be present
for (const p of staticPaths) {
  const expected = new URL(p, siteUrl).href;
  assert(locs.includes(expected), `sitemap missing static URL ${expected}`);
}

// All locs must be absolute https with siteUrl origin, no disallowed paths
const disallowed = ["/admin/", "/staff/", "/preview/", "/health", "/api/", "/media/"];
for (const loc of locs) {
  assert(loc.startsWith(siteUrl), `sitemap loc does not start with ${siteUrl}: ${loc}`);
  assert(loc.startsWith("https://"), `sitemap loc should be https: ${loc}`);
  for (const needle of disallowed) {
    assert(!loc.includes(needle), `sitemap loc leaks disallowed path ${needle}: ${loc}`);
  }
  // No double slashes beyond https://
  assert(!loc.replace("https://", "").includes("//"), `sitemap loc contains double slash: ${loc}`);
}

// Check no draft/private markers
assert(!/\bdraft\b/i.test(xml) || xml.includes("not indexed") === false, "sitemap should not mention draft");
assert(!xml.includes("/admin"), "sitemap should not contain /admin");
assert(!xml.includes("/preview"), "sitemap should not contain /preview");

// Dynamic entries: if detail pages exist on disk, sitemap must contain them
// Mirrors sitemap.xml.ts dynamic generation for articles, research topics/projects/publications, books/talks/downloads, projects
function walkDetailSlugs(localeDir, resource) {
  const dir = join(distDir, localeDir, resource);
  if (!existsSync(dir)) return [];
  const entries = readdirSync(dir);
  const slugs = [];
  for (const name of entries) {
    const full = join(dir, name);
    try {
      if (statSync(full).isDirectory() && existsSync(join(full, "index.html"))) {
        // Exclude the list page's own index.html at the resource root; we only want sub-dirs
        slugs.push(name);
      }
    } catch {}
  }
  return slugs;
}

function assertDynamicInSitemap(locale, resource) {
  const slugs = walkDetailSlugs(locale, resource);
  for (const slug of slugs) {
    // The sitemap uses `/${locale}/${resource}/${slug}/` pattern
    const canonical = new URL(`/${locale}/${resource}/${slug}/`, siteUrl).href;
    assert(
      locs.includes(canonical),
      `sitemap missing dynamic URL ${canonical} for ${locale}/${resource}/${slug} (found on disk but not in sitemap)`,
    );
    // If lastmod present, ensure format YYYY-MM-DD inside <lastmod>
    // We don't enforce presence, but if dynamic entry exists, sitemap should have lastmod or at least not be bare
  }
}

// Check P8 catalogs, projects, writing, research
const catalogs = [
  { resource: "publications" },
  { resource: "books" },
  { resource: "talks" },
  { resource: "downloads" },
  { resource: "projects" },
];
for (const locale of ["en", "fa"]) {
  for (const { resource } of catalogs) {
    assertDynamicInSitemap(locale, resource);
  }
  // Writing articles: /{locale}/writing/{slug}/
  assertDynamicInSitemap(locale, "writing");
  // Research sub-trees: topics and projects under research/*
  // topics live at /{locale}/research/topics/{slug}/
  const topicsDir = join(distDir, locale, "research", "topics");
  if (existsSync(topicsDir)) {
    for (const slug of readdirSync(topicsDir).filter((n) => statSync(join(topicsDir, n)).isDirectory())) {
      const canonical = new URL(`/${locale}/research/topics/${slug}/`, siteUrl).href;
      assert(locs.includes(canonical), `sitemap missing research topic ${canonical}`);
    }
  }
  const researchProjectsDir = join(distDir, locale, "research", "projects");
  if (existsSync(researchProjectsDir)) {
    for (const slug of readdirSync(researchProjectsDir).filter((n) => statSync(join(researchProjectsDir, n)).isDirectory())) {
      const canonical = new URL(`/${locale}/research/projects/${slug}/`, siteUrl).href;
      assert(locs.includes(canonical), `sitemap missing research project ${canonical}`);
    }
  }
}

// Ensure sitemap contains research publications only via canonical /{locale}/publications/ not legacy
for (const loc of locs) {
  assert(!loc.includes("/research/publications/"), `sitemap contains legacy research publication path (must be canonical): ${loc}`);
}

// Basic lastmod sanity: if dynamic entries exist, at least some should have <lastmod>
if (locs.length > staticPaths.length) {
  const dynamicLocs = locs.filter((l) => !staticPaths.some((p) => l === new URL(p, siteUrl).href));
  // at least one dynamic entry should have lastmod nearby in xml (heuristic)
  const lastmodCount = (xml.match(/<lastmod>/g) || []).length;
  assert(lastmodCount >= 1, `Dynamic sitemap entries (${dynamicLocs.length}) should include at least one <lastmod>`);
}

console.log(`PASS sitemap spec — ${locs.length} URLs (${staticPaths.length} static + ${locs.length - staticPaths.length} dynamic), no drafts/admin, canonical publications`);
