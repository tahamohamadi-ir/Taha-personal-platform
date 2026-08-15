import { chromium } from 'playwright';

const BASE_URL = process.env.PREVIEW_URL ?? 'http://localhost:4321';
const VIEWPORTS = [
  { width: 320, height: 568 },
  { width: 390, height: 844 },
];
const URLS = ['/', '/en/', '/fa/', '/en/about/', '/fa/about/', '/404.html'];

let failed = false;

for (const viewport of VIEWPORTS) {
  for (const url of URLS) {
    const target = `${BASE_URL}${url}`;
    let browser;
    try {
      browser = await chromium.launch({ headless: true });
      const page = await browser.newPage({ viewport });
      await page.goto(target, { waitUntil: 'networkidle' });
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - window.innerWidth,
      );
      if (overflow > 1) {
        failed = true;
        console.log(`FAIL ${url}@${viewport.width} overflow=${overflow}px`);
      } else {
        console.log(`PASS ${url}@${viewport.width}`);
      }
    } catch (error) {
      failed = true;
      console.log(`FAIL ${url}@${viewport.width} error=${error.message}`);
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }
}

if (failed) {
  process.exit(1);
}
