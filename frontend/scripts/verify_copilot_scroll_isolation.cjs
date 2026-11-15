const puppeteer = require('puppeteer');

async function testScrollIsolation() {
  console.log('Testing Cosmic Copilot scroll isolation with Lenis...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  try {
    await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));

    // Initial page scroll position
    const initialWindowY = await page.evaluate(() => window.scrollY);
    console.log('Initial window.scrollY:', initialWindowY);

    // Open Copilot
    const copilotBtn = await page.waitForSelector('[data-tour="cosmic-copilot"]', { visible: true });
    await copilotBtn.click();
    await new Promise(r => setTimeout(r, 1000));

    // Locate the chat scroll container with [data-lenis-prevent]
    const scrollContainer = await page.$('[data-lenis-prevent]');
    if (!scrollContainer) {
      throw new Error('Chat container missing data-lenis-prevent attribute!');
    }

    // Hover over the chat container and perform wheel scrolling
    const box = await scrollContainer.boundingBox();
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);

    // Dispatch wheel events inside Copilot
    for (let i = 0; i < 5; i++) {
      await page.mouse.wheel({ deltaY: 300 });
      await new Promise(r => setTimeout(r, 100));
    }

    const finalWindowY = await page.evaluate(() => window.scrollY);
    console.log('Final window.scrollY after chat wheeling:', finalWindowY);

    if (Math.abs(finalWindowY - initialWindowY) > 5) {
      throw new Error(`Window scrolled while wheeling inside Copilot! Delta: ${finalWindowY - initialWindowY}`);
    }

    console.log('SUCCESS: Window scroll remained locked during chat scrolling. Lenis scroll isolation verified!');
  } finally {
    await browser.close();
  }
}

testScrollIsolation();
