const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const ARTIFACT_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('=== STARTING ULTRA-SMOOTH SCROLL & SPACECRAFT STABILITY TEST SUITE ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('error') || text.includes('warning') || text.includes('Satellite3D')) {
      console.log('PAGE LOG:', text);
    }
  });

  // 1. BRAND REFINEMENT VERIFICATION
  console.log('\n--- 1. Testing Brand Wordmark Refinement ---');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const brandMetrics = await page.evaluate(() => {
    const sphereEl = document.querySelector('.wordmark-sphere');
    const xplorerEl = document.querySelector('.wordmark-xplorer');
    if (!sphereEl || !xplorerEl) return null;
    const sphereRect = sphereEl.getBoundingClientRect();
    const xplorerRect = xplorerEl.getBoundingClientRect();
    const sphereComputed = window.getComputedStyle(sphereEl);
    const xplorerComputed = window.getComputedStyle(xplorerEl);
    return {
      sphereFontSize: sphereComputed.fontSize,
      xplorerFontSize: xplorerComputed.fontSize,
      sphereWidth: Math.round(sphereRect.width),
      xplorerWidth: Math.round(xplorerRect.width),
      sphereRight: Math.round(sphereRect.right),
      xplorerLeft: Math.round(xplorerRect.left),
      gap: Math.round(xplorerRect.left - sphereRect.right),
      sphereText: sphereEl.textContent.trim(),
      xplorerText: xplorerEl.textContent.trim(),
    };
  });
  console.log('Brand Wordmark Metrics:', brandMetrics);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_refined_spherexplorer_wordmark.png') });

  // 2. TEST A: SMALL MOUSE WHEEL INPUT (SINGLE NOTCH)
  console.log('\n--- 2. Test A: Single Gentle Mouse-Wheel Notch (deltaY: 22) ---');
  const scroll0 = await page.evaluate(() => window.scrollY);
  console.log('Initial scroll at Home:', scroll0);

  // Dispatch a single small wheel event (deltaY = 22)
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 22, bubbles: true, cancelable: true }));
  });

  // Wait 800ms for transition (duration is 620ms)
  await new Promise(r => setTimeout(r, 850));

  const scrollAtExplorer = await page.evaluate(() => window.scrollY);
  console.log('Scroll position after single 22px notch:', scrollAtExplorer, '(Expected: 760 at Explorer)');
  const testAPassed = Math.abs(scrollAtExplorer - 760) <= 5;
  console.log('Test A Passed:', testAPassed);

  // 3. TEST B: SMALL TRACKPAD SWIPE
  console.log('\n--- 3. Test B: Small Trackpad Gesture from Explorer to Time Machine ---');
  // Dispatch a short swipe of 2 small events (8 + 14 = 22)
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 8, bubbles: true, cancelable: true }));
    setTimeout(() => {
      document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 14, bubbles: true, cancelable: true }));
    }, 20);
  });
  await new Promise(r => setTimeout(r, 850));

  const scrollAtTimeMachine = await page.evaluate(() => window.scrollY);
  console.log('Scroll position after small swipe:', scrollAtTimeMachine, '(Expected: 1590 at Time Machine)');
  const testBPassed = Math.abs(scrollAtTimeMachine - 1590) <= 5;
  console.log('Test B Passed:', testBPassed);

  // 4. TEST C & D: LARGE WHEEL DELTA & RESIDUAL MOMENTUM
  console.log('\n--- 4. Test C & D: Large Wheel Delta with Decreasing Inertia Stream ---');
  // Dispatch a massive downward flick (deltaY: 250) + trailing inertia
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 250, bubbles: true, cancelable: true }));
  });

  for (let i = 0; i < 5; i++) {
    await new Promise(r => setTimeout(r, 120));
    await page.evaluate((step) => {
      document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: Math.max(3, 40 - step * 8), bubbles: true, cancelable: true }));
    }, i);
  }

  await new Promise(r => setTimeout(r, 850));

  const scrollAtLabs = await page.evaluate(() => window.scrollY);
  console.log('Scroll position after large flick + momentum:', scrollAtLabs, '(Expected: 2420 at Labs)');
  const testCPassed = Math.abs(scrollAtLabs - 2420) <= 5;
  console.log('Test C & D Passed (Stopped strictly at Labs without skipping):', testCPassed);

  // 5. TEST E: REVERSE SCROLLING BACK TO HOME
  console.log('\n--- 5. Test E: Reverse Upward Gesture ---');
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: -25, bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 850));
  const backToTM = await page.evaluate(() => window.scrollY);
  console.log('Scroll after upward gesture:', backToTM, '(Expected: 1590)');

  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: -25, bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 850));
  const backToExplorer = await page.evaluate(() => window.scrollY);
  console.log('Scroll after upward gesture:', backToExplorer, '(Expected: 760)');

  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: -25, bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 850));
  const backToHome = await page.evaluate(() => window.scrollY);
  console.log('Scroll back at Home:', backToHome, '(Expected: 0)');

  // 6. TEST F: WHEEL SCROLLING DIRECTLY OVER THE 3D SPACECRAFT
  console.log('\n--- 6. Test F: Wheel Scrolling Over 3D Spacecraft Canvas ---');
  const spacecraftOverScrolled = await page.evaluate(() => {
    const canvas = document.querySelector('.satellite-canvas canvas') || document.querySelector('.satellite-canvas');
    if (!canvas) return false;
    canvas.dispatchEvent(new WheelEvent('wheel', { deltaY: 28, bubbles: true, cancelable: true }));
    return true;
  });
  console.log('Dispatched wheel directly on spacecraft canvas:', spacecraftOverScrolled);
  await new Promise(r => setTimeout(r, 850));

  const scrollFromSpacecraft = await page.evaluate(() => window.scrollY);
  console.log('Scroll position after scrolling over spacecraft:', scrollFromSpacecraft, '(Expected: 760)');
  const testFPassed = Math.abs(scrollFromSpacecraft - 760) <= 5;
  console.log('Test F (Spacecraft does not trap wheel scroll) Passed:', testFPassed);

  // Return to Home for Spacecraft Dragging tests
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: -30, bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 850));

  // 7. TEST G: SPACECRAFT INTERACTION & DRAGGING
  console.log('\n--- 7. Test G: 3D Spacecraft Dragging & Interaction Recovery ---');
  const canvasHandle = await page.$('.satellite-canvas canvas');
  console.log('Found spacecraft canvas:', !!canvasHandle);

  if (canvasHandle) {
    const box = await canvasHandle.boundingBox();
    console.log('Spacecraft canvas bounding box:', box);

    // Initial drag simulation
    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();
    for (let i = 0; i < 5; i++) {
      await page.mouse.move(startX + i * 20, startY + i * 5);
      await new Promise(r => setTimeout(r, 30));
    }
    await page.mouse.up();
    console.log('Completed smooth user drag on spacecraft');
    await new Promise(r => setTimeout(r, 500));

    // Test interrupted drag (mouse down, move outside, release)
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(box.x - 50, startY); // Drag outside canvas
    await page.mouse.up();
    console.log('Completed drag-outside-canvas simulation');
    await new Promise(r => setTimeout(r, 500));

    // Verify spacecraft is still rendering and animating
    const isAnimating = await page.evaluate(() => {
      const container = document.querySelector('.satellite-canvas');
      return !!container && container.clientHeight > 0;
    });
    console.log('Spacecraft container active & visible:', isAnimating);
  }

  // 8. FULL SIX-CHAPTER TRAVERSAL
  console.log('\n--- 8. Full 6-Chapter Seamless Traversal ---');
  const chapters = ['home', 'explorer', 'time-machine', 'labs', 'mission', 'about'];
  const results = [];

  for (let i = 1; i < chapters.length; i++) {
    await page.evaluate(() => {
      document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 26, bubbles: true, cancelable: true }));
    });
    await new Promise(r => setTimeout(r, 800));
    const y = await page.evaluate(() => window.scrollY);
    const expectedTarget = await page.evaluate((chId) => {
      const el = document.getElementById(chId);
      return el ? el.offsetTop - 70 : -1;
    }, chapters[i]);
    results.push({ chapter: chapters[i], y, expectedTarget, match: Math.abs(y - expectedTarget) <= 10 });
  }
  console.log('Traversal Results (Home -> About):', results);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_six_chapter_smooth_traversal.png') });

  await browser.close();
  console.log('\n=== ALL ULTRA-SMOOTH VERIFICATION TESTS COMPLETED ===');
})();
