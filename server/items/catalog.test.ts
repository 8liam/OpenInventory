/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDefCategoryIndex } from "./catalog.ts";

test("first source wins on overlapping def indexes and unlisted ones are absent", () => {
  const index = buildDefCategoryIndex([
    ["Container", [{ def_index: "10" }, { def_index: 11 }]],
    ["Key", [{ def_index: "10" }, { def_index: "12" }]],
    ["Tool", [{ def_index: "12" }, {}, { def_index: "13" }]],
  ] as never);
  assert.equal(index.get(10), "Container");
  assert.equal(index.get(11), "Container");
  assert.equal(index.get(12), "Key");
  assert.equal(index.get(13), "Tool");
  assert.equal(index.has(99), false);
});
