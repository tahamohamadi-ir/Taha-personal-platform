import { readFileSync, readdirSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const distDir = join(here, "../dist");
const srcRoot = join(here, "../src");

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function readHtml(relativePath) {
  return readFileSync(join(distDir, relativePath), "utf8");
}

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

for (const page of ["en/research/index.html", "fa/research/index.html"]) {
  const html = readHtml(page);
  assert(
    html.includes("research-catalog") ||
      html.includes("research-graph") ||
      html.includes("empty"),
    `${page} missing research catalog, graph, or empty state.`,
  );
  if (html.includes("research-graph")) {
    assert(
      html.includes("research-graph-tree"),
      `${page} has graph chrome but no accessible relationship tree markup.`,
    );
  }
}

const fa = readHtml("fa/research/index.html");
assert(
  fa.includes('dir="rtl"') || fa.includes('lang="fa"'),
  "fa research page should declare RTL/fa.",
);

for (const file of walk(srcRoot).filter((f) =>
  /\.(ts|tsx|js|jsx|astro|mjs|cjs)$/.test(f),
)) {
  const text = readFileSync(file, "utf8");
  assert(!/\bfrom\s+["']gsap/.test(text), `gsap import found in ${file}`);
  assert(!/\bfrom\s+["']three/.test(text), `three import found in ${file}`);
}

const assetsDir = join(distDir, "_astro");
let islandGzip = 0;
let islandName = "";
for (const file of readdirSync(assetsDir)) {
  if (!/\.js$/.test(file)) continue;
  const full = join(assetsDir, file);
  const buf = readFileSync(full);
  const text = buf.toString("utf8");
  if (
    text.includes("rg-island") ||
    text.includes("Interactive map") ||
    text.includes("naghsh") ||
    text.includes("Reset view") ||
    text.includes("بازنشانی نما")
  ) {
    const gz = gzipSync(buf).length;
    if (gz > islandGzip) {
      islandGzip = gz;
      islandName = file;
    }
  }
}

if (islandName) {
  console.log(
    `research-graph.spec: largest matching island chunk ${islandName} ≈ ${islandGzip} bytes gzip`,
  );
  assert(
    islandGzip < 35 * 1024,
    `Island chunk ${islandName} is ${islandGzip} gzip bytes; ADR-0028 budget is 35KB gzip.`,
  );
} else {
  console.log(
    "research-graph.spec: no hydrated island chunk detected (offline/empty CMS build is OK).",
  );
}

console.log("research-graph.spec: PASS");
