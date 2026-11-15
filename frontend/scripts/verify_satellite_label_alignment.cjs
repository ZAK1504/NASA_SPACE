const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

const VIEWPORTS = [
  { name: 'desktop_1440', width: 1440, height: 900 },
  { name: 'laptop_1280', width: 1280, height: 800 },
  { name: 'tablet_768', width: 768, height: 1024 },
  { name: 'mobile_390', width: 390, height: 844 },
];

(async () => {
  console.log('--- STARTING MULTI-SCREEN VERIFICATION: SATELLITE LABEL CENTERING ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const results = [];

  for (const vp of VIEWPORTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.width, height: vp.height });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1200));

    const metrics = await page.evaluate(() => {
      const satContainer = document.querySelector('[data-tour="journey-spacecraft"]');
      const canvas = satContainer ? satContainer.querySelector('canvas') : null;
      const label = satContainer ? Array.from(satContainer.querySelectorAll('div')).find(d => d.textContent.includes('SPHEREx Flight Model')) : null;

      if (!satContainer || !label) return null;

      const contRect = satContainer.getBoundingClientRect();
      const canvasRect = canvas ? canvas.getBoundingClientRect() : contRect;
      const labelRect = label.getBoundingClientRect();

      const canvasCenterX = canvasRect.left + canvasRect.width / 2;
      const labelCenterX = labelRect.left + labelRect.width / 2;
      const diffX = Math.abs(canvasCenterX - labelCenterX);

      return {
        canvasWidth: Math.round(canvasRect.width),
        labelWidth: Math.round(labelRect.width),
        canvasCenterX: Math.round(canvasCenterX),
        labelCenterX: Math.round(labelCenterX),
        diffX: Number(diffX.toFixed(2)),
        isCentered: diffX <= 1.5,
      };
    });

    const screenshotFile = `sat_label_centered_${vp.name}.png`;
    await page.screenshot({ path: path.join(ARTIFACT_DIR, screenshotFile) });
    console.log(`[${vp.name}] Alignment:`, metrics, `(saved ${screenshotFile})`);

    results.push({ viewport: vp.name, ...metrics });
    await page.close();
  }

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'satellite_label_alignment_results.json'), JSON.stringify(results, null, 2));
  console.log('Saved satellite_label_alignment_results.json');

  await browser.close();
  console.log('--- VERIFICATION COMPLETE ---');
})();
