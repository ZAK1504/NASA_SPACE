const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const OUT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function runVerification() {
  console.log('=== STARTING SPHEREx HORIZON FINAL 3D SPHERE, RIBBONS & TOUR VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: 'new',
    args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const audit = {
    test1_3DCelestialSphere: false,
    test2_FourSnakeRibbons: false,
    test3_ChapterWorkspaceTravel: false,
    test4_DriverAutomaticOnboarding: false,
    test5_DriverManualReplay: false,
    test6_LosslessJourneyReturn: false,
    mobileCheck: null
  };

  // 1. Visit Journey at /
  console.log('1. Loading Journey at http://127.0.0.1:5173/ ...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // TEST 1: Four Inter-Chapter Snake Ribbons in Document Flow
  console.log('Verifying Test 1: Four Inter-Chapter Snake Ribbons...');
  const ribbonsCheck = await page.evaluate(() => {
    const r1 = document.querySelector('.home-to-explorer-ribbon');
    const r2 = document.querySelector('.explorer-to-timemachine-ribbon');
    const r3 = document.querySelector('.timemachine-to-labs-ribbon');
    const r4 = document.querySelector('.labs-to-mission-ribbon');

    const text1 = r1?.querySelector('textPath')?.textContent || '';
    const text2 = r2?.querySelector('textPath')?.textContent || '';
    const text3 = r3?.querySelector('textPath')?.textContent || '';
    const text4 = r4?.querySelector('textPath')?.textContent || '';

    const svgs = document.querySelectorAll('.snake-ribbon-svg');

    return {
      allFourMounted: !!(r1 && r2 && r3 && r4),
      svgCount: svgs.length,
      r1HasExploreText: text1.includes("LET'S EXPLORE"),
      r2HasSpaceTimeText: text2.includes("THROUGH SPACE & TIME"),
      r3HasChangeStoryText: text3.includes("EVERY CHANGE TELLS A STORY"),
      r4HasDiscoveryText: text4.includes("YOUR DISCOVERY BEGINS"),
    };
  });
  console.log('Ribbons check result:', ribbonsCheck);
  audit.test2_FourSnakeRibbons = ribbonsCheck.allFourMounted && ribbonsCheck.svgCount === 4;

  // Capture Screenshot of Home -> Explorer Ribbon
  const r1Elem = await page.$('.home-to-explorer-ribbon');
  if (r1Elem) {
    await r1Elem.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'final_03_ribbon_home_to_explorer.png') });
    console.log('Saved final_03_ribbon_home_to_explorer.png');
  }

  // TEST 2: 3D Celestial Explorer Sphere
  console.log('Verifying Test 2: 3D Celestial Explorer Sphere...');
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 1200));

  const sphereCheck = await page.evaluate(() => {
    const exp = document.getElementById('explorer');
    const canvases = exp ? exp.querySelectorAll('canvas') : [];
    let threeCanvas = null;
    canvases.forEach(c => {
      const rect = c.getBoundingClientRect();
      if (rect.width > 300 && rect.height > 300) {
        threeCanvas = { width: rect.width, height: rect.height };
      }
    });

    // Check for target beacons
    const beaconNodes = Array.from(exp ? exp.querySelectorAll('.celestial-beacon, [data-beacon-tag]') : []);
    const targetTags = beaconNodes
      .map(g => g.textContent?.trim())
      .filter(Boolean);

    const hasBarnard = targetTags.some(t => t.includes("Barnard's Star"));
    const hasWise = targetTags.some(t => t.includes("WISE 0855"));
    const hasEpsIndi = targetTags.some(t => t.includes("Epsilon Indi B"));
    const hasRDra = targetTags.some(t => t.includes("R Draconis"));

    return {
      canvasFound: !!threeCanvas,
      canvasDimensions: threeCanvas,
      targetTagsCount: targetTags.length,
      hasBarnard,
      hasWise,
      hasEpsIndi,
      hasRDra,
    };
  });
  console.log('3D Sphere check result:', sphereCheck);
  audit.test1_3DCelestialSphere = sphereCheck.canvasFound && (sphereCheck.hasBarnard || sphereCheck.hasRDra || sphereCheck.hasWise);

  await page.screenshot({ path: path.join(OUT_DIR, 'final_01_explorer_3d_sphere.png') });
  console.log('Saved final_01_explorer_3d_sphere.png');

  // Test Hover Action Preview: Hover "Explore the Spectrum"
  console.log('Testing Explorer action hover preview...');
  const buttons = await page.$$('#explorer button');
  let spectralBtn = null;
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Explore the Spectrum')) {
      spectralBtn = b;
      break;
    }
  }

  if (spectralBtn) {
    await spectralBtn.hover();
    await new Promise(r => setTimeout(r, 600));

    const spectralPreviewCheck = await page.evaluate(() => {
      const exp = document.getElementById('explorer');
      return {
        hasWavelengthBadge: exp ? exp.textContent.includes('0.75 μm') || exp.textContent.includes('Array 1') : false,
      };
    });
    console.log('Spectral preview check:', spectralPreviewCheck);

    await page.screenshot({ path: path.join(OUT_DIR, 'final_02_explorer_spectral_preview.png') });
    console.log('Saved final_02_explorer_spectral_preview.png');
  }

  // Capture Explorer -> Time Machine Ribbon
  const r2Elem = await page.$('.explorer-to-timemachine-ribbon');
  if (r2Elem) {
    await r2Elem.scrollIntoView();
    await new Promise(r => setTimeout(r, 400));
    await page.screenshot({ path: path.join(OUT_DIR, 'final_04_ribbon_explorer_to_timemachine.png') });
    console.log('Saved final_04_ribbon_explorer_to_timemachine.png');
  }

  // TEST 3: Cinematic Workspace Travel to Time Machine
  console.log('Verifying Test 3: Cinematic Workspace Travel into Time Machine...');
  await page.evaluate(() => {
    const tm = document.getElementById('time-machine');
    if (tm) tm.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  // Find and click "Launch Time Machine"
  const tmButtons = await page.$$('#time-machine button');
  let launchTmBtn = null;
  for (const b of tmButtons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Launch Time Machine')) {
      launchTmBtn = b;
      break;
    }
  }

  if (launchTmBtn) {
    console.log('Clicking "Launch Time Machine" CTA...');
    await launchTmBtn.click();
    // Wait for travel animation (~950ms) to complete and destination to mount
    await new Promise(r => setTimeout(r, 1200));

    const travelCheck = await page.evaluate(() => {
      return {
        url: window.location.pathname,
        scrollY: window.scrollY,
        atTop: window.scrollY === 0,
      };
    });
    console.log('Travel check result:', travelCheck);
    audit.test3_ChapterWorkspaceTravel = (travelCheck.url === '/time-machine' || travelCheck.url === '/time') && travelCheck.atTop;

    await page.screenshot({ path: path.join(OUT_DIR, 'final_05_workspace_travel_time_machine.png') });
    console.log('Saved final_05_workspace_travel_time_machine.png');
  }

  // TEST 4: Automatic Driver.js Onboarding in Time Machine Workspace
  console.log('Verifying Test 4: Driver.js Automatic Onboarding & Real Component Spotlighting...');
  // Wait another 600ms for auto-tour trigger (~1100ms after mount)
  await new Promise(r => setTimeout(r, 800));

  const driverCheck = await page.evaluate(() => {
    const popover = document.querySelector('.driver-popover.horizon-driver-popover');
    const activeTarget = document.querySelector('.driver-active-element');
    const targetTourAttr = activeTarget ? activeTarget.getAttribute('data-tour') : null;
    const title = popover ? popover.querySelector('.driver-popover-title')?.textContent : null;
    const skipBtn = popover ? popover.querySelector('.driver-popover-skip-btn') : null;
    const skipAll = popover ? popover.querySelector('.driver-skip-all-container') : null;

    return {
      popoverActive: !!popover,
      popoverTitle: title,
      targetTourAttr,
      hasSkipButton: !!skipBtn,
      hasSkipAllLink: !!skipAll,
    };
  });
  console.log('Driver.js check result:', driverCheck);
  audit.test4_DriverAutomaticOnboarding = driverCheck.popoverActive && driverCheck.hasSkipButton;

  await page.screenshot({ path: path.join(OUT_DIR, 'final_06_driver_spotlight_time_machine.png') });
  console.log('Saved final_06_driver_spotlight_time_machine.png');

  // Test Skip Tour
  console.log('Testing Skip Tour dismissal...');
  const skipBtn = await page.$('.driver-popover-skip-btn');
  if (skipBtn) {
    await skipBtn.click();
    await new Promise(r => setTimeout(r, 300));
    const isDismissed = await page.evaluate(() => !document.querySelector('.driver-popover'));
    console.log('Tour dismissed cleanly:', isDismissed);
  }

  // TEST 5: Manual Replay via Tour Button
  console.log('Verifying Test 5: Manual Tour Replay via TopBar Tour button...');
  const topTourBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('header button'));
    return buttons.find(b => b.textContent?.includes('Tour')) || null;
  });

  if (topTourBtn && topTourBtn.asElement()) {
    await topTourBtn.asElement().click();
    await new Promise(r => setTimeout(r, 500));
    const manualTourActive = await page.evaluate(() => !!document.querySelector('.driver-popover'));
    console.log('Manual Tour re-launched successfully:', manualTourActive);
    audit.test5_DriverManualReplay = manualTourActive;

    // Close again
    const closeBtn = await page.$('.driver-popover-close-btn');
    if (closeBtn) {
      await closeBtn.click();
      await new Promise(r => setTimeout(r, 300));
    }
  }

  // TEST 6: Complementary Return to Journey with Exact Scroll Restoration
  console.log('Verifying Test 6: Complementary Reverse Return to Journey...');
  const backBtn = await page.evaluateHandle(() => {
    const buttons = Array.from(document.querySelectorAll('header button'));
    return buttons.find(b => b.textContent?.includes('Back to Journey') || b.textContent?.includes('Journey')) || null;
  });

  if (backBtn && backBtn.asElement()) {
    console.log('Clicking "Back to Journey"...');
    await backBtn.asElement().click();
    await new Promise(r => setTimeout(r, 1400));

    const returnCheck = await page.evaluate(() => {
      return {
        path: window.location.pathname,
        hash: window.location.hash,
        scrollY: window.scrollY,
        isTimeMachineHash: window.location.hash === '#time-machine',
      };
    });
    console.log('Return check result:', returnCheck);
    audit.test6_LosslessJourneyReturn = returnCheck.path === '/' && (returnCheck.isTimeMachineHash || returnCheck.scrollY > 1000);

    await page.screenshot({ path: path.join(OUT_DIR, 'final_07_return_journey_restored.png') });
    console.log('Saved final_07_return_journey_restored.png');
  }

  // TEST 7: Mobile Viewport (390 x 844)
  console.log('Verifying Test 7: Mobile Viewport Responsiveness (390 x 844)...');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/#explorer', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const mobileCheck = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Mobile check result:', mobileCheck);
  audit.mobileCheck = mobileCheck;

  await page.screenshot({ path: path.join(OUT_DIR, 'mobile_final_01_explorer_sphere.png') });
  console.log('Saved mobile_final_01_explorer_sphere.png');

  // Save JSON summary
  fs.writeFileSync(path.join(OUT_DIR, 'final_verification_summary.json'), JSON.stringify(audit, null, 2));
  console.log('Saved final_verification_summary.json');

  await browser.close();
  console.log('=== VERIFICATION COMPLETE ===');
}

runVerification().catch(err => {
  console.error('Verification failed with error:', err);
  process.exit(1);
});
