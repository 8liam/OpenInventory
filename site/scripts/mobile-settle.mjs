#!/usr/bin/env node
/**
 * What keeps the mobile first screen changing? Sample the 390x844 viewport
 * every 300ms for 7s after load (4x CPU throttle, like shoot.mjs) and report
 * consecutive-frame mad, so the settling time and the culprit are visible.
 */
import { chromium, devices } from "playwright";
import { mkdirSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const URL = process.argv[2] ?? "http://localhost:4325/";
const OUT = ".shots/mobile-settle";
mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices["iPhone 13"] });
const page = await ctx.newPage();
const cdp = await ctx.newCDPSession(page);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.goto(URL, { waitUntil: "load" });
const frames = [];
for (let i = 0; i <= 23; i++) {
  const t = i * 300;
  if (i > 0) await page.waitForTimeout(300);
  const f = `${OUT}/t-${String(t).padStart(4, "0")}.png`;
  await page.screenshot({ path: f });
  frames.push({ t, f });
}

const mads = [];
for (let i = 1; i < frames.length; i++) {
  const A = await sharp(frames[i - 1].f)
    .raw()
    .toBuffer();
  const B = await sharp(frames[i].f).raw().toBuffer();
  let s = 0;
  for (let j = 0; j < A.length; j++) s += Math.abs(A[j] - B[j]);
  mads.push({ from: frames[i - 1].t, to: frames[i].t, mad: +(s / A.length).toFixed(3) });
}
writeFileSync(`${OUT}/mads.json`, JSON.stringify(mads, null, 1));
console.log(mads.map((m) => `${m.from}-${m.to}: ${m.mad}`).join("\n"));
await browser.close();
