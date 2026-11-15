const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to explorer
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });

  await new Promise(r => setTimeout(r, 1000));

  // Take screenshot of explorer
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'current_explorer_state.png')
  });

  console.log('Saved current_explorer_state.png');

  // Check interactive elements
  const targets = await page.evaluate(() => {
    const beacons = Array.from(document.querySelectorAll('.celestial-target-star'));
    return beacons.map(b => ({
      id: b.getAttribute('data-beacon-id'),
      name: b.getAttribute('data-beacon-name'),
      rect: b.getBoundingClientRect()
    }));
  });

  console.log('Targets found:', targets);

  await browser.close();
}

main().catch(console.error);
