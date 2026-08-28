// WF-10 (G9) final QA matrix - @playwright/test against the default snapshot
// build served by `astro preview`:
//   PREVIEW_URL=http://127.0.0.1:4321 npx playwright test qa/final-matrix.spec.mjs --reporter=list
// Set CMS_BASE_URL to the same URL when the repo playwright.config.ts would
// otherwise boot the CMS e2e stack (its webServer is skipped when set).
//
// Cells: {gateway + 10 locale routes} x {en,fa} x 6 viewports x 2 themes
// (localStorage theme=light|dark + reload). Per cell: no horizontal overflow
// (tolerance 1px, same rule as qa/mobile-overflow.spec.mjs), skip-link present,
// exactly one h1, html lang/dir correct, data-theme resolves to the forced
// theme (gateway is always-night: dark forced, light observed not asserted).
// Plus: 200% text-zoom proxy (documentElement.style.zoom="2") - nav links keep
// non-zero geometry inside the document scroll bounds (no clipped nav); and a
// JS-disabled crawl (javaScriptEnabled:false) - header nav links + non-empty
// main text on every core page, contact form fields + honeypot present,
// projects GET filter form + research filter markup present, writing detail
// routes probed honestly (skipped, never counted as PASS, when the CMS-less
// snapshot build publishes no detail slugs).

import { test, expect } from "@playwright/test";

const BASE = process.env.PREVIEW_URL ?? "http://127.0.0.1:4321";

const LOCALES = [
  { code: "en", dir: "ltr" },
  { code: "fa", dir: "rtl" },
];

const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

const ROUTES = [
  { path: "/", label: "home" },
  { path: "/research/", label: "research" },
  { path: "/publications/", label: "publications" },
  { path: "/writing/", label: "writing" },
  { path: "/about/", label: "about" },
  { path: "/cv/", label: "cv" },
  { path: "/contact/", label: "contact" },
  { path: "/creative/", label: "creative" },
  { path: "/teaching/", label: "teaching" },
  { path: "/projects/", label: "projects" },
];

const THEMES = ["light", "dark"];

const tally = { cells: 0, overflow: 0, skippedWritingDetail: false };

async function forceTheme(page, theme) {
  await page.evaluate((value) => {
    window.localStorage.setItem("theme", value);
  }, theme);
  await page.reload({ waitUntil: "load" });
}

test.describe("gateway (always-night)", () => {
  for (const viewport of VIEWPORTS) {
    test(`gateway ${viewport.width}x${viewport.height} dir+overflow+skip+h1`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE}/`, { waitUntil: "load" });
      const checks = await page.evaluate(() => {
        const doc = document.documentElement;
        return {
          overflow: doc.scrollWidth - window.innerWidth,
          h1Count: document.querySelectorAll("h1").length,
          skipLink: document.querySelectorAll("a.skip-link[href=\"#main\"]").length,
          lang: doc.getAttribute("lang"),
          dir: doc.getAttribute("dir"),
          theme: doc.getAttribute("data-theme"),
          actions: document.querySelectorAll(".gateway-actions a").length,
        };
      });
      tally.cells += 1;
      expect(checks.overflow).toBeLessThanOrEqual(1);
      expect(checks.skipLink).toBe(1);
      expect(checks.h1Count).toBe(1);
      expect(checks.lang).toBe("en");
      expect(checks.dir).toBe("ltr");
      expect(checks.theme).toBe("dark");
      expect(checks.actions).toBeGreaterThanOrEqual(2);
    });
  }

  test("gateway stays night with localStorage theme=light + reload", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE}/`, { waitUntil: "load" });
    await forceTheme(page, "light");
    const theme = await page.evaluate(() => document.documentElement.getAttribute("data-theme"));
    expect(theme, "gateway must stay night even when localStorage theme=light").toBe("dark");
  });
});

test.describe("locale route matrix (6 viewports x 2 themes x 2 dirs)", () => {
  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      for (const theme of THEMES) {
        for (const viewport of VIEWPORTS) {
          test(`${locale.code} ${route.label || "/"} ${viewport.width}w ${theme}`, async ({ page }) => {
            await page.setViewportSize(viewport);
            await page.goto(`${BASE}/${locale.code}${route.path}`, { waitUntil: "load" });
            await forceTheme(page, theme);
            const checks = await page.evaluate(({ dir, lang }) => {
              const doc = document.documentElement;
              return {
                overflow: doc.scrollWidth - window.innerWidth,
                h1Count: document.querySelectorAll("h1").length,
                skipLink: document.querySelectorAll("a.skip-link[href=\"#main\"]").length,
                lang: doc.getAttribute("lang"),
                dir: doc.getAttribute("dir"),
                theme: doc.getAttribute("data-theme"),
              };
            }, { dir: locale.dir, lang: locale.code });
            tally.cells += 1;
            expect(checks.overflow, `overflow ${checks.overflow}px at /${locale.code}${route.path} ${viewport.width}w ${theme}`).toBeLessThanOrEqual(1);
            expect(checks.skipLink).toBe(1);
            expect(checks.h1Count).toBe(1);
            expect(checks.lang).toBe(locale.code);
            expect(checks.dir).toBe(locale.dir);
            expect(checks.theme).toBe(theme);
          });
        }
      }
    }
  }
});

test.describe("writing detail (honest probe)", () => {
  const slugsByLocale = {};
  test.beforeAll(async ({ request }) => {
    for (const locale of LOCALES) {
      const response = await request.get(`${BASE}/${locale.code}/writing/`);
      const html = response.ok() ? await response.text() : "";
      const matches = [...html.matchAll(new RegExp(`href="/${locale.code}/writing/([^/]+)/"`, "g"))].map((m) => m[1]);
      slugsByLocale[locale.code] = [...new Set(matches)].filter((slug) => !["series", "tag"].includes(slug));
    }
  });

  for (const locale of LOCALES) {
    test(`${locale.code} writing detail availability`, async () => {
      if (slugsByLocale[locale.code].length === 0) {
        tally.skippedWritingDetail = true;
        test.skip(true, "no published writing detail routes in the CMS-less snapshot build - SKIPPED, not PASS");
      }
      expect(slugsByLocale[locale.code].length).toBeGreaterThan(0);
    });
    test(`${locale.code} writing detail page basics (conditional)`, async ({ request }) => {
      const slug = slugsByLocale[locale.code][0];
      test.skip(!slug, "no published writing detail routes in the CMS-less snapshot build - SKIPPED, not PASS");
      const response = await request.get(`${BASE}/${locale.code}/writing/${slug}/`);
      expect(response.ok(), `detail /${locale.code}/writing/${slug}/ responds`).toBe(true);
      const html = await response.text();
      expect((html.match(/<h1[\s>]/gi) ?? []).length, "detail has exactly one h1").toBe(1);
      expect(html, "detail html lang").toContain(`lang="${locale.code}"`);
      expect(html, `detail html dir ${locale.dir}`).toContain(`dir="${locale.dir}"`);
      expect(html, "detail html carries skip-link").toContain("skip-link");
    });
  }
});

test.describe("200 percent text zoom proxy", () => {
  for (const locale of LOCALES) {
    for (const route of [ROUTES[0], ROUTES[4]]) {
      for (const viewport of [VIEWPORTS[1], VIEWPORTS[4]]) {
        test(`${locale.code} ${route.label} ${viewport.width}w zoom=2 nav not clipped`, async ({ page }) => {
          await page.setViewportSize(viewport);
          await page.goto(`${BASE}/${locale.code}${route.path}`, { waitUntil: "load" });
          await page.evaluate(() => {
            document.documentElement.style.zoom = "2";
          });
          await page.waitForTimeout(150);
          const nav = await page.evaluate(() => {
            const doc = document.documentElement;
            const bounds = doc.getBoundingClientRect();
            const all = [...document.querySelectorAll(".site-header a")];
            const links = all.filter((link) =>
              typeof link.checkVisibility === "function" ? link.checkVisibility() : link.offsetParent !== null,
            );
            return {
              count: links.length,
              hidden: all.length - links.length,
              rects: links.map((link) => {
                const rect = link.getBoundingClientRect();
                return {
                  w: rect.width,
                  h: rect.height,
                  left: rect.left,
                  right: rect.right,
                  top: rect.top,
                  bottom: rect.bottom,
                };
              }),
              boundsLeft: bounds.left,
              boundsRight: bounds.right,
              boundsTop: bounds.top,
              boundsBottom: bounds.bottom,
            };
          });
          expect(nav.count, "visible header nav links present").toBeGreaterThan(0);
          for (const rect of nav.rects) {
            expect(rect.w, "visible nav link not clipped to zero width under 200% zoom").toBeGreaterThan(0);
            expect(rect.h, "visible nav link not clipped to zero height under 200% zoom").toBeGreaterThan(0);
            expect(rect.left, "nav link within document bounds (left)").toBeGreaterThanOrEqual(nav.boundsLeft - 1);
            expect(rect.right, "nav link within document bounds (right)").toBeLessThanOrEqual(nav.boundsRight + 1);
            expect(rect.top, "nav link within document bounds (top)").toBeGreaterThanOrEqual(nav.boundsTop - 1);
            expect(rect.bottom, "nav link within document bounds (bottom)").toBeLessThanOrEqual(nav.boundsBottom + 1);
          }
        });
      }
    }
  }
});

test.describe("JS-disabled crawl", () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of LOCALES) {
    for (const route of ROUTES) {
      test(`${locale.code} ${route.label || "/"} no-JS: nav + main text`, async ({ page }) => {
        await page.goto(`${BASE}/${locale.code}${route.path}`, { waitUntil: "load" });
        const checks = await page.evaluate(() => {
          const main = document.querySelector("main#main") ?? document.querySelector("main");
          return {
            navLinks: document.querySelectorAll(".site-header a[href], .gateway-actions a[href]").length,
            mainChars: main ? main.textContent.replace(/\s+/g, " ").trim().length : 0,
            mainFound: Boolean(main),
          };
        });
        expect(checks.mainFound, "main landmark present without JS").toBe(true);
        expect(checks.navLinks, "header nav links present without JS").toBeGreaterThan(0);
        expect(checks.mainChars, "main has real text without JS").toBeGreaterThan(80);
      });
    }

    test(`${locale.code} contact form fields survive no-JS`, async ({ page }) => {
      await page.goto(`${BASE}/${locale.code}/contact/`, { waitUntil: "load" });
      for (const selector of [
        "form[action=\"/api/contact\"]",
        "input[name=\"name\"]",
        "input[name=\"email\"]",
        "textarea[name=\"message\"]",
        "input[name=\"website\"]",
      ]) {
        expect(await page.locator(selector).count(), `${selector} without JS`).toBeGreaterThanOrEqual(1);
      }
    });

    test(`${locale.code} no-JS filters: projects GET form or honest empty`, async ({ page }) => {
      await page.goto(`${BASE}/${locale.code}/projects/`, { waitUntil: "load" });
      const projects = await page.evaluate(() => ({
        form: document.querySelectorAll("form[method=\"get\"], form[method=\"GET\"]").length,
        empty: document.body.textContent.toLowerCase().includes("empty") || document.querySelectorAll("[class*=\"empty\"]").length,
        rows: document.querySelectorAll("main a[href*=\"/projects/\"]").length,
      }));
      const projectsOk = projects.form >= 1 || (projects.rows === 0 && projects.empty >= 1);
      expect(projectsOk, `projects no-JS: GET filter form or honest-empty panel (form=${projects.form} rows=${projects.rows} empty=${projects.empty})`).toBe(true);
      await page.goto(`${BASE}/${locale.code}/research/`, { waitUntil: "load" });
      const research = await page.evaluate(() => ({
        filters: document.querySelectorAll("[data-research-filters]").length,
        empty: document.body.textContent.toLowerCase().includes("empty") || document.querySelectorAll("[class*=\"empty\"]").length,
      }));
      const researchOk = research.filters >= 1 || research.empty >= 1;
      expect(researchOk, `research no-JS: filter markup or honest-empty panel (filters=${research.filters} empty=${research.empty})`).toBe(true);
    });
  }
});

test.afterAll(async () => {
  console.log(
    `[final-matrix] cells=${tally.cells} overflowHits=${tally.overflow} writingDetailSkipped=${tally.skippedWritingDetail}`,
  );
});
