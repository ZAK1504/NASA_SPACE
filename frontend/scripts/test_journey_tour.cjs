const puppeteer = require('puppeteer-core');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACTS_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

async function main() {
  console.log('Testing Main Journey Tour button...');
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true, args: ['--window-size=1440,900'] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Find and click Tour button in Navbar
  const tourBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Tour');
  });

  if (!tourBtn) {
    console.error('Tour button not found in Navbar!');
    process.exit(1);
  }

  console.log('Clicking Tour button in Navbar...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Tour');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  // Inspect Tour popover
  const tourInfo = await page.evaluate(() => {
    const popover = document.querySelector('.driver-popover');
    if (!popover) return { active: false };
    const title = popover.querySelector('.driver-popover-title')?.textContent;
    const desc = popover.querySelector('.driver-popover-description')?.textContent;
    const progress = popover.querySelector('.driver-popover-progress-text')?.textContent;
    return { active: true, title, desc, progress };
  });

  console.log('Step 1 Tour Info:', tourInfo);
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'tour_step_01_welcome.png') });
  console.log('Saved tour_step_01_welcome.png');

  // Advance through next 4 steps
  for (let i = 2; i <= 5; i++) {
    await page.evaluate(() => {
      const nextBtn = document.querySelector('.driver-popover-next-btn') || Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Next'));
      if (nextBtn) nextBtn.click();
    });
    await new Promise(r => setTimeout(r, 700));

    const stepInfo = await page.evaluate(() => {
      const popover = document.querySelector('.driver-popover');
      return {
        title: popover?.querySelector('.driver-popover-title')?.textContent,
        scrollY: window.scrollY,
      };
    });
    console.log(`Step ${i} Info:`, stepInfo);
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, `tour_step_${String(i).padStart(2, '0')}.png`) });
  }

  await browser.close();
  console.log('Tour test completed successfully!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
