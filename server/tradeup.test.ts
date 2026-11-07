/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { INVENTORY_LOCATION_ID, type ItemView } from "../src/lib/items/item.types.ts";
import { TRADE_UP } from "../src/lib/storage/storage.config.ts";
import type { Catalog, SkinFacts } from "./items/catalog.types.ts";
import type { PriceBook } from "./prices/prices.ts";
import { computeTradeUp, listTradeUpCandidates, type TradeUpCandidate } from "./tradeup.ts";
import { findTradeUps } from "./tradeup-finder.ts";

const knives = [
  { id: "k1", name: "★ Bayonet" },
  { id: "k2", name: "★ Karambit" },
];
const catalog = {
  specialsFor: (skinId: string) => (skinId === "no-pool" ? [] : knives),
  resolveSpecial: (special: { id: string; name: string }) => ({
    id: special.id,
    name: `${special.name} | Fade`,
    marketHashName: special.name,
    imageUrl: null,
    minFloat: 0,
    maxFloat: 0.08,
    wearName: "Factory New",
  }),
} as unknown as Catalog;
const prices = {
  byName: new Map([
    ["★ Bayonet", { price: 100 }],
    ["★ Karambit", { price: 80 }],
  ]),
} as unknown as PriceBook;

function covert(id: string, skinId: string, statTrak = false): TradeUpCandidate {
  const skin: SkinFacts = {
    skinId,
    collectionIds: [],
    rarityId: TRADE_UP.covertRarity,
    isStatTrak: statTrak,
    isSouvenir: false,
    minFloat: 0,
    maxFloat: 1,
  };
  const view = {
    id,
    price: 10,
    wear: 0.1,
    tradableAfter: null,
    isStatTrak: statTrak,
    locationId: INVENTORY_LOCATION_ID,
  } as ItemView;
  return { view, skin };
}

const pool = ["a", "b", "c", "d", "e", "f"].map((id) => covert(id, id));

test("covert trade-ups take five inputs and only list skins with a knife pool", () => {
  const listed = listTradeUpCandidates(
    [...pool, covert("x", "no-pool")],
    TRADE_UP.covertRarity,
    catalog,
    "USD",
  );
  assert.ok(listed.ok);
  assert.equal(listed.inputCount, TRADE_UP.covertInputCount);
  assert.equal(listed.candidates.length, pool.length);
});

test("covert odds split evenly across the knife pool and sum to one", () => {
  const result = computeTradeUp(
    pool,
    ["a", "b", "c", "d", "e"],
    TRADE_UP.covertRarity,
    catalog,
    prices,
    "USD",
  );
  assert.ok(result.ok);
  assert.equal(result.outcomes.length, 2);
  assert.ok(Math.abs(result.outcomes.reduce((sum, o) => sum + o.probability, 0) - 1) < 1e-9);
  assert.equal(result.expectedValue, 90);
});

test("rejects too many, mixed StatTrak or unknown inputs", () => {
  const all = [...pool, covert("st", "st", true)];
  const run = (ids: string[]) =>
    computeTradeUp(all, ids, TRADE_UP.covertRarity, catalog, prices, "USD");
  assert.equal(run(["a", "b", "c", "d", "e", "f"]).ok, false);
  assert.equal(run(["a", "st"]).ok, false);
  assert.equal(run(["nope"]).ok, false);
});

test("finder ranks complete contracts and excludes storage and trade-locked items by default", () => {
  const locked = {
    ...covert("locked", "locked"),
    view: { ...covert("locked", "locked").view, tradableAfter: 1 },
  };
  const stored = {
    ...covert("stored", "stored"),
    view: { ...covert("stored", "stored").view, locationId: "unit" },
  };
  const result = findTradeUps(
    [...pool, locked, stored],
    { rarityId: TRADE_UP.covertRarity, statTrak: "all", includeStorage: false },
    catalog,
    prices,
    "USD",
  );
  assert.equal(result.results.length, 2);
  assert.ok(
    result.results.every((contract) => contract.inputs.length === TRADE_UP.covertInputCount),
  );
  assert.ok(result.results.every((contract) => !contract.inputIds.includes("locked")));
  assert.ok(result.results.every((contract) => !contract.inputIds.includes("stored")));
  assert.ok(result.results[0]!.profit >= result.results[1]!.profit);
});

const NEXT_RARITY = TRADE_UP.rarityOrder[1]!;
const BASE_RARITY = TRADE_UP.rarityOrder[0]!;
const outputs = [
  { name: "Out A", market_hash_name: "Out A", min_float: 0, max_float: 1 },
  { name: "Out B", market_hash_name: "Out B", min_float: 0, max_float: 0.5 },
];
const skinCatalog = {
  specialsFor: () => [],
  tradeUpOutputs: (_c: string, r: string) => (r === NEXT_RARITY ? outputs : []),
  resolveWear: (o: unknown) => o,
  skinImage: () => null,
} as unknown as Catalog;
const skinPrices = {
  byName: new Map([
    ["Out A", { price: 100 }],
    ["Out B", { price: 50 }],
  ]),
} as unknown as PriceBook;

function skinInput(
  id: string,
  wear: number,
  price: number | null,
  minFloat = 0,
  maxFloat = 1,
): TradeUpCandidate {
  const skin: SkinFacts = {
    skinId: id,
    collectionIds: ["C1"],
    rarityId: BASE_RARITY,
    isStatTrak: false,
    isSouvenir: false,
    minFloat,
    maxFloat,
  };
  const view = {
    id,
    price,
    wear,
    tradableAfter: null,
    isStatTrak: false,
    locationId: INVENTORY_LOCATION_ID,
  } as ItemView;
  return { view, skin };
}

const tenOf = (wear: number, minFloat?: number, maxFloat?: number) =>
  Array.from({ length: 10 }, (_, i) => skinInput(`s${i}`, wear, 1, minFloat, maxFloat));
const idsOf = (inputs: readonly TradeUpCandidate[]) => inputs.map((c) => c.view.id);

test("an unpriced input is rejected and not listed", () => {
  const inputs = [...tenOf(0.2).slice(0, 9), skinInput("free", 0.2, null)];
  const odds = computeTradeUp(inputs, idsOf(inputs), BASE_RARITY, skinCatalog, skinPrices, "USD");
  assert.equal(odds.ok, false);
  assert.ok(!odds.ok && odds.reason.includes("no price"));
  const listed = listTradeUpCandidates(inputs, BASE_RARITY, skinCatalog, "USD");
  assert.ok(listed.ok);
  assert.ok(!listed.candidates.some((view) => view.id === "free"));
});

test("the finder never returns a contract with an unpriced input", () => {
  const inputs = [...tenOf(0.2).slice(0, 9), skinInput("free", 0.2, null)];
  const options = { rarityId: BASE_RARITY, statTrak: "all", includeStorage: true } as const;
  const none = findTradeUps(inputs, options, skinCatalog, skinPrices, "USD");
  assert.equal(none.results.length, 0);
  const more = [...inputs, skinInput("paid", 0.2, 1)];
  const found = findTradeUps(more, options, skinCatalog, skinPrices, "USD");
  assert.ok(found.results.length > 0);
  assert.ok(found.results.every((r) => !r.inputIds.includes("free")));
});

test("the finder skips contracts whose outcomes have no price", () => {
  const unpriced = { byName: new Map() } as unknown as PriceBook;
  const options = { rarityId: BASE_RARITY, statTrak: "all", includeStorage: true } as const;
  assert.equal(findTradeUps(tenOf(0.2), options, skinCatalog, unpriced, "USD").results.length, 0);
});

test("output float uses each input's range-normalised float", () => {
  const inputs = tenOf(0.43, 0.06, 0.8);
  const odds = computeTradeUp(inputs, idsOf(inputs), BASE_RARITY, skinCatalog, skinPrices, "USD");
  assert.ok(odds.ok);
  assert.ok(Math.abs(odds.averageFloat - 0.5) < 1e-9);
  const outA = odds.outcomes.find((o) => o.name === "Out A");
  const outB = odds.outcomes.find((o) => o.name === "Out B");
  assert.ok(Math.abs((outA?.float ?? NaN) - 0.5) < 1e-9);
  assert.ok(Math.abs((outB?.float ?? NaN) - 0.25) < 1e-9);
});

test("a full-range input keeps its raw float", () => {
  const inputs = tenOf(0.2);
  const odds = computeTradeUp(inputs, idsOf(inputs), BASE_RARITY, skinCatalog, skinPrices, "USD");
  assert.ok(odds.ok);
  assert.ok(Math.abs(odds.averageFloat - 0.2) < 1e-9);
  assert.ok(Math.abs((odds.outcomes.find((o) => o.name === "Out A")?.float ?? NaN) - 0.2) < 1e-9);
});

test("covert outcomes resolve from the normalised average float", () => {
  const seen: number[] = [];
  const spy = {
    ...catalog,
    resolveSpecial: (special: { id: string; name: string }, _st: boolean, float: number) => {
      seen.push(float);
      return {
        id: special.id,
        name: special.name,
        marketHashName: special.name,
        imageUrl: null,
        minFloat: 0,
        maxFloat: 0.5,
        wearName: "Factory New",
      };
    },
  } as unknown as Catalog;
  const inputs = ["a", "b", "c", "d", "e"].map((id) => {
    const base = covert(id, id);
    return {
      view: { ...base.view, wear: 0.43 },
      skin: { ...base.skin, minFloat: 0.06, maxFloat: 0.8 },
    };
  });
  const odds = computeTradeUp(inputs, idsOf(inputs), TRADE_UP.covertRarity, spy, prices, "USD");
  assert.ok(odds.ok);
  assert.ok(seen.length > 0 && seen.every((f) => Math.abs(f - 0.5) < 1e-9));
  assert.ok(odds.outcomes.every((o) => Math.abs((o.float ?? NaN) - 0.25) < 1e-9));
});
