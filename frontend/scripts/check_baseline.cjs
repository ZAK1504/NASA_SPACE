const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('Launching browser to capture baseline state...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('Navigating to http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // 1. Scroll to Explorer
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 800));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'baseline_01_explorer.png') });
  console.log('Captured baseline_01_explorer.png');

  // 2. Scroll to Labs
  await page.evaluate(() => {
    const el = document.getElementById('labs');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'baseline_02_labs.png') });
  console.log('Captured baseline_02_labs.png');

  // 3. Test clicking "Enter Discovery Lab"
  console.log('Clicking Enter Discovery Lab to check transition behavior...');
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));

  const transitionInfo = await page.evaluate(async () => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Enter Discovery Lab'));
    if (!btn) return { error: 'Button not found' };
    
    // Check overlay element in DOM before click
    const overlayBefore = document.querySelector('canvas.pointer-events-none');
    btn.click();
    
    // Sample over 1 second
    const samples = [];
    for (let i = 0; i < 10; i++) {
      await new Promise(r => setTimeout(r, 100));
      const activeOverlay = document.querySelector('.fixed.inset-0.z-50') || document.querySelector('canvas');
      samples.push({
        timeMs: (i + 1) * 100,
        url: window.location.pathname,
        hasOverlay: !!activeOverlay,
        overlayOpacity: activeOverlay ? window.getComputedStyle(activeOverlay).opacity : null,
      });
    }
    return { overlayBefore: !!overlayBefore, samples };
  });

  console.log('Transition test result:', JSON.stringify(transitionInfo, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
