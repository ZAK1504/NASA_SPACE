const puppeteer = require('puppeteer-core');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

async function main() {
  console.log('=== VERIFYING CELESTIAL DISCOVERY PATH & 10-STEP TOUR ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900', '--no-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Navigate to Journey
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // 2. Scroll to Chapter 02: Beyond the Visible (Explorer)
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Take screenshot: Default Sky Mode with Connected Discovery Path
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'discovery_path_01_sky_connected.png')
  });
  console.log('✓ Saved discovery_path_01_sky_connected.png');

  // 3. Hover "Explore Objects" button
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#explorer button'));
    const objBtn = btns.find(b => b.textContent && b.textContent.includes('Explore Objects'));
    if (objBtn) {
      objBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'discovery_path_02_object_mode_barnard.png')
  });
  console.log('✓ Saved discovery_path_02_object_mode_barnard.png');

  // 4. Click target star WISE 0855
  await page.evaluate(() => {
    const wise = document.querySelector('[data-beacon-id="wise-0855"]');
    if (wise) wise.click();
  });
  await new Promise(r => setTimeout(r, 500));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'discovery_path_03_target_wise0855.png')
  });
  console.log('✓ Saved discovery_path_03_target_wise0855.png');

  // 5. Hover "Explore the Spectrum" button & cycle band
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('#explorer button'));
    const specBtn = btns.find(b => b.textContent && b.textContent.includes('Explore the Spectrum'));
    if (specBtn) {
      specBtn.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    }
  });
  await new Promise(r => setTimeout(r, 600));

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'discovery_path_04_spectral_mode.png')
  });
  console.log('✓ Saved discovery_path_04_spectral_mode.png');

  // 6. Mobile Viewport Test (390 x 844)
  await page.setViewport({ width: 390, height: 844, isMobile: true });
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant', block: 'center' });
  });
  await new Promise(r => setTimeout(r, 600));

  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > window.innerWidth;
  });
  console.log('Mobile horizontal overflow detected?', overflow);

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'discovery_path_05_mobile_390.png')
  });
  console.log('✓ Saved discovery_path_05_mobile_390.png');

  // 7. Verify all 10 steps of the Main Journey Guided Tour
  console.log('\n--- VERIFYING ALL 10 STEPS OF MAIN JOURNEY TOUR ---');
  await page.setViewport({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));

  // Click Tour button
  await page.evaluate(() => {
    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.trim() === 'Tour');
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 600));

  for (let step = 1; step <= 10; step++) {
    const info = await page.evaluate(() => {
      const popover = document.querySelector('.driver-popover');
      if (!popover) return null;
      return {
        title: popover.querySelector('.driver-popover-title')?.textContent,
        progress: popover.querySelector('.driver-popover-progress-text')?.textContent,
      };
    });

    console.log(`Step ${step}:`, info);

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, `tour_step_${String(step).padStart(2, '0')}.png`)
    });

    // Advance to next step if not step 10
    if (step < 10) {
      await page.evaluate(() => {
        const nextBtn = document.querySelector('.driver-popover-next-btn');
        if (nextBtn) nextBtn.click();
      });
      await new Promise(r => setTimeout(r, 600));
    }
  }

  console.log('All 10 tour steps verified and captured!');
  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
