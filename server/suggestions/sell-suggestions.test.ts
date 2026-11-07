/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { INVENTORY_LOCATION_ID } from "../../src/lib/items/item.types.ts";
import type { PriceTrend } from "../prices/prices.ts";
import { SELL_SUGGESTIONS } from "./sell-suggestions.config.ts";
import { findSellSuggestions, thresholdsFor } from "./sell-suggestions.ts";
import type { SuggestionItem } from "./sell-suggestions.types.ts";

const NOW = 1_000_000;
const thresholds = thresholdsFor(1);
const STORAGE_ID = "unit-1";

function copy(overrides: Partial<SuggestionItem> & Pick<SuggestionItem, "id">): SuggestionItem {
  return {
    name: "AK-47 | Redline (Field-Tested)",
    marketHashName: "AK-47 | Redline (Field-Tested)",
    imageUrl: null,
    rarityColor: null,
    locationId: INVENTORY_LOCATION_ID,
    price: 10,
    tradableAfter: null,
    ...overrides,
  };
}

function trendOf(last24h: number, last7d: number, last30d: number, last90d: number): PriceTrend {
  return { last24h, last7d, last30d, last90d };
}

const NAME = "AK-47 | Redline (Field-Tested)";

test("a 24h average at exactly the spike ratio over the 30-day average is a spike", () => {
  const trends = new Map([[NAME, trendOf(12.5, 10, 10, 10)]]);
  const [suggestion] = findSellSuggestions({
    items: [copy({ id: "1" })],
    trends,
    thresholds,
    now: NOW,
  });
  const spike = suggestion?.reasons.find((r) => r.kind === "spike");
  assert.ok(spike, "spike expected");
  assert.equal(spike.change, 0.25);
  assert.deepEqual(spike.itemKeys, [`${INVENTORY_LOCATION_ID}:1`]);
});

test("just under the spike ratio is not a spike", () => {
  const trends = new Map([[NAME, trendOf(12.4, 10, 10, 10)]]);
  const suggestions = findSellSuggestions({
    items: [copy({ id: "1" })],
    trends,
    thresholds,
    now: NOW,
  });
  assert.deepEqual(suggestions, []);
});

test("a monotonic fall across all four windows is a steady decline", () => {
  const trends = new Map([[NAME, trendOf(8, 9, 10, 12)]]);
  const [suggestion] = findSellSuggestions({
    items: [copy({ id: "1" })],
    trends,
    thresholds,
    now: NOW,
  });
  const decline = suggestion?.reasons.find((r) => r.kind === "decline");
  assert.ok(decline, "decline expected");
  assert.ok(Math.abs(decline.change - (8 / 12 - 1)) < 1e-9);
});

test("a dip that is not monotonic across the windows is not a decline", () => {
  // 30d sits below 7d: the trend reversed, so no steady decline.
  const trends = new Map([[NAME, trendOf(8, 12, 10, 12)]]);
  const suggestions = findSellSuggestions({
    items: [copy({ id: "1" })],
    trends,
    thresholds,
    now: NOW,
  });
  assert.deepEqual(suggestions, []);
});

test("a monotonic fall smaller than the decline share is not flagged", () => {
  const trends = new Map([[NAME, trendOf(11, 11.5, 12, 12.5)]]);
  const suggestions = findSellSuggestions({
    items: [copy({ id: "1" })],
    trends,
    thresholds,
    now: NOW,
  });
  assert.deepEqual(suggestions, []);
});

test("trend signals are skipped below the minimum trend price", () => {
  const floor = thresholds.minTrendPrice;
  const low = floor / 2;
  const trends = new Map([[NAME, trendOf(low, low / 2, low / 4, low / 8)]]);
  const suggestions = findSellSuggestions({
    items: [copy({ id: "1", price: low })],
    trends,
    thresholds,
    now: NOW,
  });
  assert.deepEqual(suggestions, []);
});

test("an item without trend averages gets no trend reasons", () => {
  const suggestions = findSellSuggestions({
    items: [copy({ id: "1" })],
    trends: new Map(),
    thresholds,
    now: NOW,
  });
  assert.deepEqual(suggestions, []);
});

test("many cheap copies sitting in storage are an idle stack", () => {
  const items = Array.from({ length: SELL_SUGGESTIONS.idleMinCount }, (_, index) =>
    copy({ id: `s${index}`, locationId: STORAGE_ID, price: 0.5 }),
  );
  const [suggestion] = findSellSuggestions({ items, trends: new Map(), thresholds, now: NOW });
  const idle = suggestion?.reasons.find((r) => r.kind === "idle-stack");
  assert.ok(idle, "idle stack expected");
  assert.equal(idle.unitPrice, 0.5);
  assert.equal(idle.itemKeys.length, SELL_SUGGESTIONS.idleMinCount);
});

test("one copy fewer than the idle minimum is not a stack", () => {
  const items = Array.from({ length: SELL_SUGGESTIONS.idleMinCount - 1 }, (_, index) =>
    copy({ id: `s${index}`, locationId: STORAGE_ID, price: 0.5 }),
  );
  assert.deepEqual(findSellSuggestions({ items, trends: new Map(), thresholds, now: NOW }), []);
});

test("inventory copies never count toward an idle stack", () => {
  const items = Array.from({ length: SELL_SUGGESTIONS.idleMinCount }, (_, index) =>
    copy({ id: `i${index}`, price: 0.5 }),
  );
  assert.deepEqual(findSellSuggestions({ items, trends: new Map(), thresholds, now: NOW }), []);
});

test("a stack worth more than the idle unit ceiling is not idle", () => {
  const items = Array.from({ length: SELL_SUGGESTIONS.idleMinCount }, (_, index) =>
    copy({
      id: `s${index}`,
      locationId: STORAGE_ID,
      price: thresholds.idleMaxUnitPrice + 0.01,
    }),
  );
  assert.deepEqual(findSellSuggestions({ items, trends: new Map(), thresholds, now: NOW }), []);
});

test("an item can carry a spike and an idle stack at once", () => {
  const items = Array.from({ length: SELL_SUGGESTIONS.idleMinCount }, (_, index) =>
    copy({ id: `s${index}`, locationId: STORAGE_ID, price: 0.5 }),
  );
  // 1.5 is 50% over the 30-day average and clears the USD trend floor at a 1x rate.
  const trends = new Map([[NAME, trendOf(1.5, 1, 1, 1)]]);
  const [suggestion] = findSellSuggestions({ items, trends, thresholds, now: NOW });
  assert.deepEqual(
    suggestion?.reasons.map((r) => r.kind),
    ["spike", "idle-stack"],
  );
});

test("copies still locked from trading are excluded from the reasons", () => {
  const trends = new Map([[NAME, trendOf(12.5, 10, 10, 10)]]);
  const items = [
    copy({ id: "locked", tradableAfter: NOW + 1 }),
    copy({ id: "free", tradableAfter: NOW - 1 }),
  ];
  const [suggestion] = findSellSuggestions({ items, trends, thresholds, now: NOW });
  const spike = suggestion?.reasons.find((r) => r.kind === "spike");
  assert.deepEqual(spike?.itemKeys, [`${INVENTORY_LOCATION_ID}:free`]);
});

test("when every copy is locked there is nothing to suggest", () => {
  const trends = new Map([[NAME, trendOf(12.5, 10, 10, 10)]]);
  const items = [copy({ id: "locked", tradableAfter: NOW + 1 })];
  assert.deepEqual(findSellSuggestions({ items, trends, thresholds, now: NOW }), []);
});

test("items without a market hash name are skipped", () => {
  const trends = new Map([[NAME, trendOf(12.5, 10, 10, 10)]]);
  const items = [copy({ id: "1", marketHashName: null })];
  assert.deepEqual(findSellSuggestions({ items, trends, thresholds, now: NOW }), []);
});

test("suggestions are ranked by the value of the sellable copies they cover", () => {
  const trends = new Map([
    ["Cheap", trendOf(12.5, 10, 10, 10)],
    ["Dear", trendOf(125, 100, 100, 100)],
  ]);
  const items = [
    copy({ id: "a", name: "Cheap", marketHashName: "Cheap", price: 12.5 }),
    copy({ id: "b", name: "Dear", marketHashName: "Dear", price: 125 }),
  ];
  const suggestions = findSellSuggestions({ items, trends, thresholds, now: NOW });
  assert.deepEqual(
    suggestions.map((s) => s.key),
    ["Dear", "Cheap"],
  );
});

test("thresholds scale the USD minimums into the book currency", () => {
  const scaled = thresholdsFor(0.5);
  assert.equal(scaled.minTrendPrice, SELL_SUGGESTIONS.minTrendPriceUsd * 0.5);
  assert.equal(scaled.idleMaxUnitPrice, SELL_SUGGESTIONS.idleMaxUnitPriceUsd * 0.5);
  assert.equal(scaled.spikeRatio, SELL_SUGGESTIONS.spikeRatio);
});
