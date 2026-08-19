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
        await page.goto(`${baseUrl}${target.path}`, {
          waitUntil: "load",
          timeout: 15000,
        });

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
            if (!bio || !card) {
              return { ok: false, reason: "bio or entry card in visible panel missing" };
            }
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
          const toolbar = document.querySelector(".about-tab-toolbar");
          const panels = document.querySelector(".about-tab-panels");
          const visiblePanels = [...document.querySelectorAll(".about-tab-panel")].filter(
            (panel) => getComputedStyle(panel).display !== "none",
          );
          if (!toolbar || !panels) {
            return { ok: false, reason: "tab toolbar or panels missing" };
          }
          const toolbarRect = toolbar.getBoundingClientRect();
          const panelsRect = panels.getBoundingClientRect();
          return {
            ok:
              toolbarRect.bottom <= panelsRect.top + 1 &&
              visiblePanels.length === 1,
            toolbarBottom: toolbarRect.bottom,
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

        const sticky = await page.evaluate(() => {
          const toolbar = document.querySelector(".about-tab-toolbar");
          if (!toolbar) return { ok: false, reason: "toolbar missing" };
          return { ok: getComputedStyle(toolbar).position === "sticky" };
        });
        if (sticky.ok) {
          console.log(`PASS sticky-toolbar ${target.path}@${viewport.width}`);
        } else {
          failures += 1;
          console.log(`FAIL sticky-toolbar ${target.path}@${viewport.width} ${JSON.stringify(sticky)}`);
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

        if (viewport.width === 1024) {
          await page.locator('label[for="about-show-all"]').click();
          const showAll = await page.evaluate(() => {
            const panels = [...document.querySelectorAll(".about-tab-panel")];
            const visible = panels.filter((panel) => getComputedStyle(panel).display !== "none");
            const headings = panels.filter(
              (panel) => getComputedStyle(panel.querySelector(".about-panel-heading")).display !== "none",
            );
            return {
              ok: visible.length === panels.length && headings.length === panels.length,
              visible: visible.length,
              total: panels.length,
            };
          });
          if (showAll.ok) {
            console.log(`PASS show-all ${target.path} sections=${showAll.total}`);
          } else {
            failures += 1;
            console.log(`FAIL show-all ${target.path} ${JSON.stringify(showAll)}`);
          }

          await page.locator('label[for="about-show-all"]').click();
          await labels.nth(2).click();
          const skillsPanel = page.locator(".about-panel-skills");
          const totalSkills = await skillsPanel.locator(".about-filter-item").count();
          await skillsPanel.locator(".about-filter-input").fill("zzzz-no-match");
          const hiddenSkills = await skillsPanel.locator(".about-filter-item[hidden]").count();
          await skillsPanel.locator(".about-filter-input").fill("");
          const visibleAfterClear = await skillsPanel.locator(".about-filter-item:not([hidden])").count();
          if (hiddenSkills === totalSkills && visibleAfterClear === totalSkills) {
            console.log(`PASS skills-filter ${target.path} total=${totalSkills}`);
          } else {
            failures += 1;
            console.log(
              `FAIL skills-filter ${target.path} total=${totalSkills} hidden=${hiddenSkills} visible=${visibleAfterClear}`,
            );
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
