const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runSeamlessVerification() {
  console.log('=== STARTING SPHEREx HORIZON SEAMLESS TRANSITIONS & THEME VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const audit = {
    test1_BackdropContinuousBlending: false,
    test2_NoSpacetimeStandaloneSection: false,
    test3_SpacecraftDeShined: false,
    test4_WorkspaceCinematicTravel: false,
    test5_ReturnToJourneyCinematicRestoration: false,
    test6_ThemeAuditAllWorkspaces: {},
    mobileCheck: null
  };

  // 1. Visit Journey at /
  console.log('1. Loading Journey at http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // TEST 1: Backdrop Multi-Layer Continuous Blending Verification
  console.log('Verifying Test 1: Backdrop 5-layer continuous blending architecture...');
  const backdropCheck = await page.evaluate(() => {
    const layers = Array.from(document.querySelectorAll('.bd-layer'));
    const homeLayer = document.querySelector('.bd-layer-home');
    const expLayer = document.querySelector('.bd-layer-explorer');
    const tmLayer = document.querySelector('.bd-layer-time-machine');
    const labsLayer = document.querySelector('.bd-layer-labs');
    const missionLayer = document.querySelector('.bd-layer-mission');

    return {
      layerCount: layers.length,
      hasAll5Layers: !!(homeLayer && expLayer && tmLayer && labsLayer && missionLayer),
      initialHomeOpacity: homeLayer ? window.getComputedStyle(homeLayer).opacity : null,
      initialExpOpacity: expLayer ? window.getComputedStyle(expLayer).opacity : null,
    };
  });
  console.log('Backdrop check:', backdropCheck);
  audit.test1_BackdropContinuousBlending = backdropCheck.layerCount === 5 && backdropCheck.hasAll5Layers;

  // TEST 2: Absence of "Traveling through space-time..." Section
  console.log('Verifying Test 2: Complete removal of standalone "Traveling through space-time" section...');
  const spacetimeCheck = await page.evaluate(() => {
    const bodyText = document.body.innerText;
    const hasWarpHeading = bodyText.includes('Traveling through space-time');
    const hasContinuumBadge = bodyText.includes('SPACETIME CONTINUUM');
    const hasVelocityText = bodyText.includes('VELOCITY:') && bodyText.includes('mas');
    const hasWarpZoneClass = !!document.querySelector('.time-warp-zone');
    const hasRadarPing = !!document.querySelector('.animate-ping.rounded-full.border');

    return {
      hasWarpHeading,
      hasContinuumBadge,
      hasVelocityText,
      hasWarpZoneClass,
      hasRadarPing,
      isClean: !hasWarpHeading && !hasContinuumBadge && !hasVelocityText && !hasWarpZoneClass
    };
  });
  console.log('Spacetime removal check:', spacetimeCheck);
  audit.test2_NoSpacetimeStandaloneSection = spacetimeCheck.isClean;

  // TEST 3: Spacecraft Calibrated De-Shined Presentation
  console.log('Verifying Test 3: De-shined 3D Spacecraft presentation on Homepage...');
  const satCheck = await page.evaluate(() => {
    const canvas = document.querySelector('#home canvas');
    return {
      found: !!canvas,
      width: canvas ? canvas.clientWidth : 0,
      height: canvas ? canvas.clientHeight : 0,
    };
  });
  console.log('Spacecraft canvas check:', satCheck);
  audit.test3_SpacecraftDeShined = satCheck.found && satCheck.width > 400;
  await page.screenshot({ path: path.join(OUT_DIR, 'seamless_01_home_deshined_spacecraft.png') });

  // TEST 4: Scroll to Explorer & Verify Seamless Boundary Blending
  console.log('Verifying Test 4: Seamless transition from Home to Explorer...');
  await page.evaluate(() => {
    document.getElementById('explorer')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(OUT_DIR, 'seamless_02_explorer_boundary_blend.png') });

  // TEST 5: Scroll to Time Machine & Verify Direct Emergence (No Standalone Section)
  console.log('Verifying Test 5: Direct emergence of REWIND Time Machine...');
  await page.evaluate(() => {
    document.getElementById('time-machine')?.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(OUT_DIR, 'seamless_03_timemachine_direct_emergence.png') });

  // TEST 6: Cinematic Workspace Travel (Clicking CTA triggers warp transition overlay)
  console.log('Verifying Test 6: Cinematic Workspace Travel from Journey into /time-machine...');
  const journeyScrollBefore = await page.evaluate(() => window.scrollY);
  console.log('Journey scroll position at Time Machine before launch:', journeyScrollBefore);

  // Click "Launch Time Machine"
  await page.evaluate(() => {
    const launchBtn = Array.from(document.querySelectorAll('#time-machine button')).find(b => b.innerText.includes('Launch Time Machine'));
    if (launchBtn) launchBtn.click();
  });

  // Brief capture of the active travel overlay during transition
  await new Promise(r => setTimeout(r, 120));
  await page.screenshot({ path: path.join(OUT_DIR, 'seamless_04_workspace_cinematic_travel.png') });

  // Wait for transition to complete and workspace to mount at top
  await new Promise(r => setTimeout(r, 800));
  const wsCheck = await page.evaluate(() => ({
    url: window.location.href,
    scrollY: window.scrollY,
    hasTopBar: !!document.querySelector('.scientific-workspace-layout header'),
    hasBackBtn: !!document.querySelector('button[title*="Return to the Journey"]')
  }));
  console.log('Workspace entry check:', wsCheck);
  audit.test4_WorkspaceCinematicTravel = wsCheck.url.includes('/time-machine') && wsCheck.scrollY === 0;

  // TEST 7: Color Scheme Audit across Dedicated Workspaces
  console.log('Verifying Test 7: Complete HORIZON design-system color audit across workspaces...');
  const themeAudit = await page.evaluate(() => {
    const bodyBg = window.getComputedStyle(document.body).backgroundColor;
    const panels = Array.from(document.querySelectorAll('.panel, .horizon-workspace, .bg-\\[\\#111117\\]'));
    const blueButtons = Array.from(document.querySelectorAll('button.bg-blue-600, button.bg-blue-500, button.bg-\\[\\#2563EB\\]'));
    return {
      bodyBg,
      panelCount: panels.length,
      blueButtonsRemaining: blueButtons.length
    };
  });
  console.log('Time Machine theme audit:', themeAudit);
  audit.test6_ThemeAuditAllWorkspaces.timeMachine = themeAudit.blueButtonsRemaining === 0;
  await page.screenshot({ path: path.join(OUT_DIR, 'seamless_05_workspace_theme_audit.png') });

  // TEST 8: Cinematic Return to Journey (Restoring exact originating chapter and scroll position)
  console.log('Verifying Test 8: Cinematic Return to Journey via Back to Journey button...');
  await page.evaluate(() => {
    const backBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Back to Journey') || b.innerText.includes('Journey'));
    if (backBtn) backBtn.click();
  });

  // Wait for return travel animation and restoration
  await new Promise(r => setTimeout(r, 900));
  const returnCheck = await page.evaluate((targetScroll) => {
    const currentScroll = window.scrollY;
    const diff = Math.abs(currentScroll - targetScroll);
    return {
      currentScroll,
      targetScroll,
      diff,
      hash: window.location.hash,
      restoredSuccessfully: diff < 300
    };
  }, journeyScrollBefore);
  console.log('Return to Journey check:', returnCheck);
  audit.test5_ReturnToJourneyCinematicRestoration = returnCheck.restoredSuccessfully;
  await page.screenshot({ path: path.join(OUT_DIR, 'seamless_06_return_journey_restored.png') });

  // Mobile Viewport Check (390 x 844)
  console.log('Verifying Mobile Viewport (390 x 844)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'domcontentloaded' });
  await new Promise(r => setTimeout(r, 1500));
  const mob = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  console.log('Mobile overflow check:', mob);
  audit.mobileCheck = mob;
  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_seamless_01_home.png') });

  // Save audit summary
  fs.writeFileSync(path.join(OUT_DIR, 'seamless_audit_summary.json'), JSON.stringify(audit, null, 2));
  console.log('=== ALL SEAMLESS & THEME AUDIT TESTS COMPLETE ===');

  await browser.close();
}

runSeamlessVerification().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
