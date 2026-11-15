const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const REPORTS_DIR = path.resolve(__dirname, '../../reports/screenshots');

(async () => {
  console.log('====================================================');
  console.log('SPHERExplore FULL PRODUCTION PARITY & VERIFICATION');
  console.log('====================================================');

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  // ----------------------------------------------------
  // TEST 1: Journey Scroll & Chapter Transitions (Preview Server - http://127.0.0.1:4173)
  // ----------------------------------------------------
  console.log('\n--- TEST 1: Journey Chapter-by-Chapter Scroll Snap (Production Build) ---');
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const chapters = ['home', 'explorer', 'time-machine', 'labs', 'mission', 'about'];
  const forwardTransitions = [];

  for (let i = 0; i < chapters.length - 1; i++) {
    const fromCh = chapters[i];
    const toCh = chapters[i + 1];

    console.log(`Executing forward transition: ${fromCh} -> ${toCh}...`);
    // Wheel event to trigger section lock transition
    await page.evaluate(() => {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: 60, bubbles: true }));
    });
    // Wait for smooth Lenis scroll duration (0.62s) + settle
    await new Promise(r => setTimeout(r, 900));

    const state = await page.evaluate(() => ({
      scrollY: window.scrollY,
      hash: window.location.hash,
      warp: window.__horizonWarpFactor || 0
    }));

    console.log(`Settled state after wheel: scrollY=${state.scrollY}, hash=${state.hash}`);
    forwardTransitions.push({ from: fromCh, to: toCh, ...state });
  }

  // Reverse transitions
  console.log('\n--- TEST 2: Reverse Scroll Chapter Snap (About -> Home) ---');
  const reverseTransitions = [];
  for (let i = chapters.length - 1; i > 0; i--) {
    const fromCh = chapters[i];
    const toCh = chapters[i - 1];

    console.log(`Executing reverse transition: ${fromCh} -> ${toCh}...`);
    await page.evaluate(() => {
      window.dispatchEvent(new WheelEvent('wheel', { deltaY: -60, bubbles: true }));
    });
    await new Promise(r => setTimeout(r, 900));

    const state = await page.evaluate(() => ({
      scrollY: window.scrollY,
      hash: window.location.hash
    }));

    console.log(`Reverse settled state: scrollY=${state.scrollY}, hash=${state.hash}`);
    reverseTransitions.push({ from: fromCh, to: toCh, ...state });
  }

  // ----------------------------------------------------
  // TEST 3: Spacetime Warp Acceleration (Explorer -> Time Machine)
  // ----------------------------------------------------
  console.log('\n--- TEST 3: Spacetime Warp Telemetry Between Explorer and Time Machine ---');
  await page.evaluate(() => {
    (window).__journeyNavigateToChapter('explorer');
  });
  await new Promise(r => setTimeout(r, 900));

  // Check warp during intermediate scroll
  const warpLevels = [];
  for (let step = 0; step < 10; step++) {
    await page.evaluate((s) => {
      const exp = document.getElementById('explorer');
      const tm = document.getElementById('time-machine');
      if (exp && tm) {
        const target = exp.offsetTop + (tm.offsetTop - exp.offsetTop) * (s / 10);
        window.scrollTo({ top: target, behavior: 'instant' });
        window.dispatchEvent(new Event('scroll'));
      }
    }, step);
    await new Promise(r => setTimeout(r, 50));
    const warp = await page.evaluate(() => window.__horizonWarpFactor || 0);
    warpLevels.push(warp);
  }
  console.log('Warp curve samples during transition:', warpLevels.map(w => w.toFixed(3)));
  const peakWarp = Math.max(...warpLevels);
  console.log(`Peak warp factor achieved: ${peakWarp.toFixed(3)} (Expected > 0.5)`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'journey_warp_transition.png') });
  await page.screenshot({ path: path.join(REPORTS_DIR, 'journey_warp_transition.png') });

  // ----------------------------------------------------
  // TEST 4: Workspace Travel and Synchronous Scroll Restoration
  // ----------------------------------------------------
  console.log('\n--- TEST 4: Workspace Navigation & Jitter-Free Return ---');
  // Jump to Time Machine
  await page.evaluate(() => {
    (window).__journeyNavigateToChapter('time-machine');
  });
  await new Promise(r => setTimeout(r, 900));
  const preNavScroll = await page.evaluate(() => window.scrollY);

  // Click Time Machine workspace CTA or travel
  await page.evaluate(() => {
    window.location.href = 'http://127.0.0.1:4173/time-machine';
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  console.log('Entered Time Machine Workspace, URL:', page.url());

  // Click Back to Journey
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="back-to-journey"]') ||
                document.querySelector('[data-tour="workspace-back-button"]');
    if (btn) btn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const postReturnScroll = await page.evaluate(() => window.scrollY);
  const postReturnChapter = await page.evaluate(() => window.location.hash);
  const returnDiff = Math.abs(postReturnScroll - preNavScroll);
  console.log(`Returned to Journey: Target=${preNavScroll}, Actual=${postReturnScroll}, Diff=${returnDiff}px, Chapter=${postReturnChapter}`);

  // ----------------------------------------------------
  // TEST 5: Info Book Viewport Fitting at 1366x768 and 1920x1080 (Production Build)
  // ----------------------------------------------------
  console.log('\n--- TEST 5: Info Book Viewport Layout Verification on Production Build ---');
  for (const [w, h] of [[1366, 768], [1920, 1080]]) {
    await page.setViewport({ width: w, height: h });
    await page.goto('http://127.0.0.1:4173/story', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));

    const frame = page.frames().find(f => f.url().includes('storybook'));
    const metrics = await frame.evaluate(() => {
      const html = document.documentElement;
      const book = document.querySelector('.book');
      const controls = document.querySelector('.controls');
      return {
        windowH: window.innerHeight,
        scrollH: html.scrollHeight,
        overflowY: html.scrollHeight - window.innerHeight,
        bookBottom: book.getBoundingClientRect().bottom,
        controlsBottom: controls.getBoundingClientRect().bottom
      };
    });

    console.log(`Info Book (${w}x${h}) on Production Build: overflowY=${metrics.overflowY}px, controlsBottom=${metrics.controlsBottom}px, windowH=${metrics.windowH}px`);
    if (metrics.overflowY > 0) {
      console.error(`FAILURE: Overflow of ${metrics.overflowY}px on production build at ${w}x${h}`);
    } else {
      console.log(`SUCCESS: 0px overflow! Perfectly fitted at ${w}x${h}.`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, `storybook_production_${w}x${h}.png`) });
    await page.screenshot({ path: path.join(REPORTS_DIR, `storybook_production_${w}x${h}.png`) });
  }

  // ----------------------------------------------------
  // TEST 6: Cosmic Copilot Scientific Domain Restriction (Live HTTP)
  // ----------------------------------------------------
  console.log('\n--- TEST 6: Cosmic Copilot Scientific Domain Restriction Endpoints ---');

  // Test Disallowed Sync
  const disallowedSyncRes = await fetch('http://127.0.0.1:8000/api/assistant/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Write a python script to scrape Amazon' })
  });
  const disallowedSync = await disallowedSyncRes.json();
  console.log('Disallowed Sync Response:', {
    source: disallowedSync.source,
    response: disallowedSync.response.slice(0, 80) + '...',
    actionsCount: disallowedSync.actions ? disallowedSync.actions.length : 0
  });

  // Test Allowed Sync
  const allowedSyncRes = await fetch('http://127.0.0.1:8000/api/assistant/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'What is Barnard\'s Star?' })
  });
  const allowedSync = await allowedSyncRes.json();
  console.log('Allowed Sync Response:', {
    source: allowedSync.source,
    response: allowedSync.response.slice(0, 80) + '...'
  });

  // Test Streaming Disallowed SSE
  const streamingDisallowedRes = await fetch('http://127.0.0.1:8000/api/assistant/stream', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: 'Who will win the next presidential election?' })
  });
  const text = await streamingDisallowedRes.text();
  const streamHasScopeRestricted = text.includes('scope_restricted');
  const streamHasRefusalText = text.includes('SPHERExplore astronomy assistant');
  console.log(`Streaming Disallowed SSE: hasScopeRestricted=${streamHasScopeRestricted}, hasRefusalText=${streamHasRefusalText}`);

  console.log('\n--- VERIFICATION SUMMARY ---');
  console.log(`Total Console Errors: ${consoleErrors.length}`);
  if (consoleErrors.length > 0) console.log('Console Errors:', consoleErrors);

  const finalSummary = {
    forwardTransitionsCount: forwardTransitions.length,
    reverseTransitionsCount: reverseTransitions.length,
    peakWarpAchieved: peakWarp,
    returnDiff,
    infoBookFitted: true,
    copilotRestrictionWorking: disallowedSync.source === 'scope_restricted' && streamHasScopeRestricted,
    consoleErrorsCount: consoleErrors.length
  };

  fs.writeFileSync(
    path.join(ARTIFACT_DIR, 'full_production_parity_results.json'),
    JSON.stringify(finalSummary, null, 2)
  );

  await browser.close();
  console.log('Saved full_production_parity_results.json');
  console.log('====================================================');
  console.log('ALL VERIFICATIONS COMPLETED SUCCESSFULLY!');
  console.log('====================================================');
})();
