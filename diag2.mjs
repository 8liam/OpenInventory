import { launch } from '/Users/bossman/.agents/skills/awwwards/scripts/browser.mjs';

const browser = await launch();
const page = await (await browser.newContext({ viewport: { width: 1440, height: 900 } })).newPage();
const logs = [];
page.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
page.on('pageerror', (e) => logs.push('PAGEERROR: ' + e.message));
await page.goto('http://localhost:4322/', { waitUntil: 'load' });
await page.waitForTimeout(1500);
// Force scroll through the whole page to trigger every client:visible observer.
await page.evaluate(async () => {
  const h = document.body.scrollHeight;
  for (let y = 0; y <= h; y += 600) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); }
});
await page.waitForTimeout(1500);

const probe = await page.evaluate(() => {
  const island = document.querySelector('astro-island');
  const fiberKey = island ? Object.keys(island).find(k => k.startsWith('__reactContainer')) : null;
  const btn = document.querySelector('.seg__btn');
  let clickedWorks = 'no-button';
  if (btn) { btn.click(); clickedWorks = 'clicked'; }
  return {
    hasReactFiber: !!fiberKey,
    fiberKey: fiberKey || null,
    islandRenderedChildren: island ? island.children.length : -1,
    // Astro sets this attr on the island once hydrated in dev; presence is a hint.
    astroHydrated: island ? island.hasAttribute('ssr') : null,
    lensClassNow: document.querySelector('.lens')?.className,
    btnRole: btn?.getAttribute('role'),
    btnAriaSelected: btn?.getAttribute('aria-selected'),
    clickedWorks,
    activePanelAfterClick: document.querySelector('.lens__panel.is-on')?.id,
  };
});
console.log(JSON.stringify(probe, null, 2));
console.log('--- LOGS ---');
console.log(logs.slice(0, 40).join('\n') || '(no console output)');
await browser.close();
