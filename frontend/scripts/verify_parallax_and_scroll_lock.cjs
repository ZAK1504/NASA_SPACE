const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('--- STARTING VERIFICATION: TWO-COLUMN COMPACT LAYOUT, LESS SPACE BELOW, ZERO SEPARATORS & HALFWAY SCROLL LOCK ---');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-gl=angle', '--use-angle=gl', '--window-size=1440,900']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  console.log('\n--- TEST 1: Load Journey & Verify ZERO Page Separators & Zero Ribbons ---');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const separatorAudit = await page.evaluate(() => {
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

  console.log('Separator & Ribbon Audit Results:', separatorAudit);

  console.log('\n--- TEST 2: Two-Column Compact Layout & Section Heights Audit ---');
  const layoutAudit = await page.evaluate(() => {
    const chapters = ['home', 'explorer', 'time-machine', 'labs', 'mission'];
    return chapters.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const rect = el.getBoundingClientRect();
      const grid = el.querySelector('.grid');
      const hasTwoColumns = grid ? (grid.classList.contains('lg:grid-cols-12') || window.getComputedStyle(grid).gridTemplateColumns.split(' ').length >= 2) : false;
      return {
        id,
        found: true,
        heightPx: Math.round(rect.height),
        hasTwoColumns,
      };
    });
  });
  console.log('Layout & Height Audit Results:', layoutAudit);

  console.log('\n--- TEST 3: Capture Compact Two-Column Home Chapter ---');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'twocol_01_home.png') });
  console.log('Saved twocol_01_home.png');

  console.log('\n--- TEST 4: Halfway Scroll Down Test (User opens page halfway -> Auto-scrolls down) ---');
  const explorerTop = await page.evaluate(() => {
    const el = document.getElementById('explorer');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });

  // Manually scroll halfway (52% progress towards Explorer)
  const halfwayY = Math.round(explorerTop * 0.52);
  console.log(`Setting scroll halfway between Home and Explorer: ${halfwayY}px (target=${explorerTop}px)`);
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  }, halfwayY);

  // Wait for settle detector + Lenis smooth glide
  await new Promise(r => setTimeout(r, 1600));

  const afterHalfwayScrollY = await page.evaluate(() => window.scrollY);
  const halfwayDiff = Math.abs(afterHalfwayScrollY - explorerTop);
  console.log(`Halfway Auto-Scroll Result: settled=${afterHalfwayScrollY}, target=${explorerTop}, diff=${halfwayDiff}`);
  const halfwayAutoScrollSuccess = halfwayDiff <= 2;
  console.log(`Halfway Auto-Scroll Down Success: ${halfwayAutoScrollSuccess}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'twocol_02_explorer.png') });
  console.log('Saved twocol_02_explorer.png');

  console.log('\n--- TEST 5: Scroll Lock Down to Time Machine ---');
  await page.mouse.move(300, 400); // Hover over left text column
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const tmScrollY = await page.evaluate(() => window.scrollY);
  const tmTop = await page.evaluate(() => {
    const el = document.getElementById('time-machine');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });
  console.log(`Scroll to Time Machine: current=${tmScrollY}, target=${tmTop}, diff=${Math.abs(tmScrollY - tmTop)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'twocol_03_time_machine.png') });
  console.log('Saved twocol_03_time_machine.png');

  console.log('\n--- TEST 6: Scroll Lock Down to Labs ---');
  await page.mouse.move(300, 400);
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const labsScrollY = await page.evaluate(() => window.scrollY);
  const labsTop = await page.evaluate(() => {
    const el = document.getElementById('labs');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });
  console.log(`Scroll to Labs: current=${labsScrollY}, target=${labsTop}, diff=${Math.abs(labsScrollY - labsTop)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'twocol_04_labs.png') });
  console.log('Saved twocol_04_labs.png');

  console.log('\n--- TEST 7: Scroll Lock Down to Mission ---');
  await page.mouse.move(300, 400);
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const missionScrollY = await page.evaluate(() => window.scrollY);
  const missionTop = await page.evaluate(() => {
    const el = document.getElementById('mission');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });
  console.log(`Scroll to Mission: current=${missionScrollY}, target=${missionTop}, diff=${Math.abs(missionScrollY - missionTop)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'twocol_05_mission.png') });
  console.log('Saved twocol_05_mission.png');

  const finalSummary = {
    separatorAudit,
    layoutAudit,
    halfwayAutoScrollTest: {
      initialHalfwayY: halfwayY,
      settledScrollY: afterHalfwayScrollY,
      targetExplorerY: explorerTop,
      diff: halfwayDiff,
      passed: halfwayAutoScrollSuccess,
    },
    snappingResults: {
      toTimeMachine: { current: tmScrollY, target: tmTop, diff: Math.abs(tmScrollY - tmTop) },
      toLabs: { current: labsScrollY, target: labsTop, diff: Math.abs(labsScrollY - labsTop) },
      toMission: { current: missionScrollY, target: missionTop, diff: Math.abs(missionScrollY - missionTop) },
    }
  };

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'twocol_scroll_lock_results.json'), JSON.stringify(finalSummary, null, 2));
  console.log('Saved twocol_scroll_lock_results.json');

  await browser.close();
  console.log('--- VERIFICATION COMPLETE ---');
})();
