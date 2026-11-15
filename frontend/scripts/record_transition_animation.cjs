const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const FRAMES_DIR = path.join(ARTIFACTS_DIR, 'transition_movie_frames');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

if (!fs.existsSync(FRAMES_DIR)) {
  fs.mkdirSync(FRAMES_DIR, { recursive: true });
}

async function main() {
  console.log('Starting high-speed frame recording for animated transition...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1280,720'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 720 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  // Scroll to Labs
  await page.evaluate(() => {
    const el = document.getElementById('labs');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  // 1. Record Enter Transition (Labs -> Discovery Lab)
  console.log('Recording enter transition frames...');
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Enter Discovery Lab'));
    if (btn) btn.click();
  });

  const enterFrames = [];
  const startTime = Date.now();
  let frameCount = 0;
  while (Date.now() - startTime < 750) {
    const frameFile = path.join(FRAMES_DIR, `enter_frame_${String(frameCount).padStart(3, '0')}.png`);
    await page.screenshot({ path: frameFile });
    enterFrames.push(frameFile);
    frameCount++;
    await new Promise(r => setTimeout(r, 35));
  }
  console.log(`Captured ${frameCount} enter transition frames.`);

  await new Promise(r => setTimeout(r, 500));

  // 2. Record Return Transition (Discovery Lab -> Back to Journey)
  console.log('Recording return transition frames...');
  await page.evaluate(() => {
    const backBtn = document.querySelector('button[data-action="back-to-journey"]');
    if (backBtn) backBtn.click();
  });

  const returnFrames = [];
  const returnStartTime = Date.now();
  let returnFrameCount = 0;
  while (Date.now() - returnStartTime < 750) {
    const frameFile = path.join(FRAMES_DIR, `return_frame_${String(returnFrameCount).padStart(3, '0')}.png`);
    await page.screenshot({ path: frameFile });
    returnFrames.push(frameFile);
    returnFrameCount++;
    await new Promise(r => setTimeout(r, 35));
  }
  console.log(`Captured ${returnFrameCount} return transition frames.`);

  await browser.close();
  console.log('Frame capture completed!');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
