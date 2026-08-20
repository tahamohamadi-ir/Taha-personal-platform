import { defineConfig, devices } from "@playwright/test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const isCI = Boolean(process.env.CI);
const cmsBase = process.env.CMS_BASE_URL ?? "http://127.0.0.1:8000";
const webRoot = path.dirname(fileURLToPath(import.meta.url));
const cmsRoot = path.resolve(webRoot, "../cms");

/**
 * Full Playwright Test runner config (DEFER-0026 / §14 S2).
 * Existing raw `qa/*.spec.mjs` node scripts remain for CI smoke; this config
 * owns the browser lifecycle suite under `qa/e2e/`.
 */
export default defineConfig({
  testDir: "./qa/e2e",
  outputDir: "./qa/test-results",
  fullyParallel: false,
  workers: 1,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  timeout: 120_000,
  expect: { timeout: 15_000 },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "qa/playwright-report" }],
  ],
  use: {
    baseURL: cmsBase,
    trace: "on-first-retry",
    video: "on-first-retry",
    screenshot: "only-on-failure",
    locale: "en-US",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: process.env.CMS_BASE_URL
    ? undefined
    : {
        // cwd is apps/cms — relative path works on Linux CI and Git Bash.
        command: "bash scripts/run_e2e_stack.sh",
        url: `${cmsBase}/health/`,
        reuseExistingServer: !isCI,
        timeout: 180_000,
        cwd: cmsRoot,
      },
});
