#!/usr/bin/env node
// mad (mean absolute per-channel diff, 0–255) + %>12 differ for image pairs.
import sharp from "sharp";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.argv[2] ?? ".shots/prod/home";
const files = readdirSync(dir).filter((f) => f.endsWith(".png"));
const pairs = new Map();
for (const f of files) {
  const m = f.match(/^(.+)-(rest|hover|a|b|c)\.png$/);
  if (m) (pairs.get(m[1]) ?? pairs.set(m[1], {}).get(m[1]))[m[2]] = join(dir, f);
}
async function mad(p1, p2) {
  const A = await sharp(p1).raw().toBuffer({ resolveWithObject: true });
  const B = await sharp(p2).raw().toBuffer({ resolveWithObject: true });
  if (A.info.width !== B.info.width || A.info.height !== B.info.height)
    return { mad: "size-mismatch" };
  let sum = 0,
    over = 0;
  const n = A.data.length;
  for (let i = 0; i < n; i++) {
    const d = Math.abs(A.data[i] - B.data[i]);
    sum += d;
    if (d > 12) over++;
  }
  return { mad: +(sum / n).toFixed(2), pct: +((100 * over) / n).toFixed(2) };
}
for (const [name, imgs] of pairs) {
  if (imgs.rest && imgs.hover) console.log(name, JSON.stringify(await mad(imgs.rest, imgs.hover)));
}
