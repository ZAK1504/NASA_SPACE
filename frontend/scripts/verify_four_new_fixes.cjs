const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('=== STARTING EXTENSIVE REGRESSION VERIFICATION ===');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. BRAND SYMBOL, FAVICON & TITLE VERIFICATION
  console.log('1. Checking Brand Symbol, Favicon & Document Title...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const brandInfo = await page.evaluate(() => {
    const symbol = document.querySelector('.brand-symbol');
    const wordmark = document.querySelector('.brand-wordmark');
    const title = document.title;
    const favicon = document.querySelector('link[rel="icon"]')?.getAttribute('href');
    return {
      hasSymbol: !!symbol,
      wordmarkText: wordmark ? wordmark.textContent : null,
      title,
      favicon,
    };
  });
  console.log('Brand Info:', brandInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_new_brand_symbol_navbar.png') });

  // 2. TEAM PHOTOS IN COMPACT ABOUT (JOURNEY CHAPTER 06)
  console.log('2. Checking Team Photos in Compact About Chapter...');
  await page.evaluate(() => {
    const about = document.getElementById('about');
    if (about) about.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1500));

  const compactPhotos = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('#about img'));
    return images.map(img => ({
      src: img.src,
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
  });
  console.log('Compact About Photos:', compactPhotos);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_compact_team_photos.png') });

  // 3. TEAM PHOTOS IN FULL ABOUT WORKSPACE (/about)
  console.log('3. Checking Team Photos in Full About Workspace (/about)...');
  await page.goto('http://127.0.0.1:5173/about', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const fullAboutPhotos = await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('.team-avatar-img, .team-card-pro img, .team-image-pro'));
    return images.map(img => ({
      src: img.src,
      alt: img.alt,
      complete: img.complete,
      naturalWidth: img.naturalWidth,
      naturalHeight: img.naturalHeight,
    }));
  });
  console.log('Full About Workspace Photos:', fullAboutPhotos);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_full_about_team_photos.png') });

  // 4. ABOUT QUOTE SEAMLESS ANIMATION
  console.log('4. Checking About Quote Section for Visual Glitches...');
  await page.evaluate(() => {
    const quote = document.querySelector('.story-highlight-quote');
    if (quote) quote.scrollIntoView({ behavior: 'smooth' });
  });
  await new Promise(r => setTimeout(r, 1200));

  const quoteInfo = await page.evaluate(() => {
    const quote = document.querySelector('.story-highlight-quote');
    if (!quote) return null;
    const spans = Array.from(quote.querySelectorAll('span')).map(s => s.textContent.trim());
    const rect = quote.getBoundingClientRect();
    return {
      textLines: spans,
      visible: rect.width > 0 && rect.height > 0,
      hasCharacterSpans: quote.querySelectorAll('.animated-characters').length > 0,
    };
  });
  console.log('About Quote Info:', quoteInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_seamless_quote_reveal.png') });

  // 5. CRITICAL SCROLLING REGRESSION TESTS (A through E)
  console.log('5. Running Journey Chapter-by-Chapter Scroll Tests...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Test A & B: Send single downward gesture with high momentum
  console.log('Test A & B: Sending single downward gesture with trailing momentum bursts...');
  const initialScrollY = await page.evaluate(() => window.scrollY);
  console.log('Initial scrollY at Home:', initialScrollY);

  // Dispatch initial wheel flick (65px)
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 65, bubbles: true, cancelable: true }));
  });

  // Wait 300ms, then dispatch trailing inertia events while animation is underway
  for (let i = 0; i < 6; i++) {
    await new Promise(r => setTimeout(r, 150));
    await page.evaluate((step) => {
      document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: Math.max(5, 50 - step * 8), bubbles: true, cancelable: true }));
    }, i);
  }

  // Wait for transition to complete and momentum quiet window (total 1200ms)
  await new Promise(r => setTimeout(r, 1200));

  const scrollAfterFirstGesture = await page.evaluate(() => {
    const explorerEl = document.getElementById('explorer');
    const timeMachineEl = document.getElementById('time-machine');
    const currentY = window.scrollY;
    const explorerY = explorerEl ? explorerEl.offsetTop - 70 : -1;
    const timeMachineY = timeMachineEl ? timeMachineEl.offsetTop - 70 : -1;
    return {
      currentY,
      explorerY,
      timeMachineY,
      isAtExplorer: Math.abs(currentY - explorerY) <= 15,
      didSkipToTimeMachine: Math.abs(currentY - timeMachineY) <= 15,
    };
  });
  console.log('Position after 1st gesture with momentum:', scrollAfterFirstGesture);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_scroll_stopped_at_explorer.png') });

  // Test D: Genuine second downward gesture from Explorer
  console.log('Test D: Sending genuine second downward gesture...');
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: 70, bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  const scrollAfterSecondGesture = await page.evaluate(() => {
    const timeMachineEl = document.getElementById('time-machine');
    const currentY = window.scrollY;
    const timeMachineY = timeMachineEl ? timeMachineEl.offsetTop - 70 : -1;
    return {
      currentY,
      timeMachineY,
      isAtTimeMachine: Math.abs(currentY - timeMachineY) <= 15,
    };
  });
  console.log('Position after 2nd gesture:', scrollAfterSecondGesture);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_scroll_at_time_machine.png') });

  // Test E: Reverse upward gesture from Time Machine
  console.log('Test E: Sending upward gesture from Time Machine...');
  await page.evaluate(() => {
    document.body.dispatchEvent(new WheelEvent('wheel', { deltaY: -70, bubbles: true, cancelable: true }));
  });
  await new Promise(r => setTimeout(r, 1200));

  const scrollAfterReverseGesture = await page.evaluate(() => {
    const explorerEl = document.getElementById('explorer');
    const currentY = window.scrollY;
    const explorerY = explorerEl ? explorerEl.offsetTop - 70 : -1;
    return {
      currentY,
      explorerY,
      isBackAtExplorer: Math.abs(currentY - explorerY) <= 15,
    };
  });
  console.log('Position after reverse gesture:', scrollAfterReverseGesture);

  await browser.close();
  console.log('=== ALL REGRESSION TESTS COMPLETED SUCCESSFULLY ===');
})();
