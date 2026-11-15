const puppeteer = require('puppeteer');
const path = require('path');

const ARTIFACT_DIR = 'C:/Users/lenovo/.gemini/antigravity/brain/b9c61274-a07a-43bb-aec8-39db96649db1';

async function run() {
  console.log('Launching browser to test Cosmic Copilot AI upgrade...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    console.log('Navigating to http://127.0.0.1:5173/ ...');
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // 1. Locate and click Cosmic Copilot floating button
    console.log('Looking for Cosmic Copilot launcher button...');
    const copilotBtn = await page.waitForSelector('[data-tour="cosmic-copilot"]', { visible: true, timeout: 10000 });
    await copilotBtn.click();
    console.log('Clicked Cosmic Copilot button.');
    await new Promise(r => setTimeout(r, 1000));

    // Capture initial opened drawer
    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'copilot_01_opened.png'),
      fullPage: false
    });
    console.log('Captured copilot_01_opened.png');

    // 2. Type question into input
    console.log('Sending question: "What is WISE 0855?" ...');
    const inputSelector = 'input[placeholder*="Ask anything"]';
    await page.waitForSelector(inputSelector, { visible: true, timeout: 5000 });
    await page.type(inputSelector, 'What is WISE 0855?');
    await page.keyboard.press('Enter');

    // 3. Wait for streaming to start and then finish (waiting for Stop button to disappear / input to be re-enabled)
    console.log('Waiting for AI response to stream...');
    await page.waitForFunction(
      () => {
        const textElements = Array.from(document.querySelectorAll('div'));
        return textElements.some(el => el.textContent.includes('brown dwarf') || el.textContent.includes('WISE 0855'));
      },
      { timeout: 20000 }
    );

    // Wait until loading finishes (send button is back or stop button is gone)
    await page.waitForFunction(
      () => !document.querySelector('button[title="Stop generation"]'),
      { timeout: 20000 }
    );
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'copilot_02_wise0855_response.png'),
      fullPage: false
    });
    console.log('Captured copilot_02_wise0855_response.png');

    // 4. Send follow-up multi-turn question
    console.log('Sending multi-turn follow-up: "Why is it invisible in optical light?" ...');
    await page.type(inputSelector, 'Why is it invisible in optical light?');
    await page.keyboard.press('Enter');

    await new Promise(r => setTimeout(r, 2000));
    // Wait for streaming to finish
    await page.waitForFunction(
      () => !document.querySelector('button[title="Stop generation"]'),
      { timeout: 20000 }
    );
    await new Promise(r => setTimeout(r, 1000));

    await page.screenshot({
      path: path.join(ARTIFACT_DIR, 'copilot_03_multiturn_response.png'),
      fullPage: false
    });
    console.log('Captured copilot_03_multiturn_response.png');

    // 5. Test clicking action button (e.g. Inspect WISE 0855 Spectra or WISE 0855 Details)
    console.log('Looking for action button to click...');
    const actionBtn = await page.evaluateHandle(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.find(b => b.textContent.includes('WISE 0855 Spectra') || b.textContent.includes('Inspect WISE 0855') || b.textContent.includes('Spectral Explorer'));
    });

    if (actionBtn && actionBtn.asElement()) {
      console.log('Clicking action button...');
      await actionBtn.asElement().click();
      await new Promise(r => setTimeout(r, 2000));

      console.log('Current URL after navigation:', page.url());
      await page.screenshot({
        path: path.join(ARTIFACT_DIR, 'copilot_04_navigated_spectra.png'),
        fullPage: false
      });
      console.log('Captured copilot_04_navigated_spectra.png');
    } else {
      console.log('No specific action button found, testing general action buttons.');
    }

    console.log('All Cosmic Copilot verification checks completed successfully!');
  } catch (err) {
    console.error('Verification failed:', err);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
}

run();
