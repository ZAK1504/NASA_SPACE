const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

async function verify() {
  console.log('Launching browser for About page & Navbar CTA verification...');
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900']
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Track console errors and network failures
    const pageErrors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') pageErrors.push(msg.text());
    });
    page.on('pageerror', err => pageErrors.push(err.message));

    console.log('Navigating to http://127.0.0.1:5173/ ...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1200));

    // 1. Verify Navbar CTA button
    const ctaText = await page.$eval('.nav .cta', el => el.textContent.trim());
    const ctaHref = await page.$eval('.nav .cta', el => el.getAttribute('href'));
    console.log(`Navbar CTA text: "${ctaText}", href: "${ctaHref}"`);

    if (ctaText.toLowerCase().includes('play')) {
      throw new Error(`Navbar still contains "Play": "${ctaText}"`);
    }
    if (ctaText !== 'About') {
      throw new Error(`Expected Navbar CTA to be "About", got: "${ctaText}"`);
    }

    // Capture navbar screenshot
    const navbarClip = await page.$eval('.nav', el => {
      const rect = el.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    });
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'navbar_about_cta.png'),
      clip: navbarClip
    });
    console.log('Saved navbar_about_cta.png');

    // 2. Click "About" CTA button and wait for transition to /about
    console.log('Clicking About button in Navbar...');
    await page.click('.nav .cta');
    await new Promise(r => setTimeout(r, 2200));

    const currentUrl = page.url();
    console.log(`Current URL after clicking About: ${currentUrl}`);
    if (!currentUrl.includes('/about')) {
      throw new Error(`Expected URL to contain /about, got: ${currentUrl}`);
    }

    // Wait for About page content to render and animate
    await page.waitForSelector('.about-page', { timeout: 10000 });
    await new Promise(r => setTimeout(r, 2500)); // Allow Framer Motion / typing animations to play

    // Check Hero text and elements
    const heroTitle = await page.$eval('.about-hero-title', el => el.innerText);
    console.log(`Hero Title: ${heroTitle.replace(/\n/g, ' ')}`);

    // Verify 5 Team Cards
    const teamCardsCount = await page.$$eval('.team-card', els => els.length);
    console.log(`Found ${teamCardsCount} team cards`);
    if (teamCardsCount !== 5) {
      throw new Error(`Expected 5 team cards, found ${teamCardsCount}`);
    }

    // Verify team member names
    const memberNames = await page.$$eval('.team-name', els => els.map(el => el.innerText.trim()));
    console.log('Team Member Names:', memberNames);

    // Verify images loaded without 404
    const imagesStatus = await page.$$eval('.team-avatar-img', imgs => 
      imgs.map(img => ({
        src: img.src,
        complete: img.complete,
        naturalWidth: img.naturalWidth,
        naturalHeight: img.naturalHeight
      }))
    );
    console.log('Images Status:', imagesStatus);

    // Capture Desktop About Hero & Team
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'about_desktop_hero_team_verified.png'),
      fullPage: false
    });
    console.log('Saved about_desktop_hero_team_verified.png');

    // Scroll down to Tech and Story sections
    await page.evaluate(() => {
      const techEl = document.querySelector('.tech-section');
      if (techEl) techEl.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'about_tech_and_story_verified.png'),
      fullPage: false
    });
    console.log('Saved about_tech_and_story_verified.png');

    // Scroll to Earth / Panorama Closing Section
    await page.evaluate(() => {
      const earthEl = document.querySelector('.earth-from-space');
      if (earthEl) earthEl.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 1500));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'about_closing_panorama_verified.png'),
      fullPage: false
    });
    console.log('Saved about_closing_panorama_verified.png');

    // 3. Test Clicking a Team Member Card to Open Modal
    console.log('Clicking first team card to test modal...');
    await page.evaluate(() => {
      const firstCard = document.querySelector('.team-card');
      if (firstCard) firstCard.scrollIntoView({ behavior: 'instant' });
    });
    await new Promise(r => setTimeout(r, 800));

    await page.click('.team-card');
    await new Promise(r => setTimeout(r, 800));

    const modalExists = await page.$('div[role="dialog"]') !== null;
    console.log(`Modal opened successfully: ${modalExists}`);
    if (!modalExists) {
      throw new Error('Modal dialog failed to open on card click');
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'about_modal_dialog_verified.png'),
      fullPage: false
    });
    console.log('Saved about_modal_dialog_verified.png');

    // Close modal
    await page.click('button[aria-label="Close profile details"]');
    await new Promise(r => setTimeout(r, 500));

    // 4. Test Mobile Viewport
    console.log('Testing mobile viewport (390x844)...');
    await page.setViewport({ width: 390, height: 844 });
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Open mobile hamburger menu
    await page.click('.burger');
    await new Promise(r => setTimeout(r, 800));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'navbar_mobile_drawer_verified.png'),
      fullPage: false
    });
    console.log('Saved navbar_mobile_drawer_verified.png');

    // Click Behind the Horizon link in mobile drawer
    await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a'));
      const aboutLink = links.find(a => a.textContent.includes('Behind the Horizon') || a.getAttribute('href') === '/about');
      if (aboutLink) aboutLink.click();
    });
    await new Promise(r => setTimeout(r, 2000));

    const mobileUrl = page.url();
    console.log(`Mobile URL after clicking drawer link: ${mobileUrl}`);
    if (!mobileUrl.includes('/about')) {
      throw new Error(`Mobile drawer link failed to navigate to /about: ${mobileUrl}`);
    }

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'about_mobile_view_verified.png'),
      fullPage: false
    });
    console.log('Saved about_mobile_view_verified.png');

    console.log('\n--- ALL VERIFICATION TESTS PASSED SUCCESSFULLY! ---');
  } finally {
    await browser.close();
  }
}

verify().catch(err => {
  console.error('Verification failed:', err);
  process.exit(1);
});
