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

test("colorSlices folds a slice the data already calls Other into the one Other row", () => {
  const out = colorSlices(
    [makeSlice("A", 5), makeSlice("Other", 2, 3), makeSlice("B", 1)],
    "Other",
  );
  assert.deepEqual(
    out.map((s) => s.label),
    ["A", "B", "Other"],
  );
  assert.equal(out[2]?.value, 2);
  assert.equal(out[2]?.count, 3);
});

test("colorSlices gives the wear ramp in Factory New to Battle-Scarred order", () => {
  const out = colorSlices(
    [makeSlice("Field-Tested", 5), makeSlice("Factory New", 1)],
    "Other",
    "wear",
  );
  assert.deepEqual(
    out.map((s) => s.color),
    ["var(--wear-3)", "var(--wear-1)"],
  );
});
