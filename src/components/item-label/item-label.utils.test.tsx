/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { splitItemName } from "./item-label.utils";

test("splitItemName splits weapon and skin at the separator", () => {
  assert.deepEqual(splitItemName("AK-47 | Redline"), ["AK-47", "Redline"]);
});

test("splitItemName keeps later separators in the skin", () => {
  assert.deepEqual(splitItemName("A | B | C"), ["A", "B | C"]);
});

test("splitItemName returns null weapon when there is no skin", () => {
  assert.deepEqual(splitItemName("Dreams & Nightmares Case"), [null, "Dreams & Nightmares Case"]);
});
