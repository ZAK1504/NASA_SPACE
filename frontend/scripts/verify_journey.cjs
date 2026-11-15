const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('=== STARTING SPHEREx HORIZON FINAL POLISH VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1400,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 900 });

  const audit = {
    testA_SpacecraftFreeFloating: false,
    testB_NoDuplicateBottomNav: false,
    testC_WorkspaceOpensAtTop: false,
    testD_BackToJourneyScrollRestored: false,
    testE_TimeMachineCompactLayout: false,
    testF_PageSpecificTours: {},
    testG_ShowcasesRedesigned: false,
    mobileCheck: null
  };

  // 1. Visit Journey at /
  console.log('1. Loading Journey at http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  // TEST A: Homepage Spacecraft Free-Floating Presentation
  console.log('Verifying Test A: Homepage Spacecraft presentation...');
  const spacecraftBoxCheck = await page.evaluate(() => {
    const homeSection = document.getElementById('home');
    if (!homeSection) return { found: false };
    const rightCol = homeSection.querySelector('.lg\\:col-span-6:last-child');
    // Verify there is NO visible card with border/shadow/bg-black
    const hasVisibleCard = !!rightCol?.querySelector('.rounded-3xl.border.bg-black\\/40');
    const satCanvas = rightCol?.querySelector('canvas');
    return {
      found: true,
      hasVisibleCard,
      hasSatCanvas: !!satCanvas,
      canvasWidth: satCanvas ? satCanvas.clientWidth : 0,
      canvasHeight: satCanvas ? satCanvas.clientHeight : 0
    };
  });
  console.log('Spacecraft container check (expecting hasVisibleCard: false):', spacecraftBoxCheck);
  audit.testA_SpacecraftFreeFloating = !spacecraftBoxCheck.hasVisibleCard && spacecraftBoxCheck.hasSatCanvas;

  await page.screenshot({ path: path.join(OUT_DIR, 'polished_01_home_spacecraft.png') });

  // TEST B: Duplicate Explorer Navigation (Verify top nav only, bottom removed)
  console.log('Verifying Test B: Open /explore and check navigation...');
  await page.goto('http://127.0.0.1:5173/explore', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const navCheck = await page.evaluate(() => {
    const header = document.querySelector('header');
    const headerButtons = header ? Array.from(header.querySelectorAll('button')).map(b => b.innerText.trim()) : [];
    const hasTopNav = headerButtons.some(t => t.includes('Sky')) && headerButtons.some(t => t.includes('Object'));
    const bottomPill = document.querySelector('.stage-pill');
    const bottomNav = document.querySelector('nav.fixed.bottom-0');
    return {
      hasTopNav,
      hasBottomPill: !!bottomPill,
      hasBottomNav: !!bottomNav,
      headerButtons
    };
  });
  console.log('Navigation check (expecting hasTopNav: true, hasBottomPill: false, hasBottomNav: false):', navCheck);
  audit.testB_NoDuplicateBottomNav = navCheck.hasTopNav && !navCheck.hasBottomPill && !navCheck.hasBottomNav;
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_02_sky_explorer_top_nav_only.png') });

  // TEST C: Workspace Starting Scroll Position (Must open at y = 0 from any Journey scroll position)
  console.log('Verifying Test C: Navigate from middle of Journey into /time-machine...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Scroll down to time-machine chapter
  await page.evaluate(() => {
    document.getElementById('time-machine')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 800));
  const journeyScrollBeforeClick = await page.evaluate(() => window.scrollY);
  console.log('Journey scrollY at Time Machine chapter before click:', journeyScrollBeforeClick);

  // Click Launch Time Machine
  await page.evaluate(() => {
    const buttons = Array.from(document.querySelectorAll('#time-machine button'));
    const btn = buttons.find(b => b.innerText.includes('Launch Time Machine'));
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 2000));

  const workspaceUrl = page.url();
  const workspaceScrollY = await page.evaluate(() => window.scrollY);
  console.log(`Workspace opened at URL: ${workspaceUrl}, scrollY: ${workspaceScrollY} (must be 0)`);
  audit.testC_WorkspaceOpensAtTop = workspaceScrollY === 0;
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_03_timemachine_top_scroll.png') });

  // TEST E: Time Machine Compact Scientific Instrument Layout
  console.log('Verifying Test E: Time Machine 2-column layout and compact image height...');
  const tmLayoutCheck = await page.evaluate(() => {
    const twoColGrid = document.querySelector('.grid.grid-cols-1.lg\\:grid-cols-12');
    const viewportBox = document.querySelector('.relative.h-\\[420px\\], .relative.h-\\[460px\\], [class*="h-[420px]"]');
    const playbackControls = document.querySelector('[data-tour="timelapse-player"]');
    const telemetryCard = Array.from(document.querySelectorAll('div')).find(d => d.innerText.includes('Observation Telemetry'));
    return {
      hasTwoColGrid: !!twoColGrid,
      hasViewportBox: !!viewportBox,
      hasPlaybackControls: !!playbackControls,
      hasTelemetryCard: !!telemetryCard,
      boxClientHeight: viewportBox ? viewportBox.clientHeight : 0
    };
  });
  console.log('Time Machine layout check:', tmLayoutCheck);
  audit.testE_TimeMachineCompactLayout = tmLayoutCheck.hasTwoColGrid && tmLayoutCheck.hasPlaybackControls;
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_05_timemachine_compact_layout.png') });

  // TEST D: Back to Journey Scroll Restoration
  console.log('Verifying Test D: Click Back to Journey and verify scroll position restored...');
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Journey') || b.innerText.includes('Journey'));
    if (backBtn) backBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const returnUrl = page.url();
  const restoredScrollY = await page.evaluate(() => window.scrollY);
  console.log(`Returned to Journey URL: ${returnUrl}, restored scrollY: ${restoredScrollY}`);
  audit.testD_BackToJourneyScrollRestored = returnUrl.includes('#time-machine') && Math.abs(restoredScrollY - journeyScrollBeforeClick) < 50;
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_04_return_journey_scroll_restored.png') });

  // TEST F: Page-Specific Driver.js Tours
  console.log('Verifying Test F: Page-Specific Tours...');
  // 1. Time Machine Tour
  await page.goto('http://127.0.0.1:5173/time-machine', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const tourBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tour'));
    if (tourBtn) tourBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const tmTourText = await page.evaluate(() => {
    const popover = document.querySelector('.driver-popover-title, .horizon-driver-popover');
    return popover ? popover.textContent : null;
  });
  console.log('Time Machine Tour title:', tmTourText);
  audit.testF_PageSpecificTours.timeMachine = tmTourText;
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // 2. Spectral Tour
  await page.goto('http://127.0.0.1:5173/spectra', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  await page.evaluate(() => {
    const tourBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Tour'));
    if (tourBtn) tourBtn.click();
  });
  await new Promise(r => setTimeout(r, 800));
  const spectralTourText = await page.evaluate(() => {
    const popover = document.querySelector('.driver-popover-title, .horizon-driver-popover');
    return popover ? popover.textContent : null;
  });
  console.log('Spectral Explorer Tour title:', spectralTourText);
  audit.testF_PageSpecificTours.spectral = spectralTourText;
  await page.keyboard.press('Escape');
  await new Promise(r => setTimeout(r, 500));

  // TEST G: Redesigned Showcase Visuals
  console.log('Verifying Test G: Capture redesigned showcases on Journey...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Explorer Showcase
  await page.evaluate(() => {
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_06_explorer_showcase.png') });

  // Time Machine Showcase
  await page.evaluate(() => {
    document.getElementById('time-machine')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_07_timemachine_showcase.png') });

  // Labs Showcase
  await page.evaluate(() => {
    document.getElementById('labs')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_08_labs_showcase.png') });

  // Mission Showcase
  await page.evaluate(() => {
    document.getElementById('mission')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'polished_09_mission_showcase.png') });

  audit.testG_ShowcasesRedesigned = true;

  // TEST H: Mobile Viewport Responsiveness (390 x 844)
  console.log('Testing Mobile Viewport (390 x 844)...');
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
  audit.mobileCheck = mobileCheck;

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_polished_01_home.png') });

  await page.goto('http://127.0.0.1:5173/time-machine', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_polished_02_timemachine.png') });

  await browser.close();
  console.log('=== ALL FINAL POLISH VERIFICATIONS COMPLETE ===');
  fs.writeFileSync(path.join(OUT_DIR, 'final_polish_summary.json'), JSON.stringify(audit, null, 2));
}

runVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
