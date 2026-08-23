/* One-off E1 evidence shooter: full-page screenshots of About detail routes.
 * Usage: SHOT_TAG=before|after node qa/e1-evidence-shot.mjs  (serve dist on :8899)
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SHOT_BASE ?? "http://127.0.0.1:8901";
const TAG = process.env.SHOT_TAG ?? "after"; // "before" | "after"
// qa/ -> web -> apps -> repo root
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../docs/status/evidence/e1-token-foundation/"
);

mkdirSync(OUT, { recursive: true });

const routes = [
  ["en-about-detail", "/en/about/experience/mci-backend-applied-ai/"],
  ["en-about-index", "/en/about/experience/"],
];

const browser = await chromium.launch(
  process.env.PW_EXECUTABLE_PATH
    ? { executablePath: process.env.PW_EXECUTABLE_PATH }
    : {}
);
for (const [width, height, label] of [
  [1280, 900, "desktop"],
  [375, 812, "mobile"],
]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  for (const [name, path] of routes) {
    await page.goto(BASE + path, { waitUntil: "load" });
    await page.screenshot({
      path: join(OUT, `${TAG}-${name}-${label}.png`),
      fullPage: true,
    });
    console.log(`shot ${TAG}-${name}-${label}.png`);
  }
  await ctx.close();
}
await browser.close();
