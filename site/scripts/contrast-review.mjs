// Dump axe incomplete color-contrast nodes with computed colors.
import { chromium } from "playwright";
import { createHash } from "node:crypto";

const url = process.argv[2] ?? "http://localhost:4325/";
// Same pinned copy as the skill's shoot.mjs.
const AXE_URL = "https://cdn.jsdelivr.net/npm/axe-core@4.14.0/axe.min.js";
const AXE_SHA384 = "lFUXB8tI4BaTE1bqxH9eeAXON2NH1qsdAhs7S5L++nUNP5QOy+hwr0C3TYEJUEl0";
const res = await fetch(AXE_URL);
const buf = Buffer.from(await res.arrayBuffer());
const digest = "sha384-" + createHash("sha384").update(buf).digest("base64");
if (digest !== "sha384-" + AXE_SHA384) throw new Error("axe hash mismatch: " + digest);
const axeSource = buf.toString("utf8");

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(axeSource);
const r = await page.evaluate(async () => {
  const res = await window.axe.run(document, {
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"] },
    resultTypes: ["incomplete"],
  });
  const c = res.incomplete.find((v) => v.id === "color-contrast");
  return c
    ? c.nodes.map((n) => ({
        target: n.target.join(" "),
        msg: n.any[0]?.message?.slice(0, 120),
        data: n.any[0]?.data,
      }))
    : [];
});
const byMsg = new Map();
for (const n of r) {
  const key = n.msg ?? "unknown";
  if (!byMsg.has(key)) byMsg.set(key, []);
  byMsg.get(key).push(n.target);
}
console.log("total incomplete:", r.length);
for (const [msg, targets] of byMsg) {
  console.log("\n[" + targets.length + "x]", msg);
  for (const t of targets.slice(0, 6)) console.log("   ", t);
}
await browser.close();
