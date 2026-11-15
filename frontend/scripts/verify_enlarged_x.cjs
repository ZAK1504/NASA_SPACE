const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\lenovo\\.gemini\\antigravity\\brain\\b9c61274-a07a-43bb-aec8-39db96649db1';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  // 1. Capture Navbar Brand
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));

  const navBrand = await page.$('.brand');
  if (navBrand) {
    await navBrand.screenshot({ path: path.join(ARTIFACT_DIR, 'nav_brand_enlarged_x.png') });
    console.log('Saved nav_brand_enlarged_x.png');
  }

  // Measure font sizes in Nav
  const navFontMetrics = await page.evaluate(() => {
    const brand = document.querySelector('.brand');
    if (!brand) return null;
    const sphereSpan = brand.querySelector('span > span:first-child');
    const xSpan = brand.querySelector('span > span:nth-child(2)');
    return {
      sphereFontSize: sphereSpan ? window.getComputedStyle(sphereSpan).fontSize : null,
      xFontSize: xSpan ? window.getComputedStyle(xSpan).fontSize : null,
      xText: xSpan ? xSpan.textContent : null,
    };
  });
  console.log('Nav Font Metrics:', navFontMetrics);

  // 2. Capture About Page
  await page.goto('http://127.0.0.1:5173/about', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1200));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'about_page_enlarged_x.png') });
  console.log('Saved about_page_enlarged_x.png');

  const aboutMetrics = await page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const xSpan = h1 ? h1.querySelector('span:nth-child(2)') : null;
    return {
      h1Text: h1 ? h1.textContent : null,
      xFontSize: xSpan ? window.getComputedStyle(xSpan).fontSize : null,
    };
  });
  console.log('About Metrics:', aboutMetrics);

  await browser.close();
})();
