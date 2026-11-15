const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  console.log('=== Performance Profiling of Page Transition & Return ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900', '--enable-precise-memory-info'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));

  // Scroll to explorer
  await page.evaluate(() => {
    const el = document.getElementById('explorer');
    if (el) el.scrollIntoView({ behavior: 'instant' });
  });
  await new Promise(r => setTimeout(r, 800));

  const startScrollY = await page.evaluate(() => window.scrollY);
  console.log(`Initial position: Explorer at scrollY = ${startScrollY}`);

  // Setup performance profiler in page
  await page.evaluate(() => {
    window.__perfData = {
      enterFrames: [],
      returnFrames: [],
      enterStartTime: 0,
      returnStartTime: 0,
      navEventTime: 0,
      longTasks: [],
    };

    // PerformanceObserver for long tasks
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        window.__perfData.longTasks.push({
          startTime: Math.round(entry.startTime),
          duration: Math.round(entry.duration),
          name: entry.name,
        });
      }
    });
    observer.observe({ entryTypes: ['longtask'] });
  });

  // Test 1: Enter Transition (Explorer -> Object Explorer)
  console.log('\nMeasuring Journey -> Scientific Workspace (Enter)...');
  await page.evaluate(() => {
    window.__perfData.enterStartTime = performance.now();
    let lastTime = performance.now();
    const track = () => {
      const now = performance.now();
      window.__perfData.enterFrames.push(Math.round(now - lastTime));
      lastTime = now;
      if (now - window.__perfData.enterStartTime < 750) {
        requestAnimationFrame(track);
      }
    };
    requestAnimationFrame(track);

    const btn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('Explore Objects'));
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 900));

  const enterMetrics = await page.evaluate(() => {
    return {
      totalFrames: window.__perfData.enterFrames.length,
      frames: window.__perfData.enterFrames.slice(1), // omit first frame delta
      avgFrameTime: Math.round(window.__perfData.enterFrames.reduce((a, b) => a + b, 0) / window.__perfData.enterFrames.length),
      maxFrameTime: Math.max(...window.__perfData.enterFrames.slice(1)),
      longTasks: window.__perfData.longTasks.slice(),
    };
  });
  console.log('Enter Metrics:', enterMetrics);

  // Clear long tasks for return measurement
  await page.evaluate(() => {
    window.__perfData.longTasks = [];
  });

  // Test 2: Return Transition (Object Explorer -> Journey)
  console.log('\nMeasuring Scientific Workspace -> Journey (Return)...');
  await page.evaluate(() => {
    window.__perfData.returnStartTime = performance.now();
    let lastTime = performance.now();
    const track = () => {
      const now = performance.now();
      window.__perfData.returnFrames.push(Math.round(now - lastTime));
      lastTime = now;
      if (now - window.__perfData.returnStartTime < 750) {
        requestAnimationFrame(track);
      }
    };
    requestAnimationFrame(track);

    const backBtn = document.querySelector('button[data-action="back-to-journey"]');
    if (backBtn) backBtn.click();
  });

  await new Promise(r => setTimeout(r, 900));

  const returnMetrics = await page.evaluate(() => {
    return {
      totalFrames: window.__perfData.returnFrames.length,
      frames: window.__perfData.returnFrames.slice(1),
      avgFrameTime: Math.round(window.__perfData.returnFrames.reduce((a, b) => a + b, 0) / window.__perfData.returnFrames.length),
      maxFrameTime: Math.max(...window.__perfData.returnFrames.slice(1)),
      longTasks: window.__perfData.longTasks.slice(),
      finalUrl: window.location.href,
      finalScrollY: window.scrollY,
    };
  });
  console.log('Return Metrics:', returnMetrics);

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
