import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const here = dirname(fileURLToPath(import.meta.url));
const webRoot = join(here, "..");
const readSource = (p) => readFileSync(join(webRoot, p), "utf8");

/**
 * Light-art + contrast gate (LOG-0281 owner queue item 8, code side).
 *
 * Design reality (ADR-0031, always-night matrix): gateway + landing stages
 * are fixed-night, so the DARK masters are the correct art and the generated
 * light companions stay UNWIRED by design - a <picture> can key on
 * prefers-color-scheme but never on the site's data-theme attribute, and the
 * OS theme is not the site theme (wiring light art by media query would put
 * light art on a night scrim and break the audited contrast). This spec
 * encodes that decision as a gate (missing-reference assertion) plus
 * machine-checked worst-case contrast for the night stack, so any future
 * re-theming forces a conscious revisit instead of silent drift.
 */

// --- 1. tokens: night ink + night canvas (authority: global.css) -----------
const css = readSource("src/styles/global.css");
function tokenValue(block, name) {
  const m = block.match(new RegExp(`${name}:\\s*(#[0-9a-fA-F]{6})`));
  assert(m, `token ${name} missing in its theme block`);
  return m[1];
}
const darkBlock = css.slice(css.indexOf('[data-theme="dark"]') >= 0 ? css.indexOf('[data-theme="dark"]') : css.indexOf("[data-theme='dark']"));
assert(darkBlock.length > 100, "dark theme block missing in global.css");
const nightInk = tokenValue(darkBlock, "--color-ink");
const nightCanvas = tokenValue(css, "--canvas-night");

function luminance(hex) {
  const rgb = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}
function ratio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
function mix(hexA, hexB, t) {
  // linear-RGB mix: t = weight of A.
  const ch = (hex, i) => parseInt(hex.slice(i, i + 2), 16) / 255;
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const unlin = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
  let out = "#";
  for (const i of [1, 3, 5]) {
    const v = unlin(t * lin(ch(hexA, i)) + (1 - t) * lin(ch(hexB, i)));
    out += Math.round(Math.min(1, Math.max(0, v)) * 255)
      .toString(16)
      .padStart(2, "0");
  }
  return out;
}

const panelRatio = ratio(nightInk, nightCanvas);
assert(
  panelRatio >= 7,
  `night ink ${nightInk} on night canvas ${nightCanvas} must hold >= 7:1 (got ${panelRatio.toFixed(2)}:1)`,
);

// --- 2. scrim invariants: art decorative + token veil always present -------
for (const [page, scrim] of [
  ["src/pages/index.astro", "gateway-art-scrim"],
  ["src/components/Landing.astro", "landing__art-scrim"],
]) {
  const src = readSource(page);
  assert(src.includes('aria-hidden="true"'), `${page}: art stage stays decorative (aria-hidden)`);
  assert(src.includes(`<div class="${scrim}">`), `${page}: flat night veil present`);
  assert(src.includes("art-fade"), `${page}: gradient fade to opaque canvas present`);
}
assert(
  css.includes("--canvas-night:") || css.includes("--canvas-night :"),
  "canvas-night token exists (veil authority)",
);
for (const file of ["src/pages/index.astro", "src/components/Landing.astro"]) {
  const src = readSource(file);
  const m = src.match(/-scrim\s*\{[^}]*background-color:\s*var\(--canvas-night\)[^}]*opacity:\s*([\d.]+)/);
  assert(m && parseFloat(m[1]) >= 0.3, `${file}: veil is var(--canvas-night) at opacity >= 0.3`);
}

// --- 3. pixel worst-case: REPORTED, not gated (budget-spec pattern) -------
// A placement-blind brightest-pixel bound cannot reproduce a real text-zone
// ratio: copy sits on the glass panel (opaque-first) or over the gradient
// fade (up to 100% opaque night at the copy end), never on the raw brightest
// pixel under the flat veil alone. So these numbers are reported context for
// the owner visual sign-off (queue item 7), while the gates above enforce
// the stack that actually guarantees legibility. A prior hand computation
// (7.33/6.00) has no documented method and is NOT re-asserted here.
async function brightestLuminance(pngPath) {
  const { data, info } = await sharp(join(webRoot, pngPath))
    .resize(120)
    .raw()
    .toBuffer({ resolveWithObject: true });
  let max = 0;
  const channels = info.channels;
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
    max = Math.max(max, 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b));
  }
  return max;
}

const VEIL = 0.3; // flat scrim only (fade ignored = strictly weaker veil = conservative bound)
for (const master of [
  "public/art-derived/portal-centered-dark-800w.png",
  "public/art-derived/portal-orbit-dark-800w.png",
]) {
  assert(existsSync(join(webRoot, master)), `dark master missing: ${master}`);
  const lum = await brightestLuminance(master);
  // Mix brightest pixel toward night by the flat veil, then contrast vs ink.
  const nightLin = luminance(nightCanvas);
  const veiled = VEIL * nightLin + (1 - VEIL) * lum;
  const inkLin = luminance(nightInk);
  const [hi, lo] = [inkLin, veiled].sort((x, y) => y - x);
  const worst = (hi + 0.05) / (lo + 0.05);
  console.log(
    `report ${master.split("/").pop()}: placement-blind worst-case (brightest pixel + ${VEIL} veil) ${worst.toFixed(2)}:1 vs ink ${nightInk} (context only - see comment above)`,
  );
}

// --- 4. light companions retained but unwired BY DESIGN --------------------
for (const light of [
  "public/art-derived/portal-centered-light-800w.png",
  "public/art-derived/portal-orbit-light-800w.png",
]) {
  assert(existsSync(join(webRoot, light)), `generated light companion missing: ${light}`);
}
const srcHits = [];
for (const file of [
  "src/pages/index.astro",
  "src/components/Landing.astro",
  "src/layouts/BaseLayout.astro",
  "src/components/Header.astro",
  "src/components/Footer.astro",
]) {
  const src = readSource(file);
  if (/portal-(centered|orbit)-light|orbit-light/.test(src)) srcHits.push(file);
}
assert(
  srcHits.length === 0,
  `light art wired into a fixed-night surface (${srcHits.join(", ")}) - pinned-night takes dark masters by design; re-theme consciously or not at all`,
);

console.log(
  `PASS art-contrast (night ink/canvas ${panelRatio.toFixed(2)}:1, scrim invariants, pixel worst-case reported, light companions retained-but-unwired)`,
);
