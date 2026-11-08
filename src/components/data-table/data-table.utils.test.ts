/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareSortValues, fitLayout } from "./data-table.utils.ts";

const FULL = [
  { id: "item", width: "4fr", minWidth: 200 },
  { id: "type", width: "1fr", minWidth: 80, hidePriority: 1 },
  { id: "price", width: "1fr", minWidth: 100 },
];
const COMPACT = [
  { id: "item", width: "minmax(0, 1fr)" },
  { id: "price", width: "92px" },
];
const ids = (columns: readonly { id: string }[]) => columns.map((column) => column.id).join(",");

// Required: 32 padding + 28 checkbox + 200 + 100 + 2 gaps of 12 = 384; Type adds 80 + 12.
describe("fitLayout", () => {
  it("keeps every column when the table's own width fits them", () => {
    const fitted = fitLayout(FULL, COMPACT, 476, [28]);
    assert.equal(fitted.compact, false);
    assert.equal(ids(fitted.columns), "item,type,price");
  });
  it("hides optional columns first, then goes compact only below the required width", () => {
    assert.equal(ids(fitLayout(FULL, COMPACT, 475, [28]).columns), "item,price");
    assert.equal(fitLayout(FULL, COMPACT, 384, [28]).compact, false);
    const narrow = fitLayout(FULL, COMPACT, 383, [28]);
    assert.equal(narrow.compact, true);
    assert.equal(ids(narrow.columns), "item,price");
    assert.equal(narrow.columns[0]?.width, "minmax(0, 1fr)");
  });
  it("uses the full layout before the width is measured, or with no compact set", () => {
    assert.equal(fitLayout(FULL, COMPACT, undefined, [28]).compact, false);
    assert.equal(fitLayout(FULL, undefined, 100, [28]).compact, false);
  });
});

describe("compareSortValues", () => {
  const sorted = (values: readonly (number | null)[], sign: 1 | -1) =>
    [...values].sort((a, b) => compareSortValues(a, b, sign));
  it("puts missing values last in both directions", () => {
    assert.deepEqual(sorted([2, null, 10, 1], 1), [1, 2, 10, null]);
    assert.deepEqual(sorted([2, null, 10, 1], -1), [10, 2, 1, null]);
  });
});
