/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { makeSlice } from "~test/fixtures";
import { BREAKDOWN_PANEL } from "./breakdown-panel.config";
import { colorSlices } from "./breakdown-panel.utils";

test("colorSlices keeps small lists whole and colours every slice", () => {
  const out = colorSlices([makeSlice("A", 3), makeSlice("B", 1)], "Other");
  assert.deepEqual(
    out.map((s) => s.label),
    ["A", "B"],
  );
  assert.ok(out.every((s) => s.color.length > 0));
});

test("colorSlices folds the tail past the row limit into Other, summing value and count", () => {
  const slices = Array.from({ length: BREAKDOWN_PANEL.rowLimit + 2 }, (_, i) =>
    makeSlice(`S${i}`, 10, 2),
  );
  const out = colorSlices(slices, "Other");
  assert.equal(out.length, BREAKDOWN_PANEL.rowLimit + 1);
  const other = out[out.length - 1];
  assert.equal(other?.label, "Other");
  assert.equal(other?.value, 20);
  assert.equal(other?.count, 4);
  assert.equal(other?.color, BREAKDOWN_PANEL.otherColor);
});

test("colorSlices keeps a colour the slice already has", () => {
  const out = colorSlices([makeSlice("A", 1, 1, "#123456")], "Other");
  assert.equal(out[0]?.color, "#123456");
});
