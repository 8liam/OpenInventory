/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDefCategoryIndex, loadCatalog } from "./catalog.ts";

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

test("corrupt cache rows fall back to an empty catalog instead of throwing", async () => {
  const corrupt = "{not json";
  const db = {
    getCache: () => corrupt,
    getCacheStale: () => corrupt,
    setCache: () => undefined,
  } as never;
  const originalFetch = globalThis.fetch;
  const originalWarn = console.warn;
  globalThis.fetch = () => Promise.reject(new Error("offline"));
  console.warn = () => undefined;
  try {
    const catalog = await loadCatalog(db);
    assert.equal(catalog.skinImage("anything"), null);
  } finally {
    globalThis.fetch = originalFetch;
    console.warn = originalWarn;
  }
});
