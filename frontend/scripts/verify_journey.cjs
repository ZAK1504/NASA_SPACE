const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('--- STARTING HORIZON JOURNEY & WORKSPACE VERIFICATION ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const results = {
    chaptersFound: [],
    navigatorButtons: [],
    roundTripTests: [],
    mobileOverflow: null
  };

  // 1. Visit Journey at /
  console.log('1. Loading Journey at http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // Verify 5 chapters
  const chapters = await page.evaluate(() => {
    return ['home', 'explorer', 'time-machine', 'labs', 'mission'].map(id => {
      const el = document.getElementById(id);
      return { id, exists: !!el, offsetTop: el ? el.offsetTop : null };
    });
  });
  results.chaptersFound = chapters;
  console.log('Chapters found on Journey:', chapters);

  // Check ChapterNavigator
  const navItems = await page.evaluate(() => {
    const nav = document.querySelector('aside') || document.querySelector('[aria-label="Chapter navigation"]');
    if (!nav) return [];
    return Array.from(nav.querySelectorAll('button')).map(b => b.innerText.replace(/\n/g, ' '));
  });
  results.navigatorButtons = navItems;
  console.log('ChapterNavigator items:', navItems);

  // 2. Capture Showcase Screenshots
  console.log('Capturing Chapter 01 (Home)...');
  await page.screenshot({ path: path.join(OUT_DIR, 'journey_01_home.png') });

  console.log('Capturing Chapter 02 (Explorer)...');
  await page.evaluate(() => {
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'journey_02_explorer.png') });

  console.log('Capturing Chapter 03 (Time Machine)...');
  await page.evaluate(() => {
    document.getElementById('time-machine')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'journey_03_timemachine.png') });

  console.log('Capturing Chapter 04 (Labs)...');
  await page.evaluate(() => {
    document.getElementById('labs')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'journey_04_labs.png') });

  console.log('Capturing Chapter 05 (Mission)...');
  await page.evaluate(() => {
    document.getElementById('mission')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(OUT_DIR, 'journey_05_mission.png') });

  // 3. Test Round-Trip: Explorer -> Spectra Workspace -> Back to Journey
  console.log('Testing round-trip: Explorer -> Spectra...');
  // Scroll back to explorer
  await page.evaluate(() => {
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Click on "Explore the Spectrum"
  const clickedSpectra = await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#explorer button'));
    const btn = buttons.find(b => b.innerText.includes('Explore the Spectrum'));
    if (btn) {
      btn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked Explore the Spectrum button:', clickedSpectra);
  await new Promise(r => setTimeout(r, 2000));

  const spectraUrl = page.url();
  console.log('Current URL after click:', spectraUrl);
  await page.screenshot({ path: path.join(OUT_DIR, 'workspace_01_spectra.png') });

  // Check workspace layout elements
  const spectraCheck = await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Journey'));
    const bottomPill = document.querySelector('.stage-pill');
    return {
      hasBackButton: !!backBtn,
      hasBottomPill: !!bottomPill,
      bottomPillItems: bottomPill ? Array.from(bottomPill.querySelectorAll('button')).map(b => b.innerText) : []
    };
  });
  console.log('Spectra Workspace verification:', spectraCheck);

  // Click Back to Journey
  console.log('Clicking Back to Journey...');
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Journey'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const returnUrl = page.url();
  const returnedScrollY = await page.evaluate(() => window.scrollY);
  console.log(`Returned URL: ${returnUrl}, scrollY: ${returnedScrollY}`);
  await page.screenshot({ path: path.join(OUT_DIR, 'journey_return_explorer.png') });

  results.roundTripTests.push({
    target: 'spectra',
    workspaceUrl: spectraUrl,
    hasBackButton: spectraCheck.hasBackButton,
    hasBottomNav: spectraCheck.hasBottomNav,
    returnedUrl: returnUrl,
    restoredScrollY: returnedScrollY
  });

  // 4. Test Round-Trip: Time Machine -> Workspace -> Back to Journey
  console.log('Testing round-trip: Time Machine...');
  await page.evaluate(() => {
    document.getElementById('time-machine')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));

  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#time-machine button'));
    const btn = buttons.find(b => b.innerText.includes('Launch Time Machine'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const tmUrl = page.url();
  console.log('Time Machine Workspace URL:', tmUrl);
  await page.screenshot({ path: path.join(OUT_DIR, 'workspace_02_timemachine.png') });

  const tmCheck = await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Journey'));
    // Time machine should NOT have bottom navigation
    const bottomPill = document.querySelector('.stage-pill');
    return {
      hasBackButton: !!backBtn,
      hasBottomPill: !!bottomPill
    };
  });
  console.log('Time Machine Workspace verification (expecting hasBottomPill === false):', tmCheck);

  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Journey'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Returned after TM, URL:', page.url(), 'scrollY:', await page.evaluate(() => window.scrollY));

  results.roundTripTests.push({
    target: 'time-machine',
    workspaceUrl: tmUrl,
    hasBackButton: tmCheck.hasBackButton,
    hasBottomTabs: tmCheck.hasBottomTabs,
    returnedUrl: page.url()
  });

  // 5. Mobile Viewport Check (390 x 844)
  console.log('Testing Mobile Viewport (390x844)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const mobileCheck = await page.evaluate(() => {
    const scrollW = document.documentElement.scrollWidth;
    const clientW = document.documentElement.clientWidth;
    return {
      scrollWidth: scrollW,
      clientWidth: clientW,
      hasOverflow: scrollW > clientW
    };
  });
  console.log('Mobile overflow check:', mobileCheck);
  results.mobileOverflow = mobileCheck;

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_journey_01_home.png') });

  await page.evaluate(() => {
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_journey_02_explorer.png') });

  await page.evaluate(() => {
    document.getElementById('time-machine')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_journey_03_timemachine.png') });

  await browser.close();
  console.log('--- ALL VERIFICATIONS COMPLETE ---');
  fs.writeFileSync(path.join(OUT_DIR, 'verification_summary.json'), JSON.stringify(results, null, 2));
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
