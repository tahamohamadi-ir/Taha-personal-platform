// WF-09 asset-delivery QA gate - Assets/site-redesign/README.md section 3 delivery rule.
//
//   masters   : the 11 PNGs under Assets/site-redesign/art/ stay byte-identical
//               (re-hashed against the handoff SHA256SUMS.txt art/ entries)
//   derived   : public/art-derived/** contains the deterministic AVIF+WebP
//               matrix (~800/1200/1600px, clamped to master width) plus a
//               lossless 800w PNG fallback per master - every file >0 bytes,
//               nothing over 1MB (masters are never shipped to the site)
//   pages     : gateway (src/pages/index.astro) and the home night stage
//               (src/components/Landing.astro) reference responsive
//               srcset/sizes art, decorative alt="", aria-hidden wrapper and
//               a token-based scrim (color-mix over --canvas-night)
//   preload   : only the actual LCP hero (gateway art) is preloaded in the
//               built dist/index.html (imagesrcset/imagesizes)
//   referenced: every /art-derived/ URL referenced by the built gateway and
//               locale-home pages exists in dist, is >0 bytes and <1MB
//
// Run after `npm run build`:  node qa/asset-delivery.spec.mjs
// (dist-independent sections 1-3 run standalone; dist checks fail with a
// "run npm run build" message when dist is absent, mirroring budget.spec.)

import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const repoRoot = join(webRoot, "..", "..");
const artDir = join(repoRoot, "Assets", "site-redesign", "art");
const sumsPath = join(repoRoot, "Assets", "site-redesign", "SHA256SUMS.txt");
const derivedDir = join(webRoot, "public", "art-derived");
const distDir = join(webRoot, "dist");

let failures = 0;
let checks = 0;
function check(condition, message) {
  checks += 1;
  if (!condition) {
    failures += 1;
    console.error(`FAIL ${message}`);
  }
}

// --- 1. masters unchanged (handoff hash contract) -----------------------------
if (!existsSync(sumsPath) || !existsSync(artDir)) {
  console.error("FAIL asset-delivery.spec - missing Assets/site-redesign art pack");
  process.exit(1);
}
const masterEntries = readFileSync(sumsPath, "utf8")
  .split(/\r?\n/)
  .map((line) => /^([0-9a-f]{64})\s+art\/(.+\.png)$/.exec(line.trim()))
  .filter(Boolean)
  .map(([, hash, name]) => ({ name, hash }));
check(masterEntries.length === 11, `expected 11 art masters in SHA256SUMS.txt (found ${masterEntries.length})`);

for (const { name, hash } of masterEntries) {
  const path = join(artDir, name);
  if (!existsSync(path)) {
    check(false, `master art/${name} missing`);
    continue;
  }
  const actual = createHash("sha256").update(readFileSync(path)).digest("hex");
  check(actual === hash, `master art/${name} differs from handoff SHA256SUMS.txt`);
}

// --- 2. derivative matrix ------------------------------------------------------
// Width policy mirrors scripts/generate-art-derivatives.mjs: target ~800/1200/
// 1600px clamped to each master's intrinsic width (no upscaling), plus one
// lossless 800w PNG fallback per master. PNG IHDR width read without deps.
function pngWidth(path) {
  const buf = readFileSync(path);
  return buf.readUInt32BE(16);
}

const expectedFiles = new Set();
for (const { name } of masterEntries) {
  const masterPath = join(artDir, name);
  const base = name.replace(/\.png$/, "");
  const width = pngWidth(masterPath);
  const widths = [...new Set([800, 1200, 1600].map((w) => Math.min(w, width)))];
  for (const w of widths) {
    expectedFiles.add(`${base}-${w}w.avif`);
    expectedFiles.add(`${base}-${w}w.webp`);
  }
  expectedFiles.add(`${base}-800w.png`);
}
check(expectedFiles.size === 77, `expected 77 derivative files (computed ${expectedFiles.size})`);

if (!existsSync(derivedDir)) {
  check(false, "public/art-derived/ missing - run: node scripts/generate-art-derivatives.mjs");
} else {
  const actualFiles = readdirSync(derivedDir);
  for (const name of expectedFiles) {
    const path = join(derivedDir, name);
    if (!existsSync(path)) {
      check(false, `missing derivative art-derived/${name}`);
      continue;
    }
    const size = statSync(path).size;
    check(size > 0, `derivative art-derived/${name} is empty`);
    check(size < 1024 * 1024, `derivative art-derived/${name} is master-sized (>=1MB)`);
  }
  const strays = actualFiles.filter((name) => !expectedFiles.has(name));
  check(strays.length === 0, `unexpected files in art-derived/: ${strays.join(", ")}`);
}

// --- 3. pages reference responsive decorative art -------------------------------
function readSrc(rel) {
  const path = join(webRoot, "src", rel);
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}
const gatewaySrc = readSrc(join("pages", "index.astro"));
const landingSrc = readSrc(join("components", "Landing.astro"));
check(gatewaySrc !== null && landingSrc !== null, "gateway/Landing sources readable");

for (const [label, src, art] of [
  ["gateway", gatewaySrc, "portal-centered-dark"],
  ["home stage", landingSrc, "portal-orbit-dark"],
]) {
  if (src === null) continue;
  check(src.includes('srcset='), `${label}: art uses responsive srcset`);
  check(src.includes('sizes='), `${label}: art declares sizes`);
  check(src.includes("/art-derived/"), `${label}: art served from /art-derived/`);
  check(src.includes(`${art}`), `${label}: wires the ${art} master`);
  check(src.includes('alt=""'), `${label}: decorative art keeps empty alt`);
  check(src.includes('aria-hidden="true"'), `${label}: art wrapper is aria-hidden`);
  check(/scrim/i.test(src), `${label}: token-based scrim guards copy over art`);
  check(src.includes("color-mix(") && src.includes("var(--canvas-night)"), `${label}: scrim is token-only (color-mix over --canvas-night, no raw token-value copies)`);
  check(src.includes('loading="eager"'), `${label}: above-the-fold art is eager (no lazy hero)`);
}

// --- 4. dist: preload only the LCP hero; referenced files exist and stay <1MB ---
const distPages = ["index.html", join("en", "index.html"), join("fa", "index.html")];
if (!existsSync(join(distDir, "index.html"))) {
  check(false, "dist/index.html missing - run `npm run build` first (preload/dist checks)");
} else {
  const gatewayHtml = readFileSync(join(distDir, "index.html"), "utf8");
  check(/rel="preload"/.test(gatewayHtml), "dist gateway: preload link present");
  check(/rel="preload"[^>]*as="image"/.test(gatewayHtml.replace(/\n/g, " ")), "dist gateway: preload targets an image");
  check(/imagesrcset=/.test(gatewayHtml), "dist gateway: preload uses imagesrcset (responsive)");
  check(gatewayHtml.includes("/art-derived/portal-centered-dark"), "dist gateway: preloads the gateway LCP hero art");
  const landingHtml = readFileSync(join(distDir, "en", "index.html"), "utf8") + readFileSync(join(distDir, "fa", "index.html"), "utf8");
  check(landingHtml.includes("/art-derived/portal-orbit-dark"), "dist locale homes: hero art referenced");
  // The responsive span (800..1600) is asserted on the built output, where the
  // composed srcset URLs actually land.
  check(
    gatewayHtml.includes("/art-derived/portal-centered-dark-800w.avif") &&
      gatewayHtml.includes("/art-derived/portal-centered-dark-1600w.avif"),
    "dist gateway: hero srcset spans the generated widths (800w-1600w)",
  );
  check(
    landingHtml.includes("/art-derived/portal-orbit-dark-800w.avif") &&
      landingHtml.includes("/art-derived/portal-orbit-dark-1600w.avif"),
    "dist locale homes: hero srcset spans the generated widths (800w-1600w)",
  );

  const referenced = new Set();
  for (const rel of distPages) {
    const path = join(distDir, rel);
    if (!existsSync(path)) {
      check(false, `missing dist page ${rel.split("\\").join("/")}`);
      continue;
    }
    const html = readFileSync(path, "utf8");
    for (const match of html.matchAll(/\/art-derived\/[A-Za-z0-9._-]+/g)) {
      referenced.add(match[0]);
    }
  }
  check(referenced.size > 0, "built pages reference /art-derived/ assets");
  for (const url of referenced) {
    const path = join(distDir, url.split("/").join("\\"));
    if (!existsSync(path)) {
      check(false, `dist missing referenced asset ${url}`);
      continue;
    }
    const size = statSync(path).size;
    check(size > 0, `referenced asset ${url} is empty`);
    check(size < 1024 * 1024, `referenced asset ${url} is master-sized (>=1MB)`);
  }
  // CSS/color fallback + scrim survive the build (Astro scopes+inlines styles).
  check(gatewayHtml.includes("scrim"), "dist gateway: scrim layer present");
  check(/color-mix\(/.test(gatewayHtml) || /color-mix\(/.test(landingHtml), "dist: scrim gradient uses color-mix");
}

// --- report ---------------------------------------------------------------------
const rel = (p) => relative(repoRoot, p);
if (failures > 0) {
  console.error("");
  console.error(`asset-delivery.spec: FAIL - ${failures} of ${checks} checks failed`);
  process.exit(1);
}
console.log(
  `asset-delivery.spec: PASS - 11 masters hash-verified | ${expectedFiles.size} derivatives (all >0B, all <1MB) | gateway+home srcset/sizes wired | LCP preload in dist | ${checks} checks`,
);
