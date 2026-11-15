const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  console.log('=== VERIFYING MISSION 03 DETAIL WORKFLOW ===');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // Clear localStorage
  await page.goto('http://127.0.0.1:5173/missions', { waitUntil: 'networkidle2' });
  await page.evaluate(() => localStorage.removeItem('spherex_mission_progress_v1'));

  // Navigate directly to Mission 03
  await page.goto('http://127.0.0.1:5173/missions/changing-star', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const stage1 = await page.evaluate(() => {
    return {
      title: document.querySelector('h1')?.textContent,
      stageTitle: document.querySelector('h2')?.textContent,
      stepIndicator: document.body.innerText.includes('Step 1 of 5'),
      statusBadge: document.body.innerText.includes('In Progress'),
    };
  });
  console.log('Stage 1:', stage1);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_m3_stage1_direct.png') });

  // Click Next Step
  console.log('Clicking Next Step -> Stage 2...');
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const stage2 = await page.evaluate(() => {
    return {
      stageTitle: document.querySelector('h2')?.textContent,
      stepIndicator: document.body.innerText.includes('Step 2 of 5'),
    };
  });
  console.log('Stage 2:', stage2);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_m3_stage2_direct.png') });

  // Click Next Step -> Stage 3
  console.log('Clicking Next Step -> Stage 3...');
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const stage3 = await page.evaluate(() => {
    return {
      stageTitle: document.querySelector('h2')?.textContent,
      stepIndicator: document.body.innerText.includes('Step 3 of 5'),
    };
  });
  console.log('Stage 3:', stage3);

  // Click Next Step -> Stage 4 (Quiz)
  console.log('Clicking Next Step -> Stage 4 (Quiz)...');
  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const stage4 = await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('A.') || b.textContent.includes('B.'));
    return {
      stageTitle: document.querySelector('h2')?.textContent,
      stepIndicator: document.body.innerText.includes('Step 4 of 5'),
      optionsCount: options.length,
    };
  });
  console.log('Stage 4 Quiz:', stage4);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_m3_stage4_quiz.png') });

  // Submit correct quiz answer and advance to Stage 5
  await page.evaluate(() => {
    const options = Array.from(document.querySelectorAll('button')).filter(b => b.textContent.includes('A.'));
    if (options[0]) options[0].click();
    const submitBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Submit Answer'));
    if (submitBtn) submitBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  await page.evaluate(() => {
    const nextBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Next Step'));
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  const stage5 = await page.evaluate(() => {
    return {
      stageTitle: document.querySelector('h3')?.textContent || document.querySelector('h2')?.textContent,
      stepIndicator: document.body.innerText.includes('Step 5 of 5'),
      isCompleted: document.body.innerText.includes('Completed') || document.body.innerText.includes('Complete & Return'),
    };
  });
  console.log('Stage 5 Completion:', stage5);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_m3_stage5_completion.png') });

  // Click Complete & Return
  await page.evaluate(() => {
    const returnBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent.includes('Complete & Return'));
    if (returnBtn) returnBtn.click();
  });
  await new Promise(r => setTimeout(r, 1500));

  // Check catalog
  const catalogStatus = await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('[data-tour="missions-catalog"] > div'));
    return cards.map(c => ({
      title: c.querySelector('h3')?.textContent,
      hasCompleted: c.innerText.includes('Completed'),
      hasNotStarted: c.innerText.includes('Not Started'),
    }));
  });
  console.log('Catalog after Mission 03 completion:', catalogStatus);
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'verified_m3_catalog_completed.png') });

  await browser.close();
  console.log('=== MISSION 03 DETAIL VERIFICATION COMPLETED ===');
})();
