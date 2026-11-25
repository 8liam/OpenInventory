/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { RELATIVE_TIME } from "./format.config.ts";
import {
  formatChance,
  formatCompactMoney,
  formatFloat,
  formatFloatExact,
  formatInteger,
  formatMoney,
  formatMoneyParts,
  formatPercent,
  formatRelativeTime,
  formatSignedMoney,
} from "./format.ts";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const NOW = 1_800_000_000_000;

test("money formats in the requested currency", () => {
  assert.equal(formatMoney(1234.5, "USD"), "$1,234.50");
  assert.equal(formatMoney(0, "USD"), "$0.00");
  assert.match(formatMoney(10, "EUR"), /€10\.00/);
});

test("money parts split sign, whole units and fraction, and join back", () => {
  assert.deepEqual(formatMoneyParts(48213.07, "USD"), {
    sign: "$",
    whole: "48,213",
    fraction: ".07",
  });
  const negative = formatMoneyParts(-5, "USD");
  assert.equal(negative.sign + negative.whole + negative.fraction, formatMoney(-5, "USD"));
  const yen = formatMoneyParts(1200, "JPY");
  assert.equal(yen.fraction, "");
});

test("compact money shortens large amounts", () => {
  assert.equal(formatCompactMoney(1200, "USD"), "$1.2K");
  assert.equal(formatCompactMoney(2_500_000, "USD"), "$2.5M");
});

test("signed money carries its sign but not for zero", () => {
  assert.equal(formatSignedMoney(12.4, "USD"), "+$12.40");
  assert.match(formatSignedMoney(-3.1, "USD"), /^[-−]\$3\.10$/);
  assert.equal(formatSignedMoney(0, "USD"), "$0.00");
});

test("percentages keep sub-1% precision and sign", () => {
  assert.equal(formatPercent(0.1234), "+12.34%");
  assert.equal(formatPercent(0), "0%");
  assert.equal(formatChance(0.0005), "0.05%");
});

test("floats use a fixed number of digits and integers drop decimals", () => {
  assert.equal(formatFloat(0.07), "0.0700");
  assert.equal(formatFloatExact(0.07), "0.0700");
  assert.equal(formatInteger(1234.6), "1,235");
});

test("exact floats keep adjacent float32 values apart", () => {
  const view = new DataView(new ArrayBuffer(4));
  const next = (value: number): number => {
    view.setFloat32(0, value);
    view.setUint32(0, view.getUint32(0) + 1);
    return view.getFloat32(0);
  };
  for (const start of [0.01, 0.07, 0.15, 0.38, 0.45, 0.9999, 0.00123]) {
    const a = Math.fround(start);
    const b = next(a);
    assert.notEqual(formatFloatExact(a), formatFloatExact(b), `${a} vs ${b}`);
    assert.equal(Math.fround(Number(formatFloatExact(a))), a);
    assert.equal(Math.fround(Number(formatFloatExact(b))), b);
  }
  assert.equal(formatFloatExact(Math.fround(0.01)), "0.0100");
  assert.equal(formatFloatExact(0), "0.0000");
  assert.equal(formatFloatExact(1), "1.0000");
});

test("relative time reads just now under a minute and never goes negative", () => {
  assert.equal(formatRelativeTime(NOW - 30_000, NOW), RELATIVE_TIME.justNow);
  assert.equal(formatRelativeTime(NOW + HOUR, NOW), RELATIVE_TIME.justNow, "future clock skew");
});

test("relative time picks the largest fitting unit and floors", () => {
  assert.equal(formatRelativeTime(NOW - 5 * MINUTE, NOW), "5 minutes ago");
  assert.equal(formatRelativeTime(NOW - MINUTE, NOW), "1 minute ago");
  assert.equal(formatRelativeTime(NOW - (2 * HOUR + 59 * MINUTE), NOW), "2 hours ago");
  assert.equal(formatRelativeTime(NOW - 3 * DAY, NOW), "3 days ago");
});
