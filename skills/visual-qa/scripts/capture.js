#!/usr/bin/env node
/**
 * Playwright capture script for visual-qa.
 *
 * Env vars:
 *   BASE_URL      base URL Playwright hits (default: http://localhost:3000)
 *   ROUTE         path to capture (default: /)
 *   OUTPUT_DIR    screenshot output directory (default: /tmp/visual-qa)
 *   BREAKPOINTS   JSON array of {name, width, height} from Phase 0
 *   WAIT_TIMEOUT  ms to wait after networkidle (default: 1500)
 *   FULL_PAGE     "true" for full-page screenshots
 *   BROWSERS      comma-separated list, any of: chromium,webkit,firefox
 *                 (default: chromium). Output filenames are prefixed with the
 *                 engine name when more than one is requested:
 *                 chromium-mobile.png, webkit-mobile.png, etc.
 */
const playwright = require('playwright');

(async () => {
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
  const route = process.env.ROUTE || '/';
  const outputDir = process.env.OUTPUT_DIR || '/tmp/visual-qa';
  const breakpoints = JSON.parse(process.env.BREAKPOINTS || '[]');
  const waitMs = parseInt(process.env.WAIT_TIMEOUT || '1500', 10);
  const fullPage = process.env.FULL_PAGE === 'true';
  const engines = (process.env.BROWSERS || 'chromium')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  const prefixOutput = engines.length > 1;

  for (const engineName of engines) {
    const engine = playwright[engineName];
    if (!engine) {
      console.error(`unknown browser: ${engineName}`);
      process.exitCode = 1;
      continue;
    }
    const browser = await engine.launch();
    for (const bp of breakpoints) {
      const page = await browser.newPage({
        viewport: { width: bp.width, height: bp.height },
      });
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(waitMs);
      const fileName = prefixOutput
        ? `${engineName}-${bp.name}.png`
        : `${bp.name}.png`;
      await page.screenshot({ path: `${outputDir}/${fileName}`, fullPage });
      await page.close();
    }
    await browser.close()
  }
})();
