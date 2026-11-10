/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { nextRadioIndex } from "./radio-group.ts";

test("arrows move and wrap", () => {
  assert.equal(nextRadioIndex("ArrowRight", 0, 3), 1);
  assert.equal(nextRadioIndex("ArrowDown", 2, 3), 0);
  assert.equal(nextRadioIndex("ArrowLeft", 0, 3), 2);
  assert.equal(nextRadioIndex("ArrowUp", 2, 3), 1);
});

test("Home and End jump to the ends", () => {
  assert.equal(nextRadioIndex("Home", 2, 4), 0);
  assert.equal(nextRadioIndex("End", 0, 4), 3);
});

test("other keys and empty groups are ignored", () => {
  assert.equal(nextRadioIndex("a", 0, 3), null);
  assert.equal(nextRadioIndex("ArrowRight", 0, 0), null);
});
