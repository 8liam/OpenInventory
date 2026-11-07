/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { INVENTORY_LOCATION_ID, type ItemView } from "../src/lib/items/item.types.ts";
import { DASHBOARD } from "../src/lib/storage/storage.config.ts";
import { buildDashboard, mergeHistories, summarizeValue } from "./dashboard.ts";
import type { ValueSnapshot } from "./db/db.types.ts";

const NOW = 1_800_000_000_000;
const STORAGE_ID = "unit-1";

function item(id: string, overrides: Partial<ItemView> = {}): ItemView {
  return {
    id,
    name: `Item ${id}`,
    marketHashName: `Item ${id} (Factory New)`,
    imageUrl: null,
    rarityColor: "#fff",
    rarityName: "Mil-Spec",
    category: "Rifle",
    customName: null,
    wear: null,
    wearName: null,
    isStatTrak: false,
    isSouvenir: false,
    stickers: [],
    charms: [],
    pattern: null,
    videoUrl: null,
    terminal: null,
    tradableAfter: null,
    price: 10,
    locationId: INVENTORY_LOCATION_ID,
    locationName: "Inventory",
    accountId: "1",
    ...overrides,
  };
}

function snapshot(ageMs: number, totalValue: number): ValueSnapshot {
  return {
    takenAt: NOW - ageMs,
    totalValue,
    inventoryValue: totalValue,
    storageValue: 0,
    itemCount: 1,
  };
}

function build(items: readonly ItemView[], history: readonly ValueSnapshot[] = []) {
  return buildDashboard({
    items,
    history,
    currency: "USD",
    priceUpdatedAt: null,
    unitsLoaded: 1,
    unitsTotal: 1,
    now: NOW,
  });
}

test("summarizeValue splits inventory from storage and treats unpriced items as zero", () => {
  const totals = summarizeValue([
    item("a", { price: 5 }),
    item("b", { price: null }),
    item("c", { price: 20, locationId: STORAGE_ID, locationName: "Unit" }),
  ]);
  assert.deepEqual(totals, { inventoryValue: 5, storageValue: 20, totalValue: 25 });
});

test("change windows use the newest snapshot at least one window old", () => {
  const { dayMs } = DASHBOARD;
  const dash = build(
    [item("a", { price: 100 })],
    [
      snapshot(40 * dayMs, 10),
      snapshot(8 * dayMs, 40),
      snapshot(2 * dayMs, 70),
      snapshot(dayMs, 90),
      snapshot(1000, 99),
    ],
  );
  // day: newest snapshot at least 24h old is exactly 1 day old (90); week: 8d old (40); month: 40d old (10).
  assert.deepEqual(dash.change, { day: 10, week: 60, month: 90 });
});

test("change is null until history is old enough, and can be negative", () => {
  const { dayMs } = DASHBOARD;
  const young = build([item("a", { price: 50 })], [snapshot(1000, 60)]);
  assert.deepEqual(young.change, { day: null, week: null, month: null });
  const dropped = build([item("a", { price: 50 })], [snapshot(2 * dayMs, 80)]);
  assert.equal(dropped.change.day, -30);
  assert.equal(dropped.change.week, null);
});

test("history ends with a live point for the current totals", () => {
  const dash = build(
    [item("a", { price: 7 }), item("b", { price: 3, locationId: STORAGE_ID, locationName: "U" })],
    [snapshot(DASHBOARD.dayMs, 1)],
  );
  assert.equal(dash.history.length, 2);
  assert.deepEqual(dash.history.at(-1), {
    takenAt: NOW,
    totalValue: 10,
    inventoryValue: 7,
    storageValue: 3,
  });
  assert.equal(dash.totals.itemCount, 2);
});

test("slices are sorted by value and unknown rarity is grouped as Other", () => {
  const dash = build([
    item("a", { category: "Rifle", price: 5, rarityName: null, rarityColor: null }),
    item("b", { category: "Knife", price: 500 }),
    item("c", { category: "Rifle", price: 20 }),
  ]);
  assert.deepEqual(
    dash.byCategory.map((s) => [s.label, s.value, s.count]),
    [
      ["Knife", 500, 1],
      ["Rifle", 25, 2],
    ],
  );
  assert.ok(dash.byRarity.some((s) => s.label === "Other" && s.value === 5));
});

test("wear slices follow canonical wear order and skip wearless items", () => {
  const dash = build([
    item("a", { wearName: "Battle-Scarred", price: 1 }),
    item("b", { wearName: "Factory New", price: 2 }),
    item("c", { wearName: "Factory New", price: 3 }),
    item("d", { wearName: null, price: 99 }),
  ]);
  assert.deepEqual(
    dash.byWear.map((s) => [s.label, s.value, s.count]),
    [
      ["Factory New", 5, 2],
      ["Battle-Scarred", 1, 1],
    ],
  );
});

test("inventory sorts first among locations, then storage by value", () => {
  const dash = build([
    item("a", { price: 1 }),
    item("b", { price: 5, locationId: "u-small", locationName: "Small" }),
    item("c", { price: 50, locationId: "u-big", locationName: "Big" }),
  ]);
  assert.deepEqual(
    dash.byLocation.map((l) => l.id),
    [INVENTORY_LOCATION_ID, "u-big", "u-small"],
  );
});

test("holdings stack by market hash name and only 2+ copies count as stacks", () => {
  const dash = build([
    item("a", { marketHashName: "Case", name: "Case", price: 2 }),
    item("b", { marketHashName: "Case", name: "Case", price: 2 }),
    item("c", { marketHashName: "Case", name: "Case", price: 2 }),
    item("d", { marketHashName: "Knife", name: "Knife", price: 1000 }),
  ]);
  assert.equal(dash.topHoldings[0]?.name, "Knife");
  const caseHolding = dash.topHoldings.find((h) => h.name === "Case");
  assert.deepEqual(
    [caseHolding?.count, caseHolding?.totalValue, caseHolding?.unitPrice],
    [3, 6, 2],
  );
  assert.deepEqual(
    dash.insights.stacks.map((s) => s.name),
    ["Case"],
  );
});

test("float highlights are ordered, capped and skip floatless items", () => {
  const items = Array.from({ length: 8 }, (_, i) => item(`f${i}`, { wear: i / 10 }));
  const dash = build([...items, item("nofloat", { wear: null })]);
  assert.equal(dash.insights.lowestFloats.length, DASHBOARD.highlightCount);
  assert.deepEqual(
    dash.insights.lowestFloats.map((f) => f.wear),
    [0, 0.1, 0.2, 0.3, 0.4],
  );
  assert.deepEqual(
    dash.insights.highestFloats.map((f) => f.wear),
    [0.7, 0.6, 0.5, 0.4, 0.3],
  );
});

test("empty inventory yields a zeroed dashboard without throwing", () => {
  const dash = build([]);
  assert.equal(dash.totals.value, 0);
  assert.deepEqual(dash.byCategory, []);
  assert.deepEqual(dash.topHoldings, []);
});

const HOUR = 3_600_000;
const point = (takenAt: number, totalValue: number): ValueSnapshot => ({
  takenAt,
  totalValue,
  inventoryValue: totalValue / 2,
  storageValue: totalValue / 2,
  itemCount: 1,
});

test("mergeHistories carries each account forward instead of zigzagging between them", () => {
  // A reports at :10 each hour, B at :40; summing raw timestamps would swing 100 -> 40 -> 100.
  const a = [point(10 * HOUR + 10, 100), point(11 * HOUR + 10, 100), point(12 * HOUR + 10, 100)];
  const b = [point(9 * HOUR + 40, 40), point(10 * HOUR + 40, 40), point(11 * HOUR + 40, 40)];
  const merged = mergeHistories([a, b], HOUR);
  assert.deepEqual(
    merged.map((m) => m.totalValue),
    [40, 140, 140, 140],
  );
  assert.equal(merged.at(-1)?.takenAt, 12 * HOUR + 10);
  assert.equal(merged.at(-1)?.itemCount, 2);
});

test("mergeHistories of one series is that series, and of none is empty", () => {
  const only = [point(HOUR, 5), point(3 * HOUR, 7)];
  assert.deepEqual(mergeHistories([only], HOUR), only);
  assert.deepEqual(mergeHistories([], HOUR), []);
  assert.deepEqual(mergeHistories([[], []], HOUR), []);
});

test("an account that starts reporting later adds to the total from then on", () => {
  const early = [point(HOUR, 10), point(2 * HOUR, 10), point(3 * HOUR, 10)];
  const late = [point(3 * HOUR + 5, 90)];
  assert.deepEqual(
    mergeHistories([early, late], HOUR).map((m) => m.totalValue),
    [10, 10, 100],
  );
});
