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
const prices = { byName: new Map([["★ Bayonet", { price: 100 }]]) } as unknown as PriceBook;

function covert(id: string, skinId: string, statTrak = false): TradeUpCandidate {
  const skin: SkinFacts = {
    skinId,
    collectionIds: [],
    rarityId: TRADE_UP.covertRarity,
    isStatTrak: statTrak,
    isSouvenir: false,
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
  assert.equal(result.expectedValue, 50);
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
