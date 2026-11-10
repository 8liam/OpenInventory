/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio, parseColor, readableTextOn, relativeLuminance } from "./contrast.ts";

const TOLERANCE = 0.01;

test("black on white is 21:1", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#ffffff") - 21) < TOLERANCE);
});

test("identical colours are 1:1 and the order does not matter", () => {
  assert.equal(contrastRatio("#777", "#777"), 1);
  assert.equal(contrastRatio("#123456", "#fedcba"), contrastRatio("#fedcba", "#123456"));
});

test("matches the published WCAG ratio for #767676 on white", () => {
  assert.ok(Math.abs(contrastRatio("#767676", "#ffffff") - 4.54) < TOLERANCE);
});

test("short hex expands", () => {
  assert.deepEqual(parseColor("#fff"), [1, 1, 1]);
  assert.equal(relativeLuminance("#000"), 0);
});

test("oklch white and black convert to sRGB extremes", () => {
  assert.ok(Math.abs(relativeLuminance("oklch(100% 0 0)") - 1) < TOLERANCE);
  assert.ok(relativeLuminance("oklch(0% 0 0)") < TOLERANCE);
});

test("rejects colours it cannot parse", () => {
  assert.throws(() => parseColor("rebeccapurple"), /Unsupported colour/);
});

test("readableTextOn picks black on light backgrounds and white on dark ones", () => {
  assert.equal(readableTextOn("#eab308"), "#000000");
  assert.equal(readableTextOn("#ffffff"), "#000000");
  assert.equal(readableTextOn("#1e3a8a"), "#ffffff");
  assert.equal(readableTextOn("#000"), "#ffffff");
});
