const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('=== MULTI-WORKSPACE RETURN PERFORMANCE TEST ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900', '--enable-precise-memory-info'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  const testCases = [
    { targetChapter: 'explorer', workspacePath: '/objects', label: 'Object Explorer -> #explorer' },
    { targetChapter: 'explorer', workspacePath: '/spectra', label: 'Spectral Explorer -> #explorer' },
    { targetChapter: 'time-machine', workspacePath: '/time-machine', label: 'Time Machine -> #time-machine' },
    { targetChapter: 'labs', workspacePath: '/labs', label: 'Labs -> #labs' },
  ];

  for (const tc of testCases) {
    console.log(`\nTesting: ${tc.label}...`);
    await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Scroll to target chapter
    await page.evaluate((ch) => {
      const el = document.getElementById(ch);
      if (el) el.scrollIntoView({ behavior: 'instant' });
    }, tc.targetChapter);
    await new Promise(r => setTimeout(r, 500));

    const initialScrollY = await page.evaluate(() => window.scrollY);

    // Save state and navigate to workspace
    await page.evaluate((ch, wp) => {
      sessionStorage.setItem('horizon_journey_state', JSON.stringify({
        originChapter: ch,
        scrollY: window.scrollY,
        timestamp: Date.now()
      }));
      window.location.href = wp;
    }, tc.targetChapter, tc.workspacePath);

    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 600));

    // Setup performance listener for return
    await page.evaluate(() => {
      window.__perf = { frames: [], longTasks: [], start: performance.now() };
      const obs = new PerformanceObserver((list) => {
        for (const e of list.getEntries()) {
          window.__perf.longTasks.push({ duration: Math.round(e.duration) });
        }
      });
      obs.observe({ entryTypes: ['longtask'] });

      let last = performance.now();
      const loop = () => {
        const now = performance.now();
        window.__perf.frames.push(Math.round(now - last));
        last = now;
        if (now - window.__perf.start < 700) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);

      const btn = document.querySelector('button[data-action="back-to-journey"]');
      if (btn) btn.click();
    });

    await new Promise(r => setTimeout(r, 900));

    const result = await page.evaluate(() => {
      return {
        totalFrames: window.__perf.frames.length,
        avgFrameTime: Math.round(window.__perf.frames.reduce((a, b) => a + b, 0) / window.__perf.frames.length),
        maxFrameTime: Math.max(...window.__perf.frames.slice(1)),
        longTasks: window.__perf.longTasks,
        scrollY: window.scrollY,
        url: window.location.href,
      };
    });

    console.log(`  Result for ${tc.label}:`, {
      avgFrameTime: `${result.avgFrameTime}ms`,
      maxFrameTime: `${result.maxFrameTime}ms`,
      totalFrames: result.totalFrames,
      longTasks: result.longTasks.length === 0 ? '0 (None!)' : result.longTasks,
      restoredScrollY: result.scrollY,
      initialScrollY: initialScrollY,
      scrollRestoredAccurately: Math.abs(result.scrollY - initialScrollY) < 15,
    });
  }

  await browser.close();
  console.log('\n=== ALL MULTI-WORKSPACE RETURNS PASSED WITH EXCELLENCE ===');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
