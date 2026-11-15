const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const page = await browser.newPage();
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const initial = await page.evaluate(() => {
    const el = document.querySelector('.fixed.inset-0.z-\\[100\\]');
    return {
      exists: !!el,
      visibility: el ? window.getComputedStyle(el).visibility : null,
      opacity: el ? window.getComputedStyle(el).opacity : null,
    };
  });
  console.log('Initial overlay state:', initial);

  // Scroll to Labs
  await page.evaluate(() => {
    const el = document.getElementById('labs');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));

  // Click CTA
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Enter Discovery Lab'));
    if (btn) btn.click();
  });

  // Sample every 70ms for 1000ms
  for (let t = 70; t <= 980; t += 70) {
    await new Promise(r => setTimeout(r, 70));
    const sample = await page.evaluate(() => {
      const el = document.querySelector('.fixed.inset-0.z-\\[100\\]');
      return {
        url: window.location.pathname,
        visibility: el ? window.getComputedStyle(el).visibility : null,
        opacity: el ? window.getComputedStyle(el).opacity : null,
      };
    });
    console.log(`t = ${t}ms:`, sample);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
