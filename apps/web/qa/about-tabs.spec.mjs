import { chromium } from "playwright";

const baseUrl = process.env.PREVIEW_URL ?? "http://localhost:4321";
const pages = [
  { path: "/en/about/", other: "/fa/about/" },
  { path: "/fa/about/", other: "/en/about/" },
];
const viewports = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];
const desktopWidths = [1024, 1280, 1440];
const centerTolerance = 2;

let failures = 0;
const executablePath = process.env.PW_EXECUTABLE_PATH;
const browser = executablePath
  ? await chromium.launch({ executablePath })
  : await chromium.launch();

try {
  for (const viewport of viewports) {
    for (const target of pages) {
      const page = await browser.newPage({ viewport });
      try {
        await page.goto(`${baseUrl}${target.path}`, { waitUntil: "networkidle" });

        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - window.innerWidth,
        );
        if (overflow > 1) {
          failures += 1;
          console.log(`FAIL overflow ${target.path}@${viewport.width} overflow=${overflow}px`);
        } else {
          console.log(`PASS overflow ${target.path}@${viewport.width}`);
        }

        const intro = await page.evaluate((tol) => {
          const about = document.querySelector(".about");
          const blocks = [...document.querySelectorAll(".about-bio, .about-bio-long")];
          if (!about || blocks.length !== 2) {
            return { ok: false, reason: `about or intro blocks missing (${blocks.length})` };
          }
          const aboutRect = about.getBoundingClientRect();
          const aboutCenter = aboutRect.left + aboutRect.width / 2;
          const deltas = blocks.map((block) => {
            const rect = block.getBoundingClientRect();
            return Math.abs(rect.left + rect.width / 2 - aboutCenter);
          });
          return { ok: deltas.every((delta) => delta <= tol), deltas };
        }, centerTolerance);
        if (intro.ok) {
          const maxDelta = Math.max(...intro.deltas);
          console.log(`PASS intro-centered ${target.path}@${viewport.width} maxDelta=${maxDelta.toFixed(2)}px`);
        } else {
          failures += 1;
          console.log(`FAIL intro-centered ${target.path}@${viewport.width} ${JSON.stringify(intro)}`);
        }

        if (desktopWidths.includes(viewport.width)) {
          const wider = await page.evaluate(() => {
            const bio = document.querySelector(".about-bio")?.getBoundingClientRect();
            const visiblePanel = [...document.querySelectorAll(".about-tab-panel")].find(
              (panel) =>
                getComputedStyle(panel).display !== "none" &&
                getComputedStyle(panel).visibility !== "hidden",
            );
            const card = visiblePanel?.querySelector(".entry")?.getBoundingClientRect();
            if (!bio || !card) return { ok: false, reason: "bio or entry card in visible panel missing" };
            return { ok: card.width > bio.width, bioWidth: bio.width, cardWidth: card.width };
          });
          if (wider.ok) {
            console.log(
              `PASS cards-wider ${target.path}@${viewport.width} card=${Math.round(wider.cardWidth)}px bio=${Math.round(wider.bioWidth)}px`,
            );
          } else {
            failures += 1;
            console.log(`FAIL cards-wider ${target.path}@${viewport.width} ${JSON.stringify(wider)}`);
          }
        }

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
          const direction = await page.locator("html").getAttribute("dir");
          await page.keyboard.press(direction === "rtl" ? "ArrowLeft" : "ArrowRight");
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
