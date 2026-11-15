const puppeteer = require('puppeteer-core');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  await page.goto('http://127.0.0.1:5173/objects', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 800));

  const client = await page.target().createCDPSession();
  await client.send('Profiler.enable');
  await client.send('Profiler.start');

  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="back-to-journey"]');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 800));
  const { profile } = await client.send('Profiler.stop');

  const nodeMap = new Map();
  for (const node of profile.nodes) {
    nodeMap.set(node.id, node);
  }
  const durations = {};
  for (let i = 0; i < profile.samples.length; i++) {
    const id = profile.samples[i];
    const node = nodeMap.get(id);
    if (!node) continue;
    const name = `${node.callFrame.functionName || '(anonymous)'} (${node.callFrame.url.split('/').pop()}:${node.callFrame.lineNumber})`;
    durations[name] = (durations[name] || 0) + 1;
  }
  const sorted = Object.entries(durations).sort((a,b) => b[1] - a[1]).slice(0, 25);
  console.log('Top CPU Samples during Back-To-Journey:');
  sorted.forEach(([k, v]) => console.log(`  ${v} samples: ${k}`));

  await browser.close();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
