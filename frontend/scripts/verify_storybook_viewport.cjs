const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const REPORTS_DIR = path.resolve(__dirname, '../../reports/screenshots');

if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR, { recursive: true });
}

(async () => {
  console.log('--- STARTING STORYBOOK VIEWPORT VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  const resolutions = [
    { name: '1366x768', w: 1366, h: 768 },
    { name: '1920x1080', w: 1920, h: 1080 },
    { name: '1440x900', w: 1440, h: 900 },
    { name: '1280x720', w: 1280, h: 720 }
  ];

  for (const res of resolutions) {
    console.log(`\nTesting Resolution: ${res.name} (${res.w}x${res.h})`);
    await page.setViewport({ width: res.w, height: res.h });
    await page.goto('http://127.0.0.1:5173/story', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    // Capture Cover Spread
    const coverPathArtifact = path.join(ARTIFACT_DIR, `storybook_after_cover_${res.name}.png`);
    const coverPathReport = path.join(REPORTS_DIR, `storybook_after_cover_${res.name}.png`);
    await page.screenshot({ path: coverPathArtifact });
    await page.screenshot({ path: coverPathReport });
    console.log(`Saved Cover Spread screenshot for ${res.name}`);

    // Find iframe and inspect bounds
    const frame = page.frames().find(f => f.url().includes('storybook'));
    if (!frame) throw new Error('Storybook iframe not found');

    const metricsCover = await frame.evaluate(() => {
      const b = document.body;
      const html = document.documentElement;
      const book = document.querySelector('.book');
      const spread = document.querySelector('.spread:not([hidden])');
      const controls = document.querySelector('.controls');
      const prevBtn = document.querySelector('#prev');
      const nextBtn = document.querySelector('#next');
      const counter = document.querySelector('#counter');

      const bookRect = book.getBoundingClientRect();
      const controlsRect = controls.getBoundingClientRect();

      return {
        windowH: window.innerHeight,
        scrollH: html.scrollHeight,
        overflowY: html.scrollHeight - window.innerHeight,
        bookTop: bookRect.top,
        bookBottom: bookRect.bottom,
        controlsBottom: controlsRect.bottom,
        nextBtnDisabled: nextBtn.disabled,
        prevBtnDisabled: prevBtn.disabled,
        counterText: counter.textContent
      };
    });

    console.log(`Metrics Cover (${res.name}):`, metricsCover);
    if (metricsCover.overflowY > 0) {
      console.error(`FAILURE: Overflow of ${metricsCover.overflowY}px at ${res.name}`);
    } else {
      console.log(`SUCCESS: 0px overflow! Whole book & controls within viewport.`);
    }

    // Click Next page to open Chapter 1
    await frame.evaluate(() => {
      document.querySelector('#next').click();
    });
    await new Promise(r => setTimeout(r, 600));

    // Capture Open Spread 1
    const spreadPathArtifact = path.join(ARTIFACT_DIR, `storybook_after_open_${res.name}.png`);
    const spreadPathReport = path.join(REPORTS_DIR, `storybook_after_open_${res.name}.png`);
    await page.screenshot({ path: spreadPathArtifact });
    await page.screenshot({ path: spreadPathReport });
    console.log(`Saved Open Spread 1 screenshot for ${res.name}`);

    const metricsOpen = await frame.evaluate(() => {
      const html = document.documentElement;
      const book = document.querySelector('.book');
      const controls = document.querySelector('.controls');
      const counter = document.querySelector('#counter');

      return {
        overflowY: html.scrollHeight - window.innerHeight,
        controlsBottom: controls.getBoundingClientRect().bottom,
        counterText: counter.textContent
      };
    });
    console.log(`Metrics Open Spread 1 (${res.name}):`, metricsOpen);

    // Test Keyboard navigation (ArrowRight)
    await page.keyboard.press('ArrowRight');
    await new Promise(r => setTimeout(r, 500));

    const counterAfterArrow = await frame.evaluate(() => {
      return document.querySelector('#counter').textContent;
    });
    console.log(`Counter after ArrowRight: ${counterAfterArrow}`);

    // Test Keyboard navigation back (ArrowLeft)
    await page.keyboard.press('ArrowLeft');
    await new Promise(r => setTimeout(r, 500));
    const counterAfterArrowLeft = await frame.evaluate(() => {
      return document.querySelector('#counter').textContent;
    });
    console.log(`Counter after ArrowLeft: ${counterAfterArrowLeft}`);
  }

  await browser.close();
  console.log('\n--- STORYBOOK VIEWPORT VERIFICATION COMPLETE ---');
})();
