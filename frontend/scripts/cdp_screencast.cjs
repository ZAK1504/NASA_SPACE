const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const FRAMES_DIR = path.join(ARTIFACTS_DIR, 'transition_movie_frames');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1280,720'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 600));

  await page.evaluate(() => {
    const el = document.getElementById('labs');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 500));

  const client = await page.target().createCDPSession();
  const frames = [];

  client.on('Page.screencastFrame', async ({ data, sessionId }) => {
    frames.push(Buffer.from(data, 'base64'));
    await client.send('Page.screencastFrameAck', { sessionId });
  });

  console.log('Starting CDP screencast...');
  await client.send('Page.startScreencast', { format: 'png', quality: 90, everyNthFrame: 1 });

  // Trigger enter transition
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Enter Discovery Lab'));
    if (btn) btn.click();
  });

  // Record for 750ms
  await new Promise(r => setTimeout(r, 750));
  await client.send('Page.stopScreencast');

  console.log(`Captured ${frames.length} frames via CDP screencast!`);
  for (let i = 0; i < frames.length; i++) {
    fs.writeFileSync(path.join(FRAMES_DIR, `screencast_enter_${String(i).padStart(3, '0')}.png`), frames[i]);
  }

  // Now screencast the return transition
  frames.length = 0;
  console.log('Starting return screencast...');
  await client.send('Page.startScreencast', { format: 'png', quality: 90, everyNthFrame: 1 });

  await page.evaluate(() => {
    const backBtn = document.querySelector('button[data-action="back-to-journey"]');
    if (backBtn) backBtn.click();
  });

  await new Promise(r => setTimeout(r, 750));
  await client.send('Page.stopScreencast');

  console.log(`Captured ${frames.length} return frames via CDP screencast!`);
  for (let i = 0; i < frames.length; i++) {
    fs.writeFileSync(path.join(FRAMES_DIR, `screencast_return_${String(i).padStart(3, '0')}.png`), frames[i]);
  }

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
