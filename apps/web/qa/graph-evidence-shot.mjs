/* One-off graph-evidence shooter: research graph after the readability fix.
 * Usage: node qa/graph-evidence-shot.mjs  (serve dist on :8902)
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const BASE = process.env.SHOT_BASE ?? "http://localhost:8902";
const OUT = resolve(
  dirname(fileURLToPath(import.meta.url)),
  "../../../docs/status/evidence/research-graph-readability/"
);

mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch(
  process.env.PW_EXECUTABLE_PATH ? { executablePath: process.env.PW_EXECUTABLE_PATH } : {}
);
for (const [width, height, label] of [
  [1280, 900, "desktop"],
  [375, 812, "mobile"],
]) {
  const ctx = await browser.newContext({ viewport: { width, height } });
  const page = await ctx.newPage();
  for (const locale of ["en", "fa"]) {
    await page.goto(`${BASE}/${locale}/research/`, { waitUntil: "load" });
    // hydrate the island
    await page.waitForTimeout(1800);
    await page.screenshot({
      path: join(OUT, `after-graph-${locale}-${label}.png`),
      fullPage: false,
    });
    console.log(`shot after-graph-${locale}-${label}`);
  }
  await ctx.close();
}
await browser.close();
console.log(`graph evidence done -> ${OUT}`);
