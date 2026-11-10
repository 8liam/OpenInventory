/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { axisPosition, compareToOdds } from "./odds-luck.ts";

test("a count equal to the expectation sits at the centre and is normal", () => {
  const luck = compareToOdds(50, 100, 50);
  assert.equal(luck.expected, 50);
  assert.equal(luck.deviation, 0);
  assert.equal(luck.position, 50);
  assert.equal(luck.status, "normal");
});

test("counts far from the expectation are flagged low or high", () => {
  assert.equal(compareToOdds(0, 1000, 50).status, "low");
  assert.equal(compareToOdds(1000, 1000, 50).status, "high");
});

test("a rare tier is judged against its own spread, not the raw gap", () => {
  const luck = compareToOdds(1, 412, 0.256);
  assert.equal(luck.status, "normal");
  assert.ok(Math.abs(luck.deviation) < 0.2);
});

test("positions clamp to the axis ends", () => {
  assert.equal(axisPosition(-99), 0);
  assert.equal(axisPosition(99), 100);
});

test("an empty history has no spread and counts as normal", () => {
  assert.equal(compareToOdds(0, 0, 50).status, "normal");
});
