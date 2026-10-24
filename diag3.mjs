import { launch } from '/Users/bossman/.agents/skills/awwwards/scripts/browser.mjs';

const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
await page.goto('http://localhost:4322/', { waitUntil: 'load' });
await page.waitForTimeout(1200);
await page.evaluate(async () => { const h = document.body.scrollHeight; for (let y = 0; y <= h; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 90)); } });
await page.waitForTimeout(800);

const info = await page.evaluate(() => {
  const measure = (sel) => [...document.querySelectorAll(sel)].map((el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    return { top: Math.round(r.top + scrollY), h: Math.round(r.height), opacity: cs.opacity, display: cs.display, reveal: el.className.includes('is-in') ? 'in' : 'NOT-IN', text: (el.textContent || '').trim().slice(0, 40) };
  });
  return {
    move: measure('.move'),
    host: measure('.host'),
    faq: measure('.faq'),
    docH: document.body.scrollHeight,
  };
});
console.log(JSON.stringify(info, null, 2));
await page.evaluate(() => document.querySelector('.host')?.scrollIntoView());
await page.waitForTimeout(500);
await page.screenshot({ path: '.shots/region-host.png' });
await page.evaluate(() => document.querySelector('.faq')?.scrollIntoView());
await page.waitForTimeout(500);
await page.screenshot({ path: '.shots/region-faq.png' });
await browser.close();
