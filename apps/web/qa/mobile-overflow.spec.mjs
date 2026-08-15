import { chromium } from 'playwright';

const BASE_URL = process.env.PREVIEW_URL ?? 'http://localhost:4321';
// Optional: run with an installed Chrome/Edge channel (e.g. PLAYWRIGHT_CHANNEL=chrome)
// when the bundled Chromium binary is unavailable; CI keeps the default.
const CHANNEL = process.env.PLAYWRIGHT_CHANNEL;
const LAUNCH_OPTS = CHANNEL ? { headless: true, channel: CHANNEL } : { headless: true };

// 160x284 and 195x422 are CSS-viewport APPROXIMATIONS of 200% browser zoom on
// 320x568 and 390x844 (halved CSS pixels). They are NOT real zoom tests.
const APPROXIMATION_VIEWPORTS = [
  { width: 160, height: 284, note: 'approx-200pct-of-320x568' },
  { width: 195, height: 422, note: 'approx-200pct-of-390x844' },
];
const STANDARD_VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
];

const URLS = [
  { path: '/', controls: '.gateway-actions a', dir: 'ltr', viewports: [...APPROXIMATION_VIEWPORTS, ...STANDARD_VIEWPORTS] },
  { path: '/en/', controls: null, dir: 'ltr', viewports: [...APPROXIMATION_VIEWPORTS, ...STANDARD_VIEWPORTS] },
  { path: '/fa/', controls: null, dir: 'rtl', viewports: [...APPROXIMATION_VIEWPORTS, ...STANDARD_VIEWPORTS] },
  { path: '/en/about/', controls: null, dir: 'ltr', viewports: STANDARD_VIEWPORTS },
  { path: '/fa/about/', controls: null, dir: 'rtl', viewports: STANDARD_VIEWPORTS },
  { path: '/404.html', controls: '.notfound-actions a', dir: 'ltr', viewports: [...APPROXIMATION_VIEWPORTS, ...STANDARD_VIEWPORTS] },
];

let failed = false;
const browser = await chromium.launch(LAUNCH_OPTS);
const page = await browser.newPage();

try {
  for (const entry of URLS) {
    for (const vp of entry.viewports) {
      const target = `${BASE_URL}${entry.path}`;
      const label = `${entry.path}@${vp.width}x${vp.height}`;
      try {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(target, { waitUntil: 'networkidle' });
      const checks = await page.evaluate(
        ([expectedDir]) => {
          const htmlDir = document.documentElement.getAttribute('dir');
          const overflow = document.documentElement.scrollWidth - window.innerWidth;
          return { htmlDir, overflow, dirOk: htmlDir === expectedDir };
        },
        [entry.dir],
      );
      if (checks.overflow > 1) {
        failed = true;
        console.log(`FAIL ${label} overflow=${checks.overflow}px`);
      } else {
        console.log(`PASS ${label} overflow`);
      }
      if (!checks.dirOk) {
        failed = true;
        console.log(`FAIL ${label} dir=${checks.htmlDir} expected=${entry.dir}`);
      } else {
        console.log(`PASS ${label} dir=${checks.htmlDir}`);
      }
      if (entry.controls) {
        const controlCount = await page.locator(entry.controls).count();
        if (controlCount === 0) {
          failed = true;
          console.log(`FAIL ${label} no controls for ${entry.controls}`);
        }
        for (let i = 0; i < controlCount; i += 1) {
          const control = page.locator(entry.controls).nth(i);
          await control.scrollIntoViewIfNeeded();
          const box = await control.boundingBox();
          const viewportSize = page.viewportSize();
          if (!box) {
            failed = true;
            console.log(`FAIL ${label} control ${i} no boundingBox`);
            continue;
          }
          const hOk = box.x >= -1 && box.x + box.width <= viewportSize.width + 1;
          const vOk = box.y >= -1 && box.y + box.height <= viewportSize.height + 1;
          if (!hOk || !vOk) {
            failed = true;
            console.log(
              `FAIL ${label} control ${i} hOk=${hOk} vOk=${vOk} box=${JSON.stringify(box)}`,
            );
          } else {
            console.log(`PASS ${label} control ${i} reachable`);
          }
        }
      }
      } catch (error) {
        failed = true;
        console.log(`FAIL ${label} error=${error.message}`);
      }
    }
  }
} finally {
  await browser.close();
}

if (failed) {
  process.exit(1);
}
