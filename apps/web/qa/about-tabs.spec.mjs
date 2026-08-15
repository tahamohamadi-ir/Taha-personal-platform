import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "http://localhost:4321";
const pages = [
  { path: "/en/about/", other: "/fa/about/" },
  { path: "/fa/about/", other: "/en/about/" },
];
const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
];

let failures = 0;
const browser = await chromium.launch();

try {
  for (const viewport of viewports) {
    for (const target of pages) {
      const page = await browser.newPage({ viewport });
      try {
        await page.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle" });

        const geometry = await page.evaluate(() => {
          const controls = document.querySelector(".about-tab-controls");
          const panels = document.querySelector(".about-tab-panels");
          const visiblePanels = [...document.querySelectorAll(".about-tab-panel")].filter(
            (panel) => getComputedStyle(panel).display !== "none",
          );
          if (!controls || !panels) {
            return { ok: false, reason: "tab controls or panels missing" };
          }
          const controlsRect = controls.getBoundingClientRect();
          const panelsRect = panels.getBoundingClientRect();
          return {
            ok:
              controlsRect.bottom <= panelsRect.top + 1 &&
              visiblePanels.length === 1,
            controlsBottom: controlsRect.bottom,
            panelsTop: panelsRect.top,
            visiblePanels: visiblePanels.length,
          };
        });

        if (geometry.ok) {
          console.log(`PASS geometry ${target.path}@${viewport.width}`);
        } else {
          failures += 1;
          console.log(`FAIL geometry ${target.path}@${viewport.width} ${JSON.stringify(geometry)}`);
        }

        const radios = page.locator('input[name="about-sections"]');
        const labels = page.locator(".about-tab-label");
        const initialCount = await radios.count();
        if (initialCount < 2) {
          failures += 1;
          console.log(`FAIL tabs ${target.path}@${viewport.width} count=${initialCount}`);
        } else {
          await radios.nth(0).focus();
          await page.keyboard.press("ArrowRight");
          if (!(await radios.nth(1).isChecked())) {
            await page.keyboard.press("ArrowDown");
          }
          if (await radios.nth(1).isChecked()) {
            console.log(`PASS keyboard ${target.path}@${viewport.width}`);
          } else {
            failures += 1;
            console.log(`FAIL keyboard ${target.path}@${viewport.width}`);
          }

          await labels.nth(0).click();
          const firstVisible = await page.locator(".about-tab-panel").nth(0).isVisible();
          await labels.nth(1).click();
          const secondVisible = await page.locator(".about-tab-panel").nth(1).isVisible();
          const firstHidden = !(await page.locator(".about-tab-panel").nth(0).isVisible());
          if (firstVisible && secondVisible && firstHidden) {
            console.log(`PASS activation ${target.path}@${viewport.width}`);
          } else {
            failures += 1;
            console.log(`FAIL activation ${target.path}@${viewport.width}`);
          }
        }

        const switchPaths = await page
          .locator("header .header-actions a, footer .footer-switch")
          .evaluateAll((links) => links.map((link) => new URL(link.href).pathname));
        if (switchPaths.length === 2 && switchPaths.every((path) => path === target.other)) {
          console.log(`PASS locale-switch ${target.path}@${viewport.width}`);
        } else {
          failures += 1;
          console.log(`FAIL locale-switch ${target.path}@${viewport.width} ${switchPaths.join(",")}`);
        }
      } catch (error) {
        failures += 1;
        console.log(`FAIL page ${target.path}@${viewport.width} error=${error.message}`);
      } finally {
        await page.close();
      }
    }
  }
} finally {
  await browser.close();
}

if (failures > 0) process.exit(1);
