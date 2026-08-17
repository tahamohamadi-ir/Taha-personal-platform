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
            const card = document
              .querySelector(".about-evidence .entry")
              ?.getBoundingClientRect();
            if (!bio || !card) {
              return { ok: false, reason: "bio or stacked entry card missing" };
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

        const stacked = await page.evaluate(() => {
          const toc = document.querySelector(".about-toc");
          const evidence = document.querySelector(".about-evidence");
          const sections = [...document.querySelectorAll(".about-evidence .about-section")];
          const education = document.querySelector("#education");
          const educationVisible =
            !!education &&
            getComputedStyle(education).display !== "none" &&
            education.textContent.includes("Sooreh University");
          if (!toc || !evidence || sections.length < 2) {
            return {
              ok: false,
              reason: "stacked about evidence or fragment nav missing",
              sectionCount: sections.length,
            };
          }
          const tocRect = toc.getBoundingClientRect();
          const evidenceRect = evidence.getBoundingClientRect();
          const allVisible = sections.every(
            (section) => getComputedStyle(section).display !== "none",
          );
          return {
            ok: tocRect.bottom <= evidenceRect.top + 1 && allVisible && educationVisible,
            sectionCount: sections.length,
            educationVisible,
          };
        });

        if (stacked.ok) {
          console.log(`PASS stacked-evidence ${target.path}@${viewport.width} sections=${stacked.sectionCount}`);
        } else {
          failures += 1;
          console.log(`FAIL stacked-evidence ${target.path}@${viewport.width} ${JSON.stringify(stacked)}`);
        }

        const fragmentNav = await page.evaluate(() => {
          const link = document.querySelector('.about-toc a[href="#education"]');
          const target = document.querySelector("#education");
          return {
            ok:
              !!link &&
              !!target &&
              link.getAttribute("href") === "#education" &&
              target.querySelector(".entry") !== null,
          };
        });

        if (fragmentNav.ok) {
          console.log(`PASS fragment-nav ${target.path}@${viewport.width}`);
        } else {
          failures += 1;
          console.log(`FAIL fragment-nav ${target.path}@${viewport.width} ${JSON.stringify(fragmentNav)}`);
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
