// A-05 bundle-budget QA gate — reDesign_plan.md §7 / ADR-0030 ceilings.
//
// Audits every built client JS chunk and enforces the single invariant that is
// mechanically checkable today: no single chunk may exceed the three.js
// signature budget ceiling of 150 KB gzip (ADR-0030 M4). All chunks are
// reported (raw + gzip) so regressions against the other §7 budgets are
// visible even where they are not yet hard-failed:
//   - hydration interaction islands  <= 35 KB gzip  (needs island-entry
//     classification via import maps / HTML astrolinks — deferred, see TODO)
//   - d3 signature chunk             <= 60 KB gzip  (no d3 chunk built yet)
//   - three.js signature chunk       <= 150 KB gzip lazy  <- enforced below
//   - total home page JS             <= 220 KB gzip lazy (render-blocking ban;
//     needs page->chunk attribution via HTML script tags — deferred)
//
// Discovery: static Astro builds emit app chunks to `dist/_astro/`; hybrid
// layouts emit them under `dist/client/_astro/`. Both roots are scanned when
// present, recursively, *.js only. Pagefind bundles (dist/{en,fa}/pagefind/)
// are third-party lazy search assets, not site-authored chunks, so they are
// out of scope for this gate.
//
// Three-chunk identification (labeling only): prefer the Vite-emitted library
// name (`three.module.*.js` / any filename containing "three"); otherwise fall
// back to the largest-gzip chunk. This only affects reporting labels, never
// pass/fail: the 150 KB ceiling is enforced on *every* chunk, so a
// misidentified three chunk cannot mask a violation.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import { gzipSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const distDir = join(webRoot, "dist");

const THREE_BUDGET_KB = 150; // ADR-0030 M4: three.js signature chunk, gzip
const ISLAND_TARGET_KB = 35; // reDesign_plan.md §7: interaction islands, gzip

if (!existsSync(distDir)) {
  console.error(`FAIL budget.spec — missing ${relative(webRoot, distDir)}; run \`npm run build\` first`);
  process.exit(1);
}

const chunkRoots = [
  join(distDir, "client", "_astro"),
  join(distDir, "_astro"),
].filter((dir) => existsSync(dir));

function walkJs(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walkJs(full, out);
    else if (name.endsWith(".js")) out.push(full);
  }
  return out;
}

const files = chunkRoots.flatMap((root) => walkJs(root));
if (files.length === 0) {
  console.error(
    `FAIL budget.spec — no JS chunks found under ${chunkRoots.map((r) => relative(webRoot, r)).join(" or ")}; run \`npm run build\` first`,
  );
  process.exit(1);
}

const kb = (bytes) => Number((bytes / 1024).toFixed(2));

const chunks = files
  .map((file) => {
    const raw = readFileSync(file);
    return {
      rel: relative(distDir, file).split("\\").join("/"),
      rawKb: kb(raw.length),
      gzipKb: kb(gzipSync(raw).length),
    };
  })
  .sort((a, b) => b.gzipKb - a.gzipKb); // heaviest first: budget review order

// Three-chunk label: name match, else largest-gzip fallback (see header note).
let threeChunk =
  chunks.find((c) => /(^|\/|\.|-)three/i.test(c.rel)) ?? null;
if (!threeChunk) {
  // Deterministic fallback (chunks pre-sorted heaviest-first).
  threeChunk = chunks[0] ?? null;
}
for (const c of chunks) c.isThree = c === threeChunk;

console.log("bundle budget audit — dist client chunks (gzip, ADR-0030 ceilings)");
console.log("");
console.log(`  ${"chunk".padEnd(44)} ${"raw KB".padStart(10)} ${"gzip KB".padStart(10)}`);
for (const c of chunks) {
  const label = `${c.rel}${c.isThree ? "  [three]" : ""}`;
  console.log(`  ${label.padEnd(44)} ${c.rawKb.toFixed(2).padStart(10)} ${c.gzipKb.toFixed(2).padStart(10)}`);
}

const totalGzipKb = kb(chunks.reduce((sum, c) => sum + c.gzipKb * 1024, 0));
console.log("");
console.log(
  `  chunks: ${chunks.length} · total gzip: ${totalGzipKb.toFixed(2)} KB · ceiling per chunk (three): ${THREE_BUDGET_KB} KB`,
);

// Enforced invariant: any single chunk over the three.js ceiling fails,
// regardless of which chunk it is.
const violations = chunks.filter((c) => c.gzipKb > THREE_BUDGET_KB);
if (violations.length > 0) {
  console.error("");
  console.error(`budget.spec: FAIL — ${violations.length} chunk(s) exceed the ${THREE_BUDGET_KB} KB gzip ceiling:`);
  for (const v of violations) {
    console.error(`  - ${v.rel}: ${v.gzipKb.toFixed(2)} KB gzip (${v.rawKb.toFixed(2)} KB raw)`);
  }
  process.exit(1);
}

// Informational: non-three chunks above the 35 KB island target are not a
// failure in this v1 gate (island-entry classification not yet wired), but
// they are called out so the eventual tightening has data.
const overIslandTarget = chunks.filter((c) => !c.isThree && c.gzipKb > ISLAND_TARGET_KB);
if (overIslandTarget.length > 0) {
  console.log("");
  console.log(
    `  info: ${overIslandTarget.length} non-three chunk(s) above the ${ISLAND_TARGET_KB} KB island target (not enforced in v1):`,
  );
  for (const c of overIslandTarget) {
    console.log(`    - ${c.rel}: ${c.gzipKb.toFixed(2)} KB gzip`);
  }
}

console.log("");
console.log(`budget.spec: PASS — all ${chunks.length} chunks within the ${THREE_BUDGET_KB} KB gzip ceiling (total ${totalGzipKb.toFixed(2)} KB gzip)`);
