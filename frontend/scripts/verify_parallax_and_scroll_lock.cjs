const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('--- STARTING VERIFICATION: ZERO SEPARATORS, CENTRAL ALIGNMENT & HALFWAY SCROLL LOCK ---');
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

  console.log('\n--- TEST 2: Central Alignment Audit Across All 5 Chapters ---');
  const alignmentAudit = await page.evaluate(() => {
    const chapters = ['home', 'explorer', 'time-machine', 'labs', 'mission'];
    return chapters.map(id => {
      const el = document.getElementById(id);
      if (!el) return { id, found: false };
      const h1OrH2 = el.querySelector('h1, h2');
      const textCenter = el.classList.contains('text-center') || (h1OrH2 && window.getComputedStyle(h1OrH2).textAlign === 'center');
      const flexCenter = el.classList.contains('items-center') || el.classList.contains('justify-center');
      return {
        id,
        found: true,
        textCenter,
        flexCenter,
        h1OrH2TagName: h1OrH2 ? h1OrH2.tagName : null,
        h1OrH2Text: h1OrH2 ? h1OrH2.textContent?.trim().slice(0, 30) : null
      };
    });
  });
  console.log('Alignment Audit Results:', alignmentAudit);

  console.log('\n--- TEST 3: Capture Centered Home Chapter ---');
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'centered_01_home.png') });
  console.log('Saved centered_01_home.png');

  console.log('\n--- TEST 4: Halfway Scroll Down Test (User opens page halfway -> Auto-scrolls down) ---');
  const explorerTop = await page.evaluate(() => {
    const el = document.getElementById('explorer');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });

  // Manually scroll to 52% of the way between Home (0) and Explorer
  const halfwayY = Math.round(explorerTop * 0.52);
  console.log(`Setting scroll halfway between Home and Explorer: ${halfwayY}px (target=${explorerTop}px)`);
  await page.evaluate((y) => {
    window.scrollTo({ top: y, behavior: 'instant' });
    window.dispatchEvent(new Event('scroll'));
  }, halfwayY);

  // Wait for the settle detector (110ms debounce) + Lenis smooth glide (1150ms)
  await new Promise(r => setTimeout(r, 1600));

  const afterHalfwayScrollY = await page.evaluate(() => window.scrollY);
  const halfwayDiff = Math.abs(afterHalfwayScrollY - explorerTop);
  console.log(`Halfway Auto-Scroll Result: settled=${afterHalfwayScrollY}, target=${explorerTop}, diff=${halfwayDiff}`);
  const halfwayAutoScrollSuccess = halfwayDiff <= 2;
  console.log(`Halfway Auto-Scroll Down Success: ${halfwayAutoScrollSuccess}`);

  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'centered_02_explorer.png') });
  console.log('Saved centered_02_explorer.png');

  console.log('\n--- TEST 5: Scroll Lock Down to Time Machine ---');
  await page.mouse.move(700, 450);
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const tmScrollY = await page.evaluate(() => window.scrollY);
  const tmTop = await page.evaluate(() => {
    const el = document.getElementById('time-machine');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });
  console.log(`Scroll to Time Machine: current=${tmScrollY}, target=${tmTop}, diff=${Math.abs(tmScrollY - tmTop)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'centered_03_time_machine.png') });
  console.log('Saved centered_03_time_machine.png');

  console.log('\n--- TEST 6: Scroll Lock Down to Labs ---');
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const labsScrollY = await page.evaluate(() => window.scrollY);
  const labsTop = await page.evaluate(() => {
    const el = document.getElementById('labs');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });
  console.log(`Scroll to Labs: current=${labsScrollY}, target=${labsTop}, diff=${Math.abs(labsScrollY - labsTop)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'centered_04_labs.png') });
  console.log('Saved centered_04_labs.png');

  console.log('\n--- TEST 7: Scroll Lock Down to Mission ---');
  await page.mouse.wheel({ deltaY: 120 });
  await new Promise(r => setTimeout(r, 1600));

  const missionScrollY = await page.evaluate(() => window.scrollY);
  const missionTop = await page.evaluate(() => {
    const el = document.getElementById('mission');
    return el ? Math.max(0, el.offsetTop - 70) : 0;
  });
  console.log(`Scroll to Mission: current=${missionScrollY}, target=${missionTop}, diff=${Math.abs(missionScrollY - missionTop)}`);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'centered_05_mission.png') });
  console.log('Saved centered_05_mission.png');

  const finalSummary = {
    separatorAudit,
    alignmentAudit,
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

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'centered_scroll_lock_results.json'), JSON.stringify(finalSummary, null, 2));
  console.log('Saved centered_scroll_lock_results.json');

  await browser.close();
  console.log('--- VERIFICATION COMPLETE ---');
})();
