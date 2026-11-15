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
  await new Promise(r => setTimeout(r, 600));

  const client = await page.target().createCDPSession();
  await client.send('Profiler.enable');
  await client.send('Profiler.setSamplingInterval', { interval: 100 }); // 100 microseconds (high precision)
  await client.send('Profiler.start');

  await page.evaluate(() => {
    const btn = document.querySelector('button[data-action="back-to-journey"]');
    if (btn) btn.click();
  });

  await new Promise(r => setTimeout(r, 800));
  const { profile } = await client.send('Profiler.stop');

  // Find heavy call stacks
  const nodeMap = new Map();
  for (const node of profile.nodes) {
    nodeMap.set(node.id, node);
  }

  // Calculate self time and total time per function
  const selfTime = {};
  for (let i = 0; i < profile.samples.length; i++) {
    const id = profile.samples[i];
    const node = nodeMap.get(id);
    if (!node) continue;
    const loc = `${node.callFrame.functionName || '(anon)'} @ ${node.callFrame.url.split('/').pop()}:${node.callFrame.lineNumber}`;
    selfTime[loc] = (selfTime[loc] || 0) + 1;
  }

  console.log('Top 20 CPU hotspots (by sample count):');
  Object.entries(selfTime)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .forEach(([loc, cnt]) => {
      console.log(`  ${cnt} samples: ${loc}`);
    });

  await browser.close();
}

main().catch(console.error);
