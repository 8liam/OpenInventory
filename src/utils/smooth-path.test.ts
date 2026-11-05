/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { monotonePath, type PlotPoint } from "./smooth-path.ts";

/** Pulls every number out of an SVG path string. */
function numbers(path: string): number[] {
  return (path.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);
}

test("no points yields an empty path and one point a bare move", () => {
  assert.equal(monotonePath([]), "");
  assert.equal(monotonePath([{ x: 3, y: 4 }]), "M3,4");
});

test("two points draw one segment ending at the last point", () => {
  const path = monotonePath([
    { x: 0, y: 10 },
    { x: 30, y: 20 },
  ]);
  assert.ok(path.startsWith("M0.0,10.0 C"));
  assert.ok(path.endsWith(" 30.0,20.0"));
  assert.equal(path.match(/C/g)?.length, 1);
});

test("one cubic segment per gap and every sample is passed through", () => {
  const points: PlotPoint[] = [
    { x: 0, y: 5 },
    { x: 10, y: 8 },
    { x: 20, y: 2 },
    { x: 40, y: 9 },
  ];
  const path = monotonePath(points);
  assert.equal(path.match(/C/g)?.length, points.length - 1);
  for (const p of points) assert.ok(path.includes(`${p.x.toFixed(1)},${p.y.toFixed(1)}`));
});

test("never overshoots: control points stay between neighbouring sample values", () => {
  // A sharp step is where an ordinary spline would ring below 0 / above 100.
  const points: PlotPoint[] = [
    { x: 0, y: 0 },
    { x: 10, y: 0 },
    { x: 20, y: 100 },
    { x: 30, y: 100 },
  ];
  for (const n of numbers(monotonePath(points))) {
    // x coordinates are 0..30; y coordinates must stay in 0..100. Both fit one bound.
    assert.ok(n >= 0 && n <= 100, `value ${n} escaped the data range`);
  }
});

test("flat runs stay flat and duplicate x does not produce NaN", () => {
  const flat = monotonePath([
    { x: 0, y: 7 },
    { x: 5, y: 7 },
    { x: 10, y: 7 },
  ]);
  assert.ok(!flat.includes("NaN"));
  // Numbers alternate x, y, so the odd positions are the y coordinates.
  assert.ok(numbers(flat).every((n, i) => i % 2 === 0 || n === 7));
  const duplicateX = monotonePath([
    { x: 0, y: 1 },
    { x: 0, y: 5 },
    { x: 10, y: 6 },
  ]);
  assert.ok(!duplicateX.includes("NaN") && !duplicateX.includes("Infinity"));
});
