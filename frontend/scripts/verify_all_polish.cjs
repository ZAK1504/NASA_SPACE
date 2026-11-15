const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const ARTIFACT_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('=== STARTING COMPLETE POLISH VERIFICATION ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. VERIFY HOME PAGE & NAVBAR WORDMARK
  console.log('1. Checking Home Page & Brand Wordmark...');
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const wordmarkInfo = await page.evaluate(() => {
    const wm = document.querySelector('.brand-wordmark');
    if (!wm) return null;
    const sphere = wm.querySelector('.wordmark-sphere');
    const xplorer = wm.querySelector('.wordmark-xplorer');
    return {
      text: wm.textContent,
      sphereColor: sphere ? window.getComputedStyle(sphere).color : null,
      xplorerColor: xplorer ? window.getComputedStyle(xplorer).color : null,
      sphereMarginRight: sphere ? window.getComputedStyle(sphere).marginRight : null,
    };
  });
  console.log('Wordmark info:', wordmarkInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_home_wordmark.png') });

  // 2. VERIFY CHAPTER 06 (ABOUT) IN MAIN JOURNEY
  console.log('2. Scrolling to Chapter 06 (About) in Journey...');
  await page.evaluate(() => {
    const about = document.getElementById('about');
    if (about) about.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1500));

  const chapterAboutInfo = await page.evaluate(() => {
    const about = document.getElementById('about');
    if (!about) return null;
    const tag = about.querySelector('p');
    const hasFinalistBadge = document.body.innerText.includes('NASA Space Apps 2025 Global Finalists');
    return {
      chapterTag: tag ? tag.textContent.trim() : null,
      hasFinalistBadge,
    };
  });
  console.log('Chapter About info:', chapterAboutInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_chapter_about_journey.png') });

  // 3. VERIFY STORYBOOK VIEWPORT HEIGHT (/story)
  console.log('3. Checking Storybook iframe height at /story...');
  await page.goto('http://127.0.0.1:5173/story', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const storyInfo = await page.evaluate(() => {
    const iframe = document.querySelector('.storybook-frame') || document.querySelector('iframe');
    if (!iframe) return null;
    const rect = iframe.getBoundingClientRect();
    return {
      iframeWidth: rect.width,
      iframeHeight: rect.height,
      src: iframe.getAttribute('src'),
    };
  });
  console.log('Storybook iframe info:', storyInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_storybook_full_height.png') });

  // 4. VERIFY FULL ABOUT WORKSPACE (/about)
  console.log('4. Checking Full About Workspace at /about...');
  await page.goto('http://127.0.0.1:5173/about', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const aboutWorkspaceInfo = await page.evaluate(() => {
    const headerTourBtn = Array.from(document.querySelectorAll('header button, nav button'))
      .find(b => b.textContent.includes('Tour'));
    const heroTitle = document.querySelector('.about-hero-title')?.textContent;
    const statCards = Array.from(document.querySelectorAll('.hero-stat-card')).map(c => c.textContent.trim());
    const hasTop45 = document.body.innerText.includes('TOP 45');
    const storyPara = document.querySelector('.story-paragraph-pro');
    const storyTextAlign = storyPara ? window.getComputedStyle(storyPara).textAlign : null;

    return {
      hasHeaderTourButton: !!headerTourBtn,
      heroTitle,
      statCards,
      hasTop45,
      storyParagraphTextAlign: storyTextAlign,
    };
  });
  console.log('About Workspace info:', aboutWorkspaceInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_about_hero_and_stats.png') });

  // Scroll to About Finale
  await page.evaluate(() => {
    const finale = document.querySelector('.about-finale') || document.querySelector('.earth-from-space');
    if (finale) finale.scrollIntoView();
  });
  await new Promise(r => setTimeout(r, 1500));
  const finaleInfo = await page.evaluate(() => {
    const finale = document.querySelector('.about-finale') || document.querySelector('.earth-from-space');
    if (!finale) return null;
    const rect = finale.getBoundingClientRect();
    const title = finale.querySelector('h2')?.textContent;
    const buttons = Array.from(finale.querySelectorAll('button')).map(b => b.textContent.trim());
    return {
      height: rect.height,
      title,
      buttons,
    };
  });
  console.log('About Finale info:', finaleInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_about_full_bleed_finale.png') });

  // 5. VERIFY MISSIONS (/missions)
  console.log('5. Checking Guided Missions at /missions...');
  // Clear any existing localStorage progress to test fresh visitor experience
  await page.evaluate(() => localStorage.removeItem('spherex_mission_progress_v1'));
  await page.goto('http://127.0.0.1:5173/missions', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const missionsCatalogInfo = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-tour="missions-catalog"] > div'));
    return cards.map(c => {
      const title = c.querySelector('h3')?.textContent;
      const subtitle = c.querySelector('.font-mono')?.textContent;
      const badges = Array.from(c.querySelectorAll('span, .badge')).map(b => b.textContent.trim());
      const hasCompleted = badges.some(b => b.includes('Completed'));
      const hasNotStarted = badges.some(b => b.includes('Not Started'));
      return { title, subtitle, hasCompleted, hasNotStarted };
    });
  });
  console.log('Missions Catalog initial states:', missionsCatalogInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_missions_catalog_fresh.png') });

  // Enter Mission 03 (changing-star)
  console.log('Entering Mission 03 (A Star That Changes)...');
  await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-tour="missions-catalog"] > div'));
    const mission3Card = cards.find(c => c.innerText.includes('Mission 03'));
    const btn = mission3Card ? Array.from(mission3Card.querySelectorAll('button')).find(b => b.textContent.includes('Launch Mission')) : null;
    if (btn) btn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  const mission3StageInfo = await page.evaluate(() => {
    const stepText = document.body.innerText;
    const title = document.querySelector('h1')?.textContent;
    const stageTitle = document.querySelector('h2')?.textContent;
    const hasNextBtn = Array.from(document.querySelectorAll('button')).some(b => b.textContent.includes('Next Step'));
    return {
      title,
      stageTitle,
      stepIndicatorFound: stepText.includes('Step 1 of 5'),
      hasNextStepButton: hasNextBtn,
    };
  });
  console.log('Mission 03 Stage 1 info:', mission3StageInfo);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_mission3_stage1.png') });

  // Advance to Stage 2
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const mission3Stage2Info = await page.evaluate(() => {
    const stageTitle = document.querySelector('h2')?.textContent;
    const isStep2 = document.body.innerText.includes('Step 2 of 5');
    return { stageTitle, isStep2 };
  });
  console.log('Mission 03 Stage 2 info:', mission3Stage2Info);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_mission3_stage2.png') });

  // Return to All Missions catalog and verify status is now "In Progress"
  await page.goto('http://127.0.0.1:5173/missions', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1000));
  const mission3UpdatedCatalog = await page.evaluate(() => {
    return document.body.innerText.includes('In Progress') || document.body.innerText.includes('Step 2/5');
  });
  console.log('Mission 03 shows In Progress in catalog:', mission3UpdatedCatalog);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_missions_in_progress.png') });

  await browser.close();
  console.log('=== ALL POLISH VERIFICATIONS COMPLETED SUCCESSFULLY ===');
})();
