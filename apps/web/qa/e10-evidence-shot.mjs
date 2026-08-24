/* One-off E10 evidence shooter: design-elevation before/after screenshots.
 * Usage: SHOT_BASE=http://127.0.0.1:8901 SHOT_TAG=after node qa/e10-evidence-shot.mjs
 * Captures gateway, locale home (hero + 3D constellation), search, catalog empty state.
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SHOT_BASE ?? "http://127.0.0.1:8901";
const TAG = process.env.SHOT_TAG ?? "after";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../docs/status/evidence/e10-design-elevation/"
);

mkdirSync(OUT, { recursive: true });

const routes = [
  ["gateway", "/"],
  ["en-home", "/en/"],
  ["fa-home", "/fa/"],
  ["en-search", "/en/search/"],
  ["en-publications", "/en/publications/"],
  ["en-teaching", "/en/teaching/"],
];

const browser = await chromium.launch(
  process.env.PW_EXECUTABLE_PATH ? { executablePath: process.env.PW_EXECUTABLE_PATH } : {}
);
for (const [width, height, label] of [
  [1280, 900, "desktop"],
  [375, 812, "mobile"],
]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  for (const [name, path] of routes) {
    try {
      await page.goto(BASE + path, { waitUntil: "load", timeout: 15000 });
      // give the 3D island + entrance animation a moment (desktop home only)
      if (name === "en-home" || name === "fa-home") await page.waitForTimeout(2500);
      await page.screenshot({
        path: join(OUT, `${TAG}-${name}-${label}.png`),
        fullPage: name !== "gateway",
      });
      console.log(`shot ${TAG}-${name}-${label}`);
    } catch (e) {
      console.log(`skip ${name}-${label}: ${e.message.split("\n")[0]}`);
    }
  }
  await ctx.close();
}
await browser.close();
console.log(`E10 evidence done → ${OUT}`);
