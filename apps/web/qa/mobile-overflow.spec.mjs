import { chromium } from 'playwright';

const BASE_URL = process.env.PREVIEW_URL ?? 'http://localhost:4321';
const CHANNEL = process.env.PLAYWRIGHT_CHANNEL;
const LAUNCH_OPTS = CHANNEL ? { headless: true, channel: CHANNEL } : { headless: true };

// Critical viewport combinations only — reduces CI time from 1h+ to ~2min
const CRITICAL_VIEWPORTS = [
  { width: 320, height: 568 },    // Mobile portrait
  { width: 390, height: 844 },    // Mobile large
  { width: 768, height: 1024 },   // Tablet portrait
  { width: 1280, height: 800 },   // Desktop
];

const URLS = [
  { path: '/', controls: '.gateway-actions a', dir: 'ltr', viewports: CRITICAL_VIEWPORTS },
  { path: '/en/', controls: '.site-header a', dir: 'ltr', viewports: CRITICAL_VIEWPORTS },
  { path: '/fa/', controls: '.site-header a', dir: 'rtl', viewports: CRITICAL_VIEWPORTS },
  { path: '/en/about/', controls: '.site-header a', dir: 'ltr', viewports: CRITICAL_VIEWPORTS },
  { path: '/fa/about/', controls: '.site-header a', dir: 'rtl', viewports: CRITICAL_VIEWPORTS },
  { path: '/404.html', controls: '.notfound-actions a', dir: 'ltr', viewports: CRITICAL_VIEWPORTS },
];

const GOTO_TIMEOUT = 30000;
const ACTION_TIMEOUT = 10000;

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
        await page.goto(target, { waitUntil: 'load', timeout: GOTO_TIMEOUT });
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
        const sources = await page.evaluate(() =>
          [...document.querySelectorAll('*')]
            .map((element) => {
              const rect = element.getBoundingClientRect();
              return {
                tag: element.tagName.toLowerCase(),
                className: typeof element.className === 'string' ? element.className : '',
                id: element.id,
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
                scrollWidth: element.scrollWidth,
                clientWidth: element.clientWidth,
              };
            })
            .filter((item) => item.right > window.innerWidth + 1 || item.left < -1 || item.scrollWidth > item.clientWidth + 1)
            .slice(0, 12),
        );
        console.log(`FAIL ${label} overflow=${checks.overflow}px sources=${JSON.stringify(sources)}`);
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
          await control.scrollIntoViewIfNeeded({ timeout: ACTION_TIMEOUT });
          const box = await control.boundingBox({ timeout: ACTION_TIMEOUT });
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
