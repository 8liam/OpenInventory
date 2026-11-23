/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { bandWidth, floatPosition, floatRangeSpan, wearBandFor } from "./float-bar.ts";
import { WEAR_BANDS } from "./float-bar.config.ts";

describe("wearBandFor", () => {
  it("puts boundaries in the higher band", () => {
    assert.equal(wearBandFor(0)?.id, "fn");
    assert.equal(wearBandFor(0.0699)?.id, "fn");
    assert.equal(wearBandFor(0.07)?.id, "mw");
    assert.equal(wearBandFor(0.15)?.id, "ft");
    assert.equal(wearBandFor(0.38)?.id, "ww");
    assert.equal(wearBandFor(0.45)?.id, "bs");
  });
  it("keeps 1 in the last band and clamps out-of-scale values", () => {
    assert.equal(wearBandFor(1)?.id, "bs");
    assert.equal(wearBandFor(1.4)?.id, "bs");
    assert.equal(wearBandFor(-0.2)?.id, "fn");
  });
  it("returns null for missing or non-finite floats", () => {
    assert.equal(wearBandFor(null), null);
    assert.equal(wearBandFor(undefined), null);
    assert.equal(wearBandFor(Number.NaN), null);
  });
});

describe("floatPosition", () => {
  it("maps the scale to percentages and clamps", () => {
    assert.equal(floatPosition(0), 0);
    assert.equal(floatPosition(0.5), 50);
    assert.equal(floatPosition(1), 100);
    assert.equal(floatPosition(2), 100);
    assert.equal(floatPosition(-1), 0);
  });
});

describe("bandWidth", () => {
  it("adds up to the whole bar", () => {
    const total = WEAR_BANDS.reduce((sum, band) => sum + bandWidth(band), 0);
    assert.ok(Math.abs(total - 100) < 1e-9);
  });
});

describe("floatRangeSpan", () => {
  it("shades the skin's own range", () => {
    const span = floatRangeSpan(0.06, 0.8);
    assert.ok(span !== null);
    assert.ok(Math.abs(span.start - 6) < 1e-9);
    assert.ok(Math.abs(span.end - 80) < 1e-9);
  });
  it("clamps the bounds to the scale", () => {
    assert.deepEqual(floatRangeSpan(-0.5, 1.5), { start: 0, end: 100 });
  });
  it("is null when a bound is missing or the range is empty", () => {
    assert.equal(floatRangeSpan(null, 0.5), null);
    assert.equal(floatRangeSpan(0.1, undefined), null);
    assert.equal(floatRangeSpan(0.5, 0.2), null);
    assert.equal(floatRangeSpan(0.3, 0.3), null);
  });
});
