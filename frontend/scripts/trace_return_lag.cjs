const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('[PERF]')) {
      console.log(text);
    }
  });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Measure directly in browser
  await page.evaluate(() => {
    console.log('[PERF] Starting in-browser breakdown...');
  });

  // Navigate to /objects
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Objects'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  // Now trace what happens on click back-to-journey
  const timing = await page.evaluate(async () => {
    const t0 = performance.now();
    const btn = document.querySelector('button[data-action="back-to-journey"]');
    if (!btn) return { error: 'No back button' };

    // Inject timers into key global methods
    const originalScrollTo = window.scrollTo;
    let scrollToCalls = [];
    window.scrollTo = function(...args) {
      scrollToCalls.push({ time: Math.round(performance.now() - t0), args });
      return originalScrollTo.apply(this, args);
    };

    btn.click();

    // Sample execution over next 600ms
    const samples = [];
    for (let i = 0; i < 15; i++) {
      const s0 = performance.now();
      await new Promise(r => setTimeout(r, 40));
      const s1 = performance.now();
      samples.push({
        elapsed: Math.round(s1 - t0),
        lag: Math.round((s1 - s0) - 40),
        url: window.location.pathname,
        scrollY: window.scrollY,
      });
    }

    return { scrollToCalls, samples };
  });

  console.log('Timing breakdown:', JSON.stringify(timing, null, 2));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
