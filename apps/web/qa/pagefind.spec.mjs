import {
  existsSync,
  readFileSync,
  readdirSync,
  statSync,
} from "node:fs";
import { join, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function listFiles(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir);
}

function walkHtml(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkHtml(full, out);
    else if (name === "index.html") out.push(full);
  }
  return out;
}

// --- 1. Per-locale pagefind directory must exist ---
for (const locale of ["en", "fa"]) {
  const pagefindDir = join(distDir, locale, "pagefind");
  assert(existsSync(pagefindDir), `Missing Pagefind output: dist/${locale}/pagefind/`);
  const stat = statSync(pagefindDir);
  assert(stat.isDirectory(), `dist/${locale}/pagefind is not a directory`);

  const files = listFiles(pagefindDir);
  assert(files.length > 0, `dist/${locale}/pagefind/ is empty`);

  // Expected core assets
  const required = [
    "pagefind.js",
    "pagefind-ui.js",
    "pagefind-ui.css",
    "pagefind-entry.json",
  ];
  for (const req of required) {
    assert(
      existsSync(join(pagefindDir, req)),
      `Missing required Pagefind file dist/${locale}/pagefind/${req}`,
    );
  }

  // pf_meta file per locale
  const metaFiles = files.filter((f) => f.endsWith(".pf_meta"));
  assert(metaFiles.length === 1, `Expected exactly one .pf_meta in dist/${locale}/pagefind/, got ${metaFiles.length}: ${metaFiles.join(", ")}`);
  assert(
    metaFiles[0].startsWith(`pagefind.${locale}_`),
    `pf_meta filename should be pagefind.${locale}_*.pf_meta, got ${metaFiles[0]}`,
  );

  // index and fragment subdirs
  const indexDir = join(pagefindDir, "index");
  const fragDir = join(pagefindDir, "fragment");
  assert(existsSync(indexDir), `Missing Pagefind index dir: dist/${locale}/pagefind/index/`);
  assert(existsSync(fragDir), `Missing Pagefind fragment dir: dist/${locale}/pagefind/fragment/`);

  const indexFiles = listFiles(indexDir).filter((f) => f.endsWith(".pf_index"));
  assert(indexFiles.length >= 1, `dist/${locale}/pagefind/index/ should contain at least one .pf_index (got 0)`);

  const fragFiles = listFiles(fragDir).filter((f) => f.endsWith(".pf_fragment"));
  assert(fragFiles.length > 0, `dist/${locale}/pagefind/fragment/ should be non-empty`);

  // Entry JSON checks
  const entryPath = join(pagefindDir, "pagefind-entry.json");
  const entryRaw = readFileSync(entryPath, "utf8");
  let entry;
  try {
    entry = JSON.parse(entryRaw);
  } catch (e) {
    throw new Error(`Invalid JSON in dist/${locale}/pagefind/pagefind-entry.json: ${e.message}`);
  }
  assert(entry.version, `pagefind-entry.json missing version for ${locale}`);
  assert(entry.languages && entry.languages[locale], `pagefind-entry.json missing languages.${locale}`);
  const langEntry = entry.languages[locale];
  assert(typeof langEntry.hash === "string" && langEntry.hash.length > 0, `languages.${locale}.hash empty`);
  assert(typeof langEntry.page_count === "number", `languages.${locale}.page_count not a number`);
  assert(langEntry.page_count > 0, `languages.${locale}.page_count should be >0, got ${langEntry.page_count}`);

  // page_count should match fragment count (one fragment per page)
  assert(
    langEntry.page_count === fragFiles.length,
    `Pagefind page_count ${langEntry.page_count} != fragment files ${fragFiles.length} for ${locale}`,
  );

  // Verify page_count equals HTML pages minus ignored search page
  const localeHtml = walkHtml(join(distDir, locale));
  // dist/{locale}/search/index.html is data-pagefind-ignore -> not counted
  const searchIgnored = localeHtml.filter((p) => p.includes(`${join(distDir, locale, "search")}`)).length;
  // Also blog redirects may be minimal but still counted? en/blog/index.html is redirect page
  // Pagefind indexes locale tree only, so blog redirect under en/blog may be excluded if not html content?
  // Our localeHtml includes all html in that tree. Expect page_count == localeHtml.length - searchIgnored
  // In offline build we observed 26 html, 1 ignored => 25 page_count.
  const expectedCount = localeHtml.length - searchIgnored;
  // Allow tolerance if future routes add ignored pages, but at least assert expectedCount matches page_count
  // If any other page has data-pagefind-ignore attribute, it would also be excluded; search is the only one documented.
  assert(
    langEntry.page_count === expectedCount,
    `Pagefind ${locale} page_count ${langEntry.page_count} != expected HTML pages minus ignored ${expectedCount} (html ${localeHtml.length} - search ${searchIgnored})`,
  );

  // Verify wasm exists per locale or unknown fallback
  const wasmLocale = join(pagefindDir, `wasm.${locale}.pagefind`);
  const wasmUnknown = join(pagefindDir, "wasm.unknown.pagefind");
  assert(existsSync(wasmLocale) || existsSync(wasmUnknown), `Missing wasm file for ${locale}: expected ${basename(wasmLocale)} or wasm.unknown.pagefind`);
}

// --- 2. Root dist/pagefind must NOT exist (per-locale only, ADR Wave 5) ---
assert(!existsSync(join(distDir, "pagefind")), "Unexpected dist/pagefind/ at root — indexes must be per-locale dist/{en,fa}/pagefind/");

// --- 3. No unexpected indexes for non-public roots (admin/preview/staff) ---
for (const name of listFiles(distDir)) {
  if (["admin", "preview", "staff"].includes(name)) {
    assert(!existsSync(join(distDir, name, "pagefind")), `Refusing unexpected pagefind index for non-public root dist/${name}/pagefind/`);
  }
}

// --- 4. Draft exclusion: published-only indexing ---
// Ensure no draft/private/preview paths appear in indexed HTML or pagefind fragments
// check html files do not leak draft markers beyond expected search ignore
for (const locale of ["en", "fa"]) {
  const htmlFiles = walkHtml(join(distDir, locale));
  for (const htmlPath of htmlFiles) {
    const html = readFileSync(htmlPath, "utf8");
    // Search pages intentionally have data-pagefind-ignore, so skip assert for that attribute
    // Ensure no admin/staff/preview links leak into public HTML (published-only projection)
    for (const needle of ["/admin/", "/staff/", "/preview/share/"]) {
      assert(
        !html.includes(`href="${needle}`) && !html.includes(`href='${needle}`),
        `Public HTML ${htmlPath.replace(distDir, "dist")} leaks disallowed link ${needle} — draft/private content must not be indexed`,
      );
    }
    // Ensure drafts not mentioned as indexed content (heuristic: "draft" word should not appear as content marker)
    // Allow "Drafts and private files are not indexed." description on search page - that's expected
    if (!htmlPath.includes(`${join("search", "index.html")}`)) {
      assert(
        !/>\s*draft\s*</i.test(html) || html.includes("not indexed"),
        `Public HTML ${htmlPath.replace(distDir, "dist")} appears to mention draft as indexed content`,
      );
    }
  }
  // Check pagefind fragments don't contain disallowed paths
  const fragDir = join(distDir, locale, "pagefind", "fragment");
  if (existsSync(fragDir)) {
    for (const frag of listFiles(fragDir)) {
      const content = readFileSync(join(fragDir, frag), "utf8");
      for (const needle of ["/admin/", "/staff/", "/preview/"]) {
        assert(!content.includes(needle), `Pagefind fragment ${locale}/pagefind/fragment/${frag} leaks ${needle}`);
      }
    }
  }
}

// --- 5. Pagefind UI assets are present and non-empty ---
for (const locale of ["en", "fa"]) {
  const css = join(distDir, locale, "pagefind", "pagefind-ui.css");
  const js = join(distDir, locale, "pagefind", "pagefind-ui.js");
  assert(statSync(css).size > 1000, `pagefind-ui.css too small for ${locale}`);
  assert(statSync(js).size > 1000, `pagefind-ui.js too small for ${locale}`);
}

console.log("PASS pagefind spec — per-locale indexes exist, page_count matches HTML, drafts excluded");
