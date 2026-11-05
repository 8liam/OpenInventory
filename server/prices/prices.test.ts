/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { afterEach, test } from "node:test";
import { PRICE_DATA } from "../../src/lib/storage/storage.config.ts";
import type { Database } from "../db/db.types.ts";
import { getPriceBook } from "./prices.ts";

const realFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = realFetch;
});

/** Minimal in-memory stand-in for the two cache methods the price book uses. */
type FakeDb = Database & { readonly store: Map<string, string> };

function fakeDb(): FakeDb {
  const store = new Map<string, string>();
  const methods: Pick<Database, "getCache" | "getCacheStale" | "setCache"> = {
    getCache: (key) => store.get(key),
    getCacheStale: (key) => store.get(key),
    setCache: (key, value) => void store.set(key, value),
  };
  return { store, ...methods } as unknown as FakeDb;
}

function serve(files: Readonly<Record<string, unknown>>): { readonly calls: string[] } {
  const calls: string[] = [];
  globalThis.fetch = (async (input: string | URL | Request) => {
    const url = input instanceof Request ? input.url : input.toString();
    calls.push(url);
    const file = url.slice(PRICE_DATA.baseUrl.length + 1).replace(/\.json$/, "");
    if (!(file in files)) return new Response("nope", { status: 404 });
    return Response.json(files[file]);
  }) as typeof fetch;
  return { calls };
}

// Each test uses its own currency so the module-level memory cache never leaks between them.

test("converts each marketplace's feed shape into the chosen currency", async () => {
  serve({
    [PRICE_DATA.ratesFile]: { AAA: 2 },
    buff163: {
      "AK-47 | Redline (Field-Tested)": { starting_at: { price: 10 } },
      Unlisted: { starting_at: null },
      Zero: { starting_at: { price: 0 } },
      Negative: { starting_at: { price: -4 } },
      NaN: { starting_at: { price: "12" } },
    },
  });
  const book = await getPriceBook(fakeDb(), "AAA", "buff163");
  assert.deepEqual([...book.byName.keys()], ["AK-47 | Redline (Field-Tested)"]);
  assert.equal(book.byName.get("AK-47 | Redline (Field-Tested)")?.price, 20);
});

test("steam falls back from 24h to 7d to 30d averages", async () => {
  serve({
    [PRICE_DATA.ratesFile]: { BBB: 1 },
    steam: {
      day: { last_24h: 1, last_7d: 2, last_30d: 3 },
      week: { last_24h: 0, last_7d: 2, last_30d: 3 },
      month: { last_7d: null, last_30d: 3 },
    },
  });
  const book = await getPriceBook(fakeDb(), "BBB", "steam");
  assert.deepEqual(
    ["day", "week", "month"].map((name) => book.byName.get(name)?.price),
    [1, 2, 3],
  );
});

test("Doppler phase prices are converted and junk phases dropped", async () => {
  serve({
    [PRICE_DATA.ratesFile]: { CCC: 3 },
    buff163: {
      "Doppler Knife": {
        starting_at: { price: 100, doppler: { "Phase 1": 100, Ruby: 500, Broken: null } },
      },
    },
  });
  const entry = (await getPriceBook(fakeDb(), "CCC", "buff163")).byName.get("Doppler Knife");
  assert.equal(entry?.price, 300);
  assert.deepEqual(entry?.phases, { "Phase 1": 300, Ruby: 1500 });
});

test("an unknown currency is an error rather than a zero-priced book", async () => {
  serve({ [PRICE_DATA.ratesFile]: { USD: 1 }, skinport: {} });
  await assert.rejects(() => getPriceBook(fakeDb(), "ZZZ", "skinport"), /No exchange rate for ZZZ/);
});

test("a fresh book is served from memory without refetching", async () => {
  const { calls } = serve({
    [PRICE_DATA.ratesFile]: { DDD: 1 },
    skinport: { Case: { starting_at: 1 } },
  });
  const db = fakeDb();
  const first = await getPriceBook(db, "DDD", "skinport");
  const callsAfterFirst = calls.length;
  const second = await getPriceBook(db, "DDD", "skinport");
  assert.equal(second, first);
  assert.equal(calls.length, callsAfterFirst);
  assert.ok(db.store.has(`${PRICE_DATA.cachePrefix}DDD:skinport`), "persisted for restarts");
});

test("concurrent first loads share one network fetch", async () => {
  const { calls } = serve({
    [PRICE_DATA.ratesFile]: { EEE: 1 },
    skinport: { Case: { starting_at: 1 } },
  });
  const db = fakeDb();
  const [a, b] = await Promise.all([
    getPriceBook(db, "EEE", "skinport"),
    getPriceBook(db, "EEE", "skinport"),
  ]);
  assert.equal(a, b);
  assert.equal(calls.length, 2, "one feed + one rates file");
});

test("a failed forced refresh falls back to the last stored book", async () => {
  serve({ [PRICE_DATA.ratesFile]: { FFF: 1 }, skinport: { Case: { starting_at: 4 } } });
  const db = fakeDb();
  await getPriceBook(db, "FFF", "skinport");
  serve({});
  const book = await getPriceBook(db, "FFF", "skinport", true);
  assert.equal(book.byName.get("Case")?.price, 4);
});

test("with nothing cached, a source outage surfaces as an error", async () => {
  serve({});
  await assert.rejects(
    () => getPriceBook(fakeDb(), "GGG", "skinport"),
    /Price source returned 404/,
  );
});
