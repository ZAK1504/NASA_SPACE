const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('=== STARTING SPHEREx HORIZON FINAL CORRECTIONS AUDIT ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const audit = {
    testA_ExplorerVisual: false,
    testB_EndOfJourneySeamRemoved: false,
    testC_MissionAtlasLayout: false,
    testD_MissionButtonDimensions: false,
    testE_NewLightSweepTransition: false,
    testF_ReturnJourneyRestoration: false,
    testG_DriverJSTutorialCoordination: false,
    mobileCheck: null,
  };

  // 1. Visit Journey at /
  console.log('1. Loading Journey at http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // TEST A: Explorer Visual Check
  console.log('Verifying Test A: Explorer Celestial Window Panorama...');
  const expEl = await page.$('#explorer');
  if (expEl) {
    await expEl.scrollIntoView({ behavior: 'instant' });
    await new Promise(r => setTimeout(r, 600));

    const explorerCheck = await page.evaluate(() => {
      const exp = document.getElementById('explorer');
      const visual = exp ? exp.querySelector('.explorer-showcase-visual') : null;
      const canvas = visual ? visual.querySelector('canvas') : null;
      const beacons = Array.from(exp ? exp.querySelectorAll('[data-beacon-id]') : []);
      const beaconNames = beacons.map(b => b.getAttribute('data-beacon-name'));
      const maskStyle = visual ? window.getComputedStyle(visual.children[1] || visual).maskImage || window.getComputedStyle(visual.children[1] || visual).webkitMaskImage : '';

      return {
        hasVisual: !!visual,
        hasCanvas: !!canvas,
        canvasWidth: canvas ? canvas.width : 0,
        canvasHeight: canvas ? canvas.height : 0,
        beaconCount: beacons.length,
        hasBarnard: beaconNames.includes("Barnard's Star"),
        hasWise: beaconNames.includes("WISE 0855−0714"),
        hasEpsIndi: beaconNames.includes("Epsilon Indi B"),
        hasRDraconis: beaconNames.includes("R Draconis"),
        hasSoftMask: maskStyle.includes('gradient'),
      };
    });
    console.log('Explorer check result:', explorerCheck);

    audit.testA_ExplorerVisual =
      explorerCheck.hasVisual &&
      explorerCheck.hasCanvas &&
      explorerCheck.beaconCount >= 5 &&
      explorerCheck.hasBarnard;

    await page.screenshot({ path: path.join(OUT_DIR, 'verify_01_explorer_panorama.png') });
    console.log('Saved verify_01_explorer_panorama.png');

    // Test hover on "Explore Objects"
    const buttons = await page.$$('#explorer button');
    let objBtn = null;
    let specBtn = null;
    for (const b of buttons) {
      const text = await page.evaluate(el => el.textContent, b);
      if (text.includes('Explore Objects')) objBtn = b;
      if (text.includes('Explore the Spectrum')) specBtn = b;
    }

    if (objBtn) {
      await objBtn.hover();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, 'verify_02_explorer_objects_hover.png') });
      console.log('Saved verify_02_explorer_objects_hover.png');
    }

    if (specBtn) {
      await specBtn.hover();
      await new Promise(r => setTimeout(r, 400));
      await page.screenshot({ path: path.join(OUT_DIR, 'verify_03_explorer_spectral_hover.png') });
      console.log('Saved verify_03_explorer_spectral_hover.png');
    }
  }

  // TEST B: End-of-Journey Seam Removal
  console.log('Verifying Test B: End-of-Journey Background Continuity...');
  const seamCheck = await page.evaluate(() => {
    // Check if the old cutoff transition element is absent
    const oldTransition = document.querySelector('.labs-to-mission-transition');
    const oldAfter = oldTransition ? window.getComputedStyle(oldTransition, '::after').background : '';
    const hasOldCutoff = oldAfter.includes('radial-gradient') && oldAfter.includes('50% 100%');

    // Check ribbon
    const ribbon = document.querySelector('.labs-to-mission-ribbon');

    return {
      hasOldCutoff,
      hasRibbon: !!ribbon,
    };
  });
  console.log('Seam check result:', seamCheck);
  audit.testB_EndOfJourneySeamRemoved = !seamCheck.hasOldCutoff && seamCheck.hasRibbon;

  // Scroll to Labs-to-Mission ribbon and capture screenshot
  const ribbonEl = await page.$('.labs-to-mission-ribbon');
  if (ribbonEl) {
    await ribbonEl.scrollIntoView({ behavior: 'instant' });
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'verify_04_labs_mission_seamless.png') });
    console.log('Saved verify_04_labs_mission_seamless.png');
  }

  // TEST C & D: Mission Atlas Layout & Button Dimensions
  console.log('Verifying Test C & D: Mission Atlas & Button Dimensions...');
  const missionEl = await page.$('#mission');
  if (missionEl) {
    await missionEl.scrollIntoView({ behavior: 'instant' });
    await new Promise(r => setTimeout(r, 600));

    const missionCheck = await page.evaluate(() => {
      const atlas = document.querySelector('.mission-showcase-visual');
      const map = atlas ? atlas.querySelector('.aspect-\\[16\\/9\\], .aspect-\\[16\\/8\\.5\\]') : null;
      // Ensure the target card is NOT inside the map
      const cardInsideMap = map ? map.querySelector('.bg-\\[\\#0A0A10\\]\\/95, .rounded-2xl.border') : null;
      // Target chips
      const chips = Array.from(atlas ? atlas.querySelectorAll('button') : []);
      const chipNames = chips.map(c => c.textContent.trim());

      // Scientific label for Barnard's Star
      const text = atlas ? atlas.textContent : '';
      const hasProperMotionDistinction = text.includes('10.223″ predicted catalogue displacement') && text.includes('10.39″/yr');

      // Buttons
      const missionBtns = Array.from(document.querySelectorAll('#mission button')).filter(b =>
        b.textContent.includes('Begin Your Mission') || b.textContent.includes('Play Mini Game')
      );
      const b1 = missionBtns[0]?.getBoundingClientRect();
      const b2 = missionBtns[1]?.getBoundingClientRect();

      return {
        hasAtlas: !!atlas,
        hasMap: !!map,
        cardInsideMap: !!cardInsideMap,
        chipCount: chips.length,
        hasBarnardChip: chipNames.some(n => n.includes("Barnard's Star")),
        hasWiseChip: chipNames.some(n => n.includes("WISE 0855")),
        hasProperMotionDistinction,
        b1Height: b1 ? Math.round(b1.height) : 0,
        b2Height: b2 ? Math.round(b2.height) : 0,
        b1Width: b1 ? Math.round(b1.width) : 0,
        b2Width: b2 ? Math.round(b2.width) : 0,
      };
    });
    console.log('Mission check result:', missionCheck);

    audit.testC_MissionAtlasLayout =
      missionCheck.hasAtlas &&
      missionCheck.hasMap &&
      !missionCheck.cardInsideMap &&
      missionCheck.hasProperMotionDistinction;

    audit.testD_MissionButtonDimensions =
      missionCheck.b1Height > 0 &&
      missionCheck.b1Height === missionCheck.b2Height &&
      Math.abs(missionCheck.b1Width - missionCheck.b2Width) <= 4;

    await page.screenshot({ path: path.join(OUT_DIR, 'verify_05_mission_layout.png') });
    console.log('Saved verify_05_mission_layout.png');
  }

  // TEST E: New Atmospheric Light-Sweep Transition into Time Machine
  console.log('Verifying Test E: New Light-Sweep Route Transition...');
  // Scroll to Time Machine chapter on Journey
  await page.evaluate(() => {
    const tm = document.getElementById('time-machine');
    if (tm) tm.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  // Find Time Machine CTA
  const tmBtns = await page.$$('#time-machine button');
  let launchBtn = null;
  for (const b of tmBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Launch Time Machine') || text.includes('Rewind the Sky')) {
      launchBtn = b;
      break;
    }
  }

  if (launchBtn) {
    console.log('Clicking "Launch Time Machine" CTA...');
    await launchBtn.click();

    // Catch during transition sweep
    await new Promise(r => setTimeout(r, 220));
    await page.screenshot({ path: path.join(OUT_DIR, 'verify_06_light_sweep_active.png') });
    console.log('Saved verify_06_light_sweep_active.png');

    // Wait for arrival and mount
    await new Promise(r => setTimeout(r, 900));

    const travelCheck = await page.evaluate(() => {
      const url = window.location.pathname;
      const scrollY = window.scrollY;
      const overlay = document.querySelector('div.fixed.z-50');
      return {
        url,
        scrollY,
        atTop: scrollY === 0,
        overlayDissolved: !overlay,
      };
    });
    console.log('Travel check result:', travelCheck);

    audit.testE_NewLightSweepTransition =
      travelCheck.url.includes('/time-machine') &&
      travelCheck.atTop &&
      travelCheck.overlayDissolved;

    await page.screenshot({ path: path.join(OUT_DIR, 'verify_07_workspace_arrived.png') });
    console.log('Saved verify_07_workspace_arrived.png');

    // TEST G: Driver.js Tutorial Coordination
    console.log('Verifying Test G: Driver.js Tutorial Coordination...');
    // Wait for the tutorial entrance timer (1100ms)
    await new Promise(r => setTimeout(r, 600));

    const driverCheck = await page.evaluate(() => {
      const popover = document.querySelector('.driver-popover');
      const title = popover ? popover.querySelector('.driver-popover-title')?.textContent : '';
      const skipBtn = popover ? popover.querySelector('.driver-popover-skip-btn') : null;
      return {
        popoverActive: !!popover,
        title,
        hasSkipBtn: !!skipBtn,
      };
    });
    console.log('Driver.js check result:', driverCheck);
    audit.testG_DriverJSTutorialCoordination = driverCheck.popoverActive;

    // Dismiss tour with skip button
    if (driverCheck.hasSkipBtn) {
      await page.evaluate(() => {
        const btn = document.querySelector('.driver-popover-skip-btn');
        if (btn) btn.click();
      });
      await new Promise(r => setTimeout(r, 300));
    }

    // TEST F: Return to Journey with Light Sweep & Scroll Restoration
    console.log('Verifying Test F: Complementary Return to Journey...');
    const backBtn = await page.$('button[data-tour="workspace-back-button"]');
    if (backBtn) {
      await backBtn.click();
      // Catch reverse sweep
      await new Promise(r => setTimeout(r, 220));
      await page.screenshot({ path: path.join(OUT_DIR, 'verify_08_return_light_sweep.png') });
      console.log('Saved verify_08_return_light_sweep.png');

      // Wait for complete return restoration
      await new Promise(r => setTimeout(r, 900));

      const returnCheck = await page.evaluate(() => {
        const path = window.location.pathname;
        const hash = window.location.hash;
        const scrollY = window.scrollY;
        return {
          path,
          hash,
          scrollY,
          isJourneyPath: path === '/' || path === '',
          isTimeMachineHash: hash === '#time-machine',
          hasRestoredScroll: scrollY > 1000,
        };
      });
      console.log('Return check result:', returnCheck);

      audit.testF_ReturnJourneyRestoration =
        returnCheck.isJourneyPath &&
        returnCheck.isTimeMachineHash &&
        returnCheck.hasRestoredScroll;

      await page.screenshot({ path: path.join(OUT_DIR, 'verify_09_journey_restored.png') });
      console.log('Saved verify_09_journey_restored.png');
    }
  }

  // Mobile Viewport Check (390 x 844)
  console.log('Verifying Mobile Viewport Responsiveness (390 x 844)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.evaluate(() => window.scrollTo(0, 0));
  await new Promise(r => setTimeout(r, 500));

  const mobileCheck = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Mobile check result:', mobileCheck);
  audit.mobileCheck = mobileCheck;

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_verify_explorer.png') });
  console.log('Saved mobile_verify_explorer.png');

  // Save summary JSON
  fs.writeFileSync(
    path.join(OUT_DIR, 'final_corrections_audit_summary.json'),
    JSON.stringify(audit, null, 2)
  );
  console.log('Saved final_corrections_audit_summary.json');

  await browser.close();
  console.log('=== VERIFICATION COMPLETED SUCCESSFULLY ===');
}

runVerification().catch(err => {
  console.error('Audit failed with error:', err);
  process.exit(1);
});
