/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test, type TestContext } from "node:test";
import { ITEM_DATA } from "../../src/lib/storage/storage.config.ts";
import { buildDefCategoryIndex, loadCatalog } from "./catalog.ts";
import type { CatalogCache, NamedRecord } from "./catalog.types.ts";

const CORRUPT_ROW = "{not json";
const NON_ARRAY_ROW = "{}";
const HTML_BODY = "<!doctype html><title>Maintenance</title>";
const HTTP_OK = 200;
const STICKER_FILE = "stickers";
const STICKER_HASH = "Sticker | Fixture";
const STICKER: NamedRecord = {
  name: STICKER_HASH,
  market_hash_name: STICKER_HASH,
  image: "https://cdn.example.test/fixture.png",
};

/** A cache that serves `fresh` while within TTL and `stale` once expired, and records writes. */
function cacheStub(
  fresh: string | undefined,
  stale: string | undefined | ((key: string) => string | undefined),
) {
  const writes = new Map<string, string>();
  const cache: CatalogCache = {
    getCache: () => fresh,
    getCacheStale: (key) => (typeof stale === "function" ? stale(key) : stale),
    setCache: (key, value) => void writes.set(key, value),
  };
  return { cache, writes };
}

function silenceWarnings(t: TestContext): void {
  t.mock.method(console, "warn", () => undefined);
}

function offline(t: TestContext): void {
  t.mock.method(globalThis, "fetch", () => Promise.reject(new Error("offline")));
}

/** Serves the fixture sticker for stickers.json and an empty list for every other file. */
function online(t: TestContext): void {
  t.mock.method(globalThis, "fetch", (url: string) => {
    const body = url.endsWith(`/${STICKER_FILE}.json`) ? [STICKER] : [];
    return Promise.resolve(Response.json(body));
  });
}

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

test("corrupt cache rows fall back to an empty catalog instead of throwing", async (t) => {
  silenceWarnings(t);
  offline(t);
  await assert.doesNotReject(loadCatalog(cacheStub(CORRUPT_ROW, CORRUPT_ROW).cache));
});

test("a corrupt fresh row is refetched and the fetched data is used and cached", async (t) => {
  silenceWarnings(t);
  online(t);
  const { cache, writes } = cacheStub(CORRUPT_ROW, CORRUPT_ROW);
  const catalog = await loadCatalog(cache);
  assert.equal(catalog.skinImage(STICKER_HASH), STICKER.image);
  assert.deepEqual(JSON.parse(writes.get(`${ITEM_DATA.cachePrefix}${STICKER_FILE}`) ?? ""), [
    STICKER,
  ]);
});

test("a corrupt stale row with a failing fetch yields an empty catalog", async (t) => {
  silenceWarnings(t);
  offline(t);
  const catalog = await loadCatalog(cacheStub(undefined, CORRUPT_ROW).cache);
  assert.equal(catalog.skinImage(STICKER_HASH), null);
});

test("valid JSON that is not an array is treated as corrupt", async (t) => {
  silenceWarnings(t);
  offline(t);
  // `{}` used to slip through as a "list" and crash on iteration.
  await assert.doesNotReject(loadCatalog(cacheStub(NON_ARRAY_ROW, NON_ARRAY_ROW).cache));
});

test("a 200 with a non-array body is not cached and stale data is kept", async (t) => {
  silenceWarnings(t);
  t.mock.method(globalThis, "fetch", () =>
    Promise.resolve(new Response(HTML_BODY, { status: HTTP_OK })),
  );
  const staleStickers = JSON.stringify([STICKER]);
  const { cache, writes } = cacheStub(undefined, (key) =>
    key.endsWith(STICKER_FILE) ? staleStickers : undefined,
  );
  const catalog = await loadCatalog(cache);
  assert.equal(writes.size, 0);
  assert.equal(catalog.skinImage(STICKER_HASH), STICKER.image);
});
