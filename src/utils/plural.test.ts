/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { formatCount, pluralize } from "./plural.ts";

const ROW = { one: "row", other: "rows" } as const;

test("pluralize picks the singular only for exactly one", () => {
  assert.equal(pluralize(1, ROW), "row");
  assert.equal(pluralize(0, ROW), "rows");
  assert.equal(pluralize(2, ROW), "rows");
});

test("formatCount groups the number and keeps the noun in step", () => {
  assert.equal(formatCount(1, ROW), "1 row");
  assert.equal(formatCount(0, ROW), "0 rows");
  assert.equal(formatCount(1204, ROW), "1,204 rows");
});
