const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--window-size=1440,900']
  });

  const page = await browser.newPage();
  
  // Expose a hook to capture aladin instance
  await page.evaluateOnNewDocument(() => {
    window.__capturedInstances = [];
    const origA = window.A;
    Object.defineProperty(window, 'A', {
      configurable: true,
      get() { return this._A; },
      set(val) {
        this._A = val;
        if (val && val.aladin) {
          const origAladin = val.aladin;
          val.aladin = function(...args) {
            const inst = origAladin.apply(this, args);
            window.__capturedInstances.push(inst);
            return inst;
          };
        }
      }
    });
  });

  await page.goto('http://127.0.0.1:5173/explore', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));

  const methods = await page.evaluate(() => {
    const inst = window.__capturedInstances[0];
    if (!inst) return 'No instance captured';
    const props = [];
    let cur = inst;
    while (cur && cur !== Object.prototype) {
      props.push(...Object.getOwnPropertyNames(cur));
      cur = Object.getPrototypeOf(cur);
    }
    return [...new Set(props)].filter(p => !p.startsWith('_'));
  });

  console.log('Aladin instance methods & properties:', methods);

  await browser.close();
}

main().catch(console.error);
