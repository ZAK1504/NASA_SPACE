const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('--- STARTING VERIFICATION: REMOVE CURLY RIBBONS, PARALLAX TRANSITION & SCROLL LOCK ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('\n--- TEST 1: Load Main Journey Page & Verify Zero Curly Ribbons ---');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const ribbonAudit = await page.evaluate(() => {
    const snakeRibbons = document.querySelectorAll('.snake-ribbon-container, .snake-ribbon-svg');
    const oldRibbons = document.querySelectorAll('.ribbon svg, .mission-ribbon, .stage-ribbon');
    const parallaxTransition = document.querySelector('.home-to-explorer-parallax');
    const separators = document.querySelectorAll('.chapter-atmospheric-separator');

    return {
      snakeRibbonsCount: snakeRibbons.length,
      oldRibbonsCount: oldRibbons.length,
      parallaxTransitionFound: !!parallaxTransition,
      separatorsCount: separators.length,
    };
  });

  console.log('Ribbon Audit Results:', ribbonAudit);

  console.log('\n--- TEST 2: Capture Home Page Initial State ---');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scroll_lock_01_home.png') });
  console.log('Saved scroll_lock_01_home.png');

  console.log('\n--- TEST 3: Scroll Lock Down (Home -> Explorer) ---');
  const initialScrollY = await page.evaluate(() => window.scrollY);
  console.log('Initial scrollY at Home:', initialScrollY);

  // Send real mouse wheel scroll via CDP
  await page.mouse.move(700, 450);
  await page.mouse.wheel({ deltaY: 120 });

  // Wait for the scroll lock animation to smoothly drive to Explorer (~1400ms)
  await new Promise(r => setTimeout(r, 1600));

  const explorerScrollY = await page.evaluate(() => window.scrollY);
  const explorerTop = await page.evaluate(() => {
    const el = document.getElementById('explorer');
    return el ? Math.max(0, el.offsetTop - 70) : null;
  });
  console.log(`Scroll Lock to Explorer: current=${explorerScrollY}, target=${explorerTop}, diff=${Math.abs(explorerScrollY - explorerTop)}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scroll_lock_02_explorer.png') });
  console.log('Saved scroll_lock_02_explorer.png');

  console.log('\n--- TEST 4: Scroll Lock Down (Explorer -> Time Machine) ---');
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const tmScrollY = await page.evaluate(() => window.scrollY);
  const tmTop = await page.evaluate(() => {
    const el = document.getElementById('time-machine');
    return el ? Math.max(0, el.offsetTop - 70) : null;
  });
  console.log(`Scroll Lock to Time Machine: current=${tmScrollY}, target=${tmTop}, diff=${Math.abs(tmScrollY - tmTop)}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scroll_lock_03_time_machine.png') });
  console.log('Saved scroll_lock_03_time_machine.png');

  console.log('\n--- TEST 5: Scroll Lock Down (Time Machine -> Labs) ---');
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const labsScrollY = await page.evaluate(() => window.scrollY);
  const labsTop = await page.evaluate(() => {
    const el = document.getElementById('labs');
    return el ? Math.max(0, el.offsetTop - 70) : null;
  });
  console.log(`Scroll Lock to Labs: current=${labsScrollY}, target=${labsTop}, diff=${Math.abs(labsScrollY - labsTop)}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scroll_lock_04_labs.png') });
  console.log('Saved scroll_lock_04_labs.png');

  console.log('\n--- TEST 6: Scroll Lock Down (Labs -> Mission) ---');
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const missionScrollY = await page.evaluate(() => window.scrollY);
  const missionTop = await page.evaluate(() => {
    const el = document.getElementById('mission');
    return el ? Math.max(0, el.offsetTop - 70) : null;
  });
  console.log(`Scroll Lock to Mission: current=${missionScrollY}, target=${missionTop}, diff=${Math.abs(missionScrollY - missionTop)}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'scroll_lock_05_mission.png') });
  console.log('Saved scroll_lock_05_mission.png');

  console.log('\n--- TEST 7: Scroll Lock Reverse Up (Mission -> Labs) ---');
  await page.mouse.wheel({ deltaY: -120 });
  await new Promise(r => setTimeout(r, 1600));

  const reverseLabsY = await page.evaluate(() => window.scrollY);
  console.log(`Scroll Lock Reverse Up to Labs: current=${reverseLabsY}, target=${labsTop}, diff=${Math.abs(reverseLabsY - labsTop)}`);

  const results = {
    ribbonAudit,
    snappingResults: {
      toExplorer: { current: explorerScrollY, target: explorerTop, diff: Math.abs(explorerScrollY - explorerTop) },
      toTimeMachine: { current: tmScrollY, target: tmTop, diff: Math.abs(tmScrollY - tmTop) },
      toLabs: { current: labsScrollY, target: labsTop, diff: Math.abs(labsScrollY - labsTop) },
      toMission: { current: missionScrollY, target: missionTop, diff: Math.abs(missionScrollY - missionTop) },
      reverseToLabs: { current: reverseLabsY, target: labsTop, diff: Math.abs(reverseLabsY - labsTop) },
    }
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'scroll_lock_verification_results.json'), JSON.stringify(results, null, 2));
  console.log('Saved scroll_lock_verification_results.json');

  await browser.close();
  console.log('--- VERIFICATION COMPLETE ---');
})();
