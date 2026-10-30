import { launch } from '/Users/bossman/.agents/skills/awwwards/scripts/browser.mjs';
import fs from 'node:fs';

const OUT = process.env.OUT || '.shots';
const PORT = process.env.PORT || '4322';
const URL = `http://localhost:${PORT}/`;
fs.mkdirSync(OUT, { recursive: true });
const browser = await launch();

async function shoot(name, viewport, opts = {}) {
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, ...opts });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push('PAGEERROR: ' + e.message));
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  // Auto-scroll the whole page so every client:visible island hydrates + reveals fire.
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `${OUT}/${name}-full.png`, fullPage: true });
  await page.screenshot({ path: `${OUT}/${name}-top.png` });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  await ctx.close();
  return { name, errors, overflowPx: overflow };
}

// Per-section element shots at desktop width (each crop = the whole section).
async function sectionShots() {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const h = document.body.scrollHeight;
    for (let y = 0; y <= h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  const secs = await page.$$('main > section, main > * > section');
  let i = 0;
  for (const s of secs) {
    i++;
    const cls = (await s.getAttribute('class')) || '';
    const name = cls.split(/\s+/)[0] || String(i);
    try {
      await s.scrollIntoViewIfNeeded();
      await page.waitForTimeout(700);
      await s.screenshot({ path: `${OUT}/sec-${name}.png`, timeout: 5000 });
      console.log(`sec-${name}: ok (${cls})`);
    } catch (e) {
      console.log(`sec-${name} FAILED: ${String(e.message).split('\n')[0]}`);
    }
  }
  await ctx.close();
}

const results = [];
results.push(await shoot('desktop', { width: 1440, height: 900 }));
results.push(await shoot('mobile', { width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }));
results.push(await shoot('reduced', { width: 1440, height: 900 }, { reducedMotion: 'reduce' }));
await sectionShots();
console.log(JSON.stringify(results, null, 2));
await browser.close();
