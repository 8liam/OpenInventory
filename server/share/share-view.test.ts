/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { buildSharedInventory, selectForScope } from "./share-view.ts";
import { makeItem, PRIVATE, UNIT } from "./share.fixtures.ts";

/** The only keys a shared item may carry; anything else is a leak. */
const SHARED_ITEM_KEYS = [
  "name",
  "marketHashName",
  "imageUrl",
  "rarityColor",
  "rarityName",
  "category",
  "customName",
  "wear",
  "wearName",
  "isStatTrak",
  "isSouvenir",
  "stickers",
  "charms",
  "locationName",
  "price",
] as const;

const ITEMS = [
  makeItem(),
  makeItem({ id: "1", locationId: "inventory", locationName: "Inventory", price: null }),
];

test("the public payload carries exactly the whitelisted item fields", () => {
  const selection = selectForScope({ kind: "all" }, ITEMS, [UNIT]);
  assert.ok(selection);
  const view = buildSharedInventory({
    selection,
    hidePrices: false,
    currency: "USD",
    expiresAt: null,
  });
  for (const item of view.items) {
    assert.deepEqual(Object.keys(item).sort(), [...SHARED_ITEM_KEYS].sort());
  }
});

test("no owner identifiers, Terminal state or asset ids appear anywhere in the payload", () => {
  const selection = selectForScope({ kind: "all" }, ITEMS, [UNIT]);
  assert.ok(selection);
  const json = JSON.stringify(
    buildSharedInventory({ selection, hidePrices: false, currency: "USD", expiresAt: null }),
  );
  for (const secret of [
    PRIVATE.steamId,
    PRIVATE.personaName,
    PRIVATE.assetId,
    PRIVATE.unitId,
    String(PRIVATE.terminalExpiry),
    "1800000000000",
    "terminal",
    "tradableAfter",
    "locationId",
    '"id"',
  ]) {
    assert.equal(json.includes(secret), false, `payload leaks ${secret}`);
  }
});

test("hidden prices drop the price key and every total", () => {
  const selection = selectForScope({ kind: "all" }, ITEMS, [UNIT]);
  assert.ok(selection);
  const view = buildSharedInventory({
    selection,
    hidePrices: true,
    currency: "USD",
    expiresAt: null,
  });
  assert.equal(view.currency, null);
  assert.equal(view.totalValue, null);
  for (const item of view.items) assert.equal("price" in item, false);
  assert.equal(JSON.stringify(view).includes("12.5"), false);
});

test("totals sum the priced items only", () => {
  const selection = selectForScope({ kind: "all" }, ITEMS, [UNIT]);
  assert.ok(selection);
  const view = buildSharedInventory({
    selection,
    hidePrices: false,
    currency: "EUR",
    expiresAt: 5,
  });
  assert.equal(view.currency, "EUR");
  assert.equal(view.totalValue, 12.5);
  assert.equal(view.expiresAt, 5);
});

test("a unit scope keeps only that unit's items and is titled with its name", () => {
  const other = makeItem({ id: "2", locationId: "other-unit", locationName: "Other" });
  const selection = selectForScope({ kind: "unit", unitId: UNIT.id }, [...ITEMS, other], [UNIT]);
  assert.equal(selection?.title, UNIT.name);
  assert.deepEqual(
    selection?.items.map((i) => i.id),
    [PRIVATE.assetId],
  );
});

test("an item scope keeps only the named items, and ids that left drop out", () => {
  const selection = selectForScope({ kind: "items", itemIds: [PRIVATE.assetId, "404"] }, ITEMS, [
    UNIT,
  ]);
  assert.deepEqual(
    selection?.items.map((i) => i.id),
    [PRIVATE.assetId],
  );
});

test("a unit scope naming a unit that no longer exists selects nothing", () => {
  assert.equal(selectForScope({ kind: "unit", unitId: "gone" }, ITEMS, [UNIT]), undefined);
});
