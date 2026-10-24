#!/usr/bin/env node
/**
 * Fix #3 verification: does the 404 -> home navigation animate?
 *
 * Loads a missing path (real 404 status), clicks "Back home", and captures
 * frames every ~80ms. If a cross-document view transition runs, early frames
 * show the old (404) content cross-fading; if static, frame 1 is already home.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";

const ORIGIN = process.argv[2] ?? "http://localhost:4325";
const OUT = process.argv[3] ?? ".shots/nav404";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const resp = await page.goto(`${ORIGIN}/definitely-not-a-page`, { waitUntil: "networkidle" });
const status404 = resp?.status();
const desc404 = await page.locator('meta[name="description"]').getAttribute("content");
const og404 = await page.locator('meta[property="og:image"]').getAttribute("content").catch(() => null);
await page.waitForTimeout(400);
await page.screenshot({ path: `${OUT}/f-00-404.png` });

// Confirm view transitions supported in this engine
const vtSupported = await page.evaluate(() => CSS.supports("view-transition-name: none"));

await page.click('a[href="/"]');
const frames = [];
for (let i = 1; i <= 8; i++) {
  await page.waitForTimeout(80);
  const shot = `${OUT}/f-${String(i * 80).padStart(3, "0")}.png`;
  await page.screenshot({ path: shot });
  frames.push(shot);
}
await page.waitForLoadState("networkidle");
await page.screenshot({ path: `${OUT}/f-99-settled.png` });
const url = page.url();

const report = { status404, desc404, og404, vtSupported, url, frames };
writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
