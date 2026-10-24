import { launch } from '/Users/bossman/.agents/skills/awwwards/scripts/browser.mjs';

const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
await page.goto('http://localhost:4322/', { waitUntil: 'load' });
await page.waitForTimeout(2500);

const diag = await page.evaluate(() => {
  const vis = (el) => { if (!el) return 'MISSING'; const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return { top: Math.round(r.top + scrollY), h: Math.round(r.height), display: cs.display, opacity: cs.opacity }; };
  const panels = [...document.querySelectorAll('.lens__panel')].map((p) => ({ cls: p.className, hidden: p.hidden, display: getComputedStyle(p).display, h: Math.round(p.getBoundingClientRect().height) }));
  return {
    htmlClass: document.documentElement.className,
    islands: document.querySelectorAll('astro-island').length,
    hydrated: [...document.querySelectorAll('astro-island')].map(i => i.getAttribute('ssr') ?? 'n/a').slice(0,3),
    lensClass: document.querySelector('.lens')?.className,
    panels,
    how: vis(document.querySelector('.how')),
    howSteps: document.querySelectorAll('.how .step').length,
    features: vis(document.querySelector('.features')),
    fcards: document.querySelectorAll('.features .fcard').length,
    faq: vis(document.querySelector('.faq')),
    qas: document.querySelectorAll('.faq .qa').length,
    firstReveal: (() => { const el = document.querySelector('[data-reveal]'); return el ? { cls: el.className, opacity: getComputedStyle(el).opacity } : 'none'; })(),
  };
});
console.log(JSON.stringify(diag, null, 2));
console.log('--- LOGS ---');
console.log(logs.slice(0, 30).join('\n'));
await browser.close();
