/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { itemRowKey } from "./item-key.ts";
import { matchesItem } from "./item-search.ts";
import type { ItemView } from "./item.types.ts";

const item: ItemView = {
  id: "asset-42",
  name: "AK-47 | Redline",
  marketHashName: "AK-47 | Redline (Field-Tested)",
  imageUrl: null,
  rarityColor: null,
  rarityName: null,
  category: "Rifle",
  customName: "My rifle",
  wear: 0.15,
  wearName: "Field-Tested",
  isStatTrak: false,
  isSouvenir: false,
  stickers: [{ name: "Crown Foil", imageUrl: null }],
  charms: [{ name: "Little Monster", imageUrl: null, pattern: null, videoUrl: null }],
  pattern: null,
  videoUrl: null,
  terminal: null,
  tradableAfter: null,
  price: 12.5,
  locationId: "unit-1",
  locationName: "Overflow",
  accountId: "1",
};

test("finds an item by identity, market name, attachments and location", () => {
  for (const query of [
    "ASSET-42",
    "redline",
    "field-tested",
    "my rifle",
    "crown",
    "monster",
    "overflow",
  ])
    assert.equal(matchesItem(item, query), true, query);
  assert.equal(matchesItem(item, "missing"), false);
});

test("a row key from a dashboard link matches only that exact item", () => {
  const key = itemRowKey(item);
  assert.equal(matchesItem(item, key), true);
  assert.equal(matchesItem({ ...item, id: `${item.id}1` }, key), false, "longer asset id");
  assert.equal(matchesItem({ ...item, locationId: "inventory" }, key), false, "other location");
  assert.equal(matchesItem({ ...item, accountId: "2" }, key), false, "other account");
});

test("the account's name or label can be searched when the page supplies it", () => {
  assert.equal(matchesItem(item, "trade acc"), false);
  assert.equal(matchesItem(item, "trade acc", "Trade Account · trade"), true);
});
