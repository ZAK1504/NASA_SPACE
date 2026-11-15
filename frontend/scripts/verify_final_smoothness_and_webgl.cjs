const puppeteer = require('puppeteer-core');
const puppeteer = require('puppeteer-core');
const fs = require('fs');
const fs = require('fs');
const path = require('path');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('--- STARTING COMPREHENSIVE FINAL VERIFICATION ---');
  const browser = await puppeteer.launch({
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const consoleErrors = [];
  const consoleErrors = [];
  const consoleWarnings = [];
  const consoleWarnings = [];
  const webglContextWarnings = [];
  const webglContextWarnings = [];

  page.on('console', msg => {
    const text = msg.text();
    const text = msg.text();
    const type = msg.type();
    const type = msg.type();
    if (type === 'error') {
      consoleErrors.push(text);
      console.log(`[PAGE ERROR]: ${text}`);
    } else if (type === 'warning') {
      consoleWarnings.push(text);
      if (text.includes('WebGL') || text.includes('context')) {
        webglContextWarnings.push(text);
        console.log(`[PAGE WEBGL WARNING]: ${text}`);
      }
    }
  });

  page.on('pageerror', err => {
    consoleErrors.push(err.toString());
    console.log(`[PAGE UNCAUGHT ERROR]: ${err.toString()}`);
  });

  console.log('\n--- TEST 1: Load Main Journey Page ---');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Journey page loaded successfully.');

  console.log('\n--- TEST 2: Explorer Neon Discovery Path Geometry & Telemetry ---');
  const explorerData = await page.evaluate(() => {
  const explorerData = await page.evaluate(() => {
    const el = document.getElementById('explorer');
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant' });
    
    const svg = document.querySelector('.explorer-showcase-visual svg');
    const svg = document.querySelector('.explorer-showcase-visual svg');
    const connectors = document.querySelectorAll('.neon-connectors path');
    const connectors = document.querySelectorAll('.neon-connectors path');
    const badges = document.querySelectorAll('.badges g');
    const badges = document.querySelectorAll('.badges g');
    const stars = document.querySelectorAll('.star-markers g[data-beacon-id]');
    const stars = document.querySelectorAll('.star-markers g[data-beacon-id]');
    
    return {
      svgFound: !!svg,
      connectorsCount: connectors.length,
      badgesCount: badges.length,
      starsCount: stars.length,
      starIds: Array.from(stars).map(s => s.getAttribute('data-beacon-id'))
    };
  });
  console.log('Explorer SVG Data:', explorerData);

  // Click Barnard's Star
  await page.evaluate(() => {
    const barnard = document.querySelector('g[data-beacon-id="barnards-star"]');
    const barnard = document.querySelector('g[data-beacon-id="barnards-star"]');
    if (barnard) barnard.dispatchEvent(new MouseEvent('click', { bubbles: true }));
  });
  await new Promise(r => setTimeout(r, 600));

  const hudCardVisible = await page.evaluate(() => {
  const hudCardVisible = await page.evaluate(() => {
    const card = document.querySelector('.explorer-showcase-visual .select-text');
    const card = document.querySelector('.explorer-showcase-visual .select-text');
    return card ? card.textContent : null;
  });
  console.log('Barnard Star HUD Card Content:', hudCardVisible ? 'Detected: ' + hudCardVisible.slice(0, 80) + '...' : 'NOT FOUND');

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_explorer_discovery_path.png') });
  console.log('Saved final_explorer_discovery_path.png');

  console.log('\n--- TEST 3: Multi-Workspace Navigation & Scroll Restoration (No Jumps) ---');
  const chapters = ['explorer', 'time-machine', 'labs', 'mission'];
  const chapters = ['explorer', 'time-machine', 'labs', 'mission'];
  const restorationResults = [];
  const restorationResults = [];

  for (const ch of chapters) {
  for (const ch of chapters) {
    console.log(`\nTesting Chapter: ${ch}`);
    // Scroll to chapter
    await page.evaluate((targetCh) => {
      const el = document.getElementById(targetCh);
      const el = document.getElementById(targetCh);
      if (el) {
        if (window.__lenis) {
          window.__lenis.scrollTo(el, { immediate: true, offset: -70 });
        } else {
          el.scrollIntoView({ behavior: 'instant' });
        }
      }
    }, ch);
    await new Promise(r => setTimeout(r, 800));

    const initialScrollY = await page.evaluate(() => window.scrollY);
    const initialScrollY = await page.evaluate(() => window.scrollY);
    console.log(`Initial scrollY at #${ch}: ${initialScrollY}`);

    // Click workspace entry button
    const openedWorkspace = await page.evaluate((targetCh) => {
    const openedWorkspace = await page.evaluate((targetCh) => {
      const btn = document.querySelector(`[data-workspace-entry="${targetCh}"]`) ||
      const btn = document.querySelector(`[data-workspace-entry="${targetCh}"]`) ||
                  document.querySelector(`#${targetCh} button[data-action="enter-workspace"]`) ||
                  document.querySelector(`#${targetCh} a[href*="/"]`);
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    }, ch);

    if (!openedWorkspace) {
      console.log(`Could not find workspace entry button in ${ch}, navigating programmatically.`);
      const workspacePaths = {
      const workspacePaths = {
        'explorer': '/explore',
        'time-machine': '/time-machine',
        'labs': '/discovery-lab',
        'mission': '/mission'
      };
      await page.evaluate((p, c, s) => {
        sessionStorage.setItem('horizon_journey_state', JSON.stringify({ originChapter: c, scrollY: s, timestamp: Date.now() }));
        window.location.href = p;
      }, workspacePaths[ch], ch, initialScrollY);
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1200));

    const workspaceUrl = page.url();
    const workspaceUrl = page.url();
    console.log(`Arrived at workspace: ${workspaceUrl}`);

    // Click "Back to Journey"
    const clickedBack = await page.evaluate(() => {
    const clickedBack = await page.evaluate(() => {
      const btn = document.querySelector('button[data-action="back-to-journey"]') ||
      const btn = document.querySelector('button[data-action="back-to-journey"]') ||
                  document.querySelector('button[data-tour="workspace-back-button"]');
      if (btn) {
        btn.click();
        return true;
      }
      return false;
    });

    console.log(`Clicked Back to Journey: ${clickedBack}`);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
    
    // Check scroll position immediately upon mount and after 300ms
    const immediateScroll = await page.evaluate(() => window.scrollY);
    const immediateScroll = await page.evaluate(() => window.scrollY);
    await new Promise(r => setTimeout(r, 400));
    const settledScroll = await page.evaluate(() => window.scrollY);
    const settledScroll = await page.evaluate(() => window.scrollY);

    const scrollDiff = Math.abs(settledScroll - initialScrollY);
    const scrollDiff = Math.abs(settledScroll - initialScrollY);
    const jumpDiff = Math.abs(settledScroll - immediateScroll);
    const jumpDiff = Math.abs(settledScroll - immediateScroll);
    console.log(`Restoration Results for ${ch}: Initial=${initialScrollY}, Immediate=${immediateScroll}, Settled=${settledScroll}, DiffFromTarget=${scrollDiff}, JumpOnMount=${jumpDiff}`);
    
    restorationResults.push({
      chapter: ch,
      initialScrollY,
      immediateScroll,
      settledScroll,
      scrollDiff,
      jumpDiff,
      passed: jumpDiff <= 2 && scrollDiff <= 150
    });
  }

  console.log('\n--- TEST 4: Multi-Tool Switching In-Workspace Context Retention ---');
  // Enter Explorer workspace at /explore
  await page.goto('http://127.0.0.1:5173/explore', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  // Switch tab to Spectral
  await page.evaluate(() => {
    const tabs = Array.from(document.querySelectorAll('header button'));
    const tabs = Array.from(document.querySelectorAll('header button'));
    const spectralTab = tabs.find(t => t.textContent.includes('Spectral'));
    const spectralTab = tabs.find(t => t.textContent.includes('Spectral'));
    if (spectralTab) spectralTab.click();
  });
  await new Promise(r => setTimeout(r, 1500));
  console.log('Switched to Spectral tab, current URL:', page.url());

  // Return to journey from Spectral
  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="back-to-journey"]');
    const btn = document.querySelector('button[data-action="back-to-journey"]');
    if (btn) btn.click();
  });
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 1000));
  console.log('Returned to Journey from tool hop. Current URL:', page.url(), 'ScrollY:', await page.evaluate(() => window.scrollY));

  console.log('\n--- TEST 5: WebGL Context Disposal & Aladin Lifecycle Stress Test (10 cycles) ---');
  for (let i = 1; i <= 10; i++) {
    // Visit /explore
    await page.goto('http://127.0.0.1:5173/explore', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    // Visit /spectra
    await page.goto('http://127.0.0.1:5173/spectra', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 400));
    // Back to /
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 200));
    process.stdout.write(`Cycle ${i}/10 complete... `);
  }
  console.log('\nCompleted 10 cycles of rapid WebGL mounts and unmounts.');

  console.log('\n--- TEST 6: Guided Tour on Main Journey Page ---');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  const tourTriggered = await page.evaluate(() => {
  const tourTriggered = await page.evaluate(() => {
    const tourBtn = document.querySelector('[data-tour="navbar-tour-btn"]') ||
    const tourBtn = document.querySelector('[data-tour="navbar-tour-btn"]') ||
                    Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Tour'));
    if (tourBtn) {
      tourBtn.click();
      return true;
    }
    return false;
  });
  console.log('Clicked main Tour button:', tourTriggered);
  await new Promise(r => setTimeout(r, 800));

  const popoverDetected = await page.evaluate(() => {
  const popoverDetected = await page.evaluate(() => {
    const popover = document.querySelector('.driver-popover') || document.querySelector('.driver-stage');
    const popover = document.querySelector('.driver-popover') || document.querySelector('.driver-stage');
    return !!popover;
  });
  console.log('Driver.js popover rendered:', popoverDetected);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'final_tour_verified.png') });
  console.log('Saved final_tour_verified.png');

  console.log('\n--- FINAL SUMMARY OF CONSOLE LOGS ---');
  console.log(`Total Errors: ${consoleErrors.length}`);
  console.log(`Total Warnings: ${consoleWarnings.length}`);
  console.log(`WebGL Context Warnings: ${webglContextWarnings.length}`);
  
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }
  if (webglContextWarnings.length > 0) {
    console.log('WebGL Warnings:', webglContextWarnings);
  }

  const results = {
  const results = {
    explorerData,
    hudCardVisible: !!hudCardVisible,
    restorationResults,
    webglContextWarningsCount: webglContextWarnings.length,
    consoleErrorsCount: consoleErrors.length,
    tourWorking: popoverDetected
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'verification_results.json'), JSON.stringify(results, null, 2));
  console.log('Saved verification_results.json');

  await browser.close();
  console.log('--- VERIFICATION COMPLETE ---');
})();
