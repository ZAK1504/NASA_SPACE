const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const ARTIFACTS_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('=== SPHEREx HORIZON Authoritative Browser Verification ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900', '--no-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('1. Loading Journey at http://127.0.0.1:5173...');
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const results = {};

  // -------------------------------------------------------------
  // TEST A: LABS CHAPTER AUDIT
  // -------------------------------------------------------------
  console.log('\n--- Auditing Labs Chapter ---');
  await page.evaluate(() => {
    const el = document.getElementById('labs');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const labsAudit = await page.evaluate(() => {
    const visual = document.querySelector('.labs-showcase-visual');
    if (!visual) return { error: 'Labs visual not found' };

    const grid = visual.querySelector('.grid.grid-cols-3');
    const cards = grid ? Array.from(grid.children) : [];
    const cardRects = cards.map(c => {
      const rect = c.getBoundingClientRect();
      return { width: Math.round(rect.width), height: Math.round(rect.height) };
    });

    const legend = visual.querySelector('p');
    const legendText = legend ? legend.textContent : '';

    return {
      visualWidth: Math.round(visual.getBoundingClientRect().width),
      cardRects,
      averageCardWidth: cardRects.length ? Math.round(cardRects.reduce((a, b) => a + b.width, 0) / cardRects.length) : 0,
      legendText,
      hasProperMotionCorrectText: legendText.includes('10.223″ predicted catalogue displacement across the 359-day baseline'),
      doesNotHaveOldWrongText: !legendText.includes('10.223″/yr proper motion'),
    };
  });
  console.log('Labs Audit:', labsAudit);
  results.labsAudit = labsAudit;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_01_labs_exploded_after.png') });
  console.log('Saved verify_01_labs_exploded_after.png');

  // Toggle Flat Array
  await page.evaluate(() => {
    const flatBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Flat Array'));
    if (flatBtn) flatBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));
  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_02_labs_flat_after.png') });
  console.log('Saved verify_02_labs_flat_after.png');

  // Restore 3D Exploded
  await page.evaluate(() => {
    const expBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('3D Exploded'));
    if (expBtn) expBtn.click();
  });
  await new Promise(r => setTimeout(r, 400));

  // -------------------------------------------------------------
  // TEST B: EXPLORER CHAPTER AUDIT
  // -------------------------------------------------------------
  console.log('\n--- Auditing Explorer Chapter ---');
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const explorerAudit = await page.evaluate(() => {
    const visual = document.querySelector('.explorer-showcase-visual');
    if (!visual) return { error: 'Explorer visual not found' };

    const rect = visual.getBoundingClientRect();
    const canvas = visual.querySelector('canvas');
    const beacons = Array.from(visual.querySelectorAll('.celestial-target-star'));
    const beaconNames = beacons.map(b => b.getAttribute('data-beacon-name'));

    return {
      visualWidth: Math.round(rect.width),
      visualHeight: Math.round(rect.height),
      hasCanvas: !!canvas,
      beaconCount: beacons.length,
      beaconNames,
      isFootprintReduced: rect.width <= 520,
    };
  });
  console.log('Explorer Audit:', explorerAudit);
  results.explorerAudit = explorerAudit;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_03_explorer_sky_cluster.png') });
  console.log('Saved verify_03_explorer_sky_cluster.png');

  // Test Hover / Select Target Star (Barnard's Star)
  console.log('Testing target selection (Barnard\'s Star)...');
  await page.evaluate(() => {
    const barnard = document.querySelector('[data-beacon-name="Barnard\'s Star"]');
    if (barnard) barnard.click();
  });
  await new Promise(r => setTimeout(r, 400));

  const hudCardInfo = await page.evaluate(() => {
    const card = document.querySelector('.explorer-showcase-visual .shadow-\\[0_12px_36px_rgba\\(0\\,0\\,0\\,0\\.8\\)\\]') || document.querySelector('.explorer-showcase-visual .backdrop-blur-xl');
    return {
      hasHudCard: !!card,
      text: card ? card.textContent : null,
    };
  });
  console.log('Target HUD Card Info:', hudCardInfo);
  results.hudCardInfo = hudCardInfo;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_04_explorer_target_selected.png') });
  console.log('Saved verify_04_explorer_target_selected.png');

  // Dismiss Target
  await page.evaluate(() => {
    const closeBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('✕'));
    if (closeBtn) closeBtn.click();
  });
  await new Promise(r => setTimeout(r, 300));

  // Test Hover Action "Explore the Spectrum"
  console.log('Testing Explore the Spectrum hover preview...');
  const spectrumBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore the Spectrum'));
  });
  if (spectrumBtn) {
    await spectrumBtn.hover();
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_05_explorer_spectral_hover.png') });
    console.log('Saved verify_05_explorer_spectral_hover.png');
  }

  // -------------------------------------------------------------
  // TEST C: WORKSPACE TRANSITION & RETURN TO JOURNEY
  // -------------------------------------------------------------
  console.log('\n--- Auditing Workspace Transition & Return Journey ---');
  // Record transition frames when entering Object Explorer from Explorer
  const startScrollY = await page.evaluate(() => window.scrollY);
  console.log(`Starting from Explorer at scrollY = ${startScrollY}`);

  const objBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Objects'));
  });
  await objBtn.click();

  // Wait for workspace to load
  await new Promise(r => setTimeout(r, 850));
  const workspaceState = await page.evaluate(() => {
    return {
      pathname: window.location.pathname,
      scrollY: window.scrollY,
      hasWorkspaceHeader: !!document.querySelector('.scientific-workspace-layout'),
      activeTool: document.querySelector('.bg-\\[var\\(--accent\\)\\]')?.textContent || null,
    };
  });
  console.log('Workspace State upon arrival:', workspaceState);
  results.workspaceState = workspaceState;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_06_object_workspace_arrived.png') });
  console.log('Saved verify_06_object_workspace_arrived.png');

  // Return to Journey
  console.log('Clicking Back to Journey...');
  const backBtn = await page.evaluateHandle(() => {
    return document.querySelector('button[data-action="back-to-journey"]');
  });
  await backBtn.click();

  // Wait for return transition
  await new Promise(r => setTimeout(r, 850));
  const returnState = await page.evaluate(() => {
    return {
      pathname: window.location.pathname,
      hash: window.location.hash,
      scrollY: window.scrollY,
    };
  });
  console.log('Return Journey State:', returnState);
  results.returnState = returnState;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_07_journey_restored_after_return.png') });
  console.log('Saved verify_07_journey_restored_after_return.png');

  // -------------------------------------------------------------
  // TEST D: DRIVER.JS TUTORIAL ONBOARDING TIMING
  // -------------------------------------------------------------
  console.log('\n--- Auditing Driver.js Tutorial Coordination ---');
  // Navigate to Time Machine to test clean tour launch
  await page.evaluate(() => {
    const el = document.getElementById('time-machine');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  const tmBtn = await page.evaluateHandle(() => {
    return Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Launch Time Machine'));
  });
  await tmBtn.click();

  // Wait 1250ms for transition overlay to clear and tour to start
  await new Promise(r => setTimeout(r, 1350));
  const tourState = await page.evaluate(() => {
    const driverPopover = document.querySelector('.driver-popover');
    const transitionOverlay = document.querySelector('.fixed.inset-0.z-\\[100\\]');
    return {
      pathname: window.location.pathname,
      tourActive: !!driverPopover,
      tourTitle: driverPopover ? driverPopover.querySelector('.driver-popover-title')?.textContent : null,
      transitionOverlayHidden: transitionOverlay ? window.getComputedStyle(transitionOverlay).visibility === 'hidden' : true,
    };
  });
  console.log('Driver.js Tour State:', tourState);
  results.tourState = tourState;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_08_driverjs_tour_active.png') });
  console.log('Saved verify_08_driverjs_tour_active.png');

  // Close Tour & Return
  await page.evaluate(() => {
    const closeTour = document.querySelector('.driver-close-btn') || document.querySelector('button[aria-label="Close"]');
    if (closeTour) closeTour.click();
    const back = document.querySelector('button[data-action="back-to-journey"]');
    if (back) back.click();
  });
  await new Promise(r => setTimeout(r, 850));

  // -------------------------------------------------------------
  // TEST E: MOBILE RESPONSIVENESS AUDIT (390 x 844)
  // -------------------------------------------------------------
  console.log('\n--- Auditing Mobile Responsiveness (390x844) ---');
  await page.setViewport({ width: 390, height: 844 });
  await page.goto('http://127.0.0.1:5173/#explorer', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const mobileExplorer = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Mobile Explorer Audit:', mobileExplorer);
  results.mobileExplorer = mobileExplorer;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_09_mobile_explorer.png') });
  console.log('Saved verify_09_mobile_explorer.png');

  await page.evaluate(() => {
    const el = document.getElementById('labs');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 600));

  const mobileLabs = await page.evaluate(() => {
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      hasOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    };
  });
  console.log('Mobile Labs Audit:', mobileLabs);
  results.mobileLabs = mobileLabs;

  await page.screenshot({ path: path.join(ARTIFACTS_DIR, 'verify_10_mobile_labs.png') });
  console.log('Saved verify_10_mobile_labs.png');

  // Save audit results json
  fs.writeFileSync(path.join(ARTIFACTS_DIR, 'targeted_refinement_audit_summary.json'), JSON.stringify(results, null, 2));
  console.log('\nAll verification tests completed successfully!');

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
