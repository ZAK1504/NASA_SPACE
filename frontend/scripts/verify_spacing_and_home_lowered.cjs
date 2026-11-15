const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // 1. Capture Home page with lowered text & satellite
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'home_lowered_aligned.png') });
  console.log('Saved home_lowered_aligned.png');

  // 2. Scroll to Explorer
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) window.__lenis ? window.__lenis.scrollTo(el, { immediate: true }) : el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Capture Explorer with spaced discovery path
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'explorer_discovery_path_spaced.png') });
  console.log('Saved explorer_discovery_path_spaced.png');

  // Verify distance between discovery path badge and the bottom nodes in Explorer
  const spacingMetrics = await page.evaluate(() => {
    const badge = document.querySelector('.explorer-showcase-visual + div') || document.querySelector('[class*="CELESTIAL DISCOVERY PATH"]')?.parentElement;
    const visual = document.querySelector('.explorer-showcase-visual');
    if (!badge || !visual) return null;
    const badgeRect = badge.getBoundingClientRect();
    const visualRect = visual.getBoundingClientRect();
    return {
      gapPx: Math.round(badgeRect.top - visualRect.bottom),
      badgeTop: Math.round(badgeRect.top),
      visualBottom: Math.round(visualRect.bottom),
    };
  });
  console.log('Spacing Metrics:', spacingMetrics);

  await browser.close();
})();
