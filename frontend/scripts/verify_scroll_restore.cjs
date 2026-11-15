const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  // Scroll to explorer using lenis immediate
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (window.__lenis && el) {
      window.__lenis.scrollTo(el, { immediate: true, offset: -70 });
    }
  });
  await new Promise(r => setTimeout(r, 200));

  const startScrollY = await page.evaluate(() => window.scrollY);
  console.log('Originating scroll position at Explorer:', startScrollY);

  // Click Explore Objects
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Objects'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  console.log('Workspace URL:', await page.evaluate(() => window.location.pathname), 'scrollY:', await page.evaluate(() => window.scrollY));

  // Click Back to Journey
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="back-to-journey"]');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 800));

  const finalState = await page.evaluate(() => {
    return {
      pathname: window.location.pathname,
      hash: window.location.hash,
      scrollY: window.scrollY,
    };
  });
  console.log('Restored state upon return:', finalState);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
