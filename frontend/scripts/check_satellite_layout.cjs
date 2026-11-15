const puppeteer = require('puppeteer-core');
const fs = require('fs');
const path = require('path');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

(async () => {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  await page.goto('http://127.0.0.1:5173/', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  const serializeRect = (r) => {
    if (!r) return null;
    return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
  };

  const metrics = await page.evaluate(() => {
    const serialize = (el) => {
      if (!el) return null;
      const r = el.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width), height: Math.round(r.height) };
    };

    const home = document.getElementById('home');
    const satDiv = document.querySelector('[data-tour="journey-spacecraft"]');
    const heroDiv = document.querySelector('[data-tour="journey-hero"]');
    const canvas = satDiv ? satDiv.querySelector('canvas') : null;
    const label = satDiv ? satDiv.querySelector('.absolute.bottom-4') : null;

    return {
      windowHeight: window.innerHeight,
      home: serialize(home),
      hero: serialize(heroDiv),
      satDiv: serialize(satDiv),
      canvas: serialize(canvas),
      label: serialize(label),
    };
  });

  console.log('DOM METRICS:', JSON.stringify(metrics, null, 2));

  await page.screenshot({ path: path.join(__dirname, 'test_home_layout.png') });
  console.log('Saved test_home_layout.png');

  await browser.close();
})();
