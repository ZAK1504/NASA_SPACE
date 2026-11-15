const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Scroll to explorer
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 600));

  console.log('Triggering transition from Explorer -> Object Explorer...');
  // Click Explore Objects button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Objects'));
    if (btn) btn.click();
  });

  // Capture frames
  const captureTimes = [80, 200, 320, 460, 600, 750];
  let lastTime = 0;
  for (let i = 0; i < captureTimes.length; i++) {
    const target = captureTimes[i];
    const wait = target - lastTime;
    await new Promise(r => setTimeout(r, wait));
    lastTime = target;
    const file = path.join(ARTIFACTS_DIR, `transition_frame_${i + 1}_${target}ms.png`);
    await page.screenshot({ path: file });
    console.log(`Saved ${file}`);
  }

  // Now test Back to Journey
  console.log('Testing Back to Journey return transition...');
  await new Promise(r => setTimeout(r, 600));
  await page.evaluate(() => {
    const backBtn = document.querySelector('button[data-action="back-to-journey"]');
    if (backBtn) backBtn.click();
  });

  const returnTimes = [80, 220, 360, 500, 680];
  lastTime = 0;
  for (let i = 0; i < returnTimes.length; i++) {
    const target = returnTimes[i];
    const wait = target - lastTime;
    await new Promise(r => setTimeout(r, wait));
    lastTime = target;
    const file = path.join(ARTIFACTS_DIR, `return_frame_${i + 1}_${target}ms.png`);
    await page.screenshot({ path: file });
    console.log(`Saved ${file}`);
  }

  // Final check: confirm URL and scroll restoration
  const finalState = await page.evaluate(() => {
    return {
      hash: window.location.hash,
      pathname: window.location.pathname,
      scrollY: window.scrollY,
    };
  });
  console.log('Final restored state:', finalState);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
