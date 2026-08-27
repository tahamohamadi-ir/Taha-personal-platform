// WF-09 asset-delivery generator - Assets/site-redesign/README.md section 3 delivery rule.
//
// Reads the 11 approved masters from Assets/site-redesign/art/ (verified
// byte-identical against the handoff SHA256SUMS.txt before any pixel is read;
// the script aborts on mismatch so a tampered or re-encoded master can never
// leak into a derivative) and emits a deterministic responsive matrix into
// apps/web/public/art-derived/:
//
//   {master}-{width}w.avif  quality 50  (progressive enhancement)
//   {master}-{width}w.webp  quality 78  (universal modern fallback)
//   {master}-800w.png       lossless    (last-resort <img> fallback)
//
// Target widths are ~800/1200/1600px, clamped to each master's intrinsic
// width (no upscaling): 1672-wide portal masters emit 800/1200/1600, the
// 1536-wide masters emit 800/1200/1536.
//
// Masters are NEVER written to. The output directory is cleaned before each
// run, so the committed derivative set always equals the matrix.
//
// Run:  node scripts/generate-art-derivatives.mjs
//
// sharp comes from the existing astro dependency tree (no package.json edit
// required); if it is missing, install workspace deps first (npm install in
// apps/web). An npx-shimmed ephemeral sharp-cli is deliberately NOT used so
// the committed settings (quality/effort/compression) stay versioned here.

import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const webRoot = resolve(scriptDir, "..");
const repoRoot = resolve(webRoot, "..", "..");
const artDir = join(repoRoot, "Assets", "site-redesign", "art");
const sumsPath = join(repoRoot, "Assets", "site-redesign", "SHA256SUMS.txt");
const outDir = join(webRoot, "public", "art-derived");

const AVIF = { quality: 50, effort: 4 };
const WEBP = { quality: 78 };
const PNG_FALLBACK = { compressionLevel: 9 }; // lossless 800w fallback, stays <1MB

function fail(message) {
  console.error(`generate-art-derivatives: ERROR - ${message}`);
  process.exit(1);
}

let sharp;
try {
  sharp = createRequire(import.meta.url)("sharp");
} catch {
  fail(
    "sharp is not installed (it ships with the astro dependency tree). Run `npm install` in apps/web first.",
  );
}

if (!existsSync(sumsPath) || !existsSync(artDir)) {
  fail("Assets/site-redesign art pack or SHA256SUMS.txt not found");
}

// Handoff integrity gate: process exactly the art/ masters listed in
// SHA256SUMS.txt and only after re-verifying each digest.
const masters = readFileSync(sumsPath, "utf8")
  .split(/\r?\n/)
  .map((line) => /^([0-9a-f]{64})\s+art\/(.+\.png)$/.exec(line.trim()))
  .filter(Boolean)
  .map(([, hash, name]) => ({ name, hash }));

if (masters.length !== 11) {
  fail(`expected 11 art masters in SHA256SUMS.txt, found ${masters.length}`);
}

for (const { name, hash } of masters) {
  const path = join(artDir, name);
  if (!existsSync(path)) fail(`master art/${name} is missing`);
  const actual = createHash("sha256").update(readFileSync(path)).digest("hex");
  if (actual !== hash) {
    fail(`master art/${name} does not match SHA256SUMS.txt - masters must never be modified`);
  }
}

// Deterministic output: the derivative directory is wiped and rebuilt.
if (existsSync(outDir)) {
  for (const name of readdirSync(outDir)) {
    rmSync(join(outDir, name), { recursive: true, force: true });
  }
} else {
  mkdirSync(outDir, { recursive: true });
}

let totalBytes = 0;
let fileCount = 0;
for (const { name } of masters) {
  const src = join(artDir, name);
  const base = name.replace(/\.png$/, "");
  const meta = await sharp(src).metadata();
  if (meta.format !== "png") fail(`master art/${name} is not a PNG`);
  const intrinsic = meta.width;
  const widths = [...new Set([800, 1200, 1600].map((w) => Math.min(w, intrinsic)))];

  const outputs = [];
  for (const width of widths) {
    outputs.push([`${base}-${width}w.avif`, "avif", AVIF, width]);
    outputs.push([`${base}-${width}w.webp`, "webp", WEBP, width]);
  }
  outputs.push([`${base}-800w.png`, "png", PNG_FALLBACK, 800]);

  for (const [file, format, options, width] of outputs) {
    const buffer = await sharp(src)
      .resize({ width, withoutEnlargement: true })
      .toFormat(format, options)
      .toBuffer();
    const dest = join(outDir, file);
    writeFileSync(dest, buffer);
    const bytes = statSync(dest).size;
    if (bytes === 0) fail(`empty derivative ${file}`);
    if (bytes >= 1024 * 1024) fail(`derivative ${file} is master-sized (>=1MB)`);
    totalBytes += bytes;
    fileCount += 1;
    console.log(`  ${file}  ${(bytes / 1024).toFixed(0)} KB`);
  }
}

console.log(
  `generate-art-derivatives: OK - ${fileCount} files, ${(totalBytes / 1024 / 1024).toFixed(2)} MB total -> ${relative(repoRoot, outDir)}`,
);
