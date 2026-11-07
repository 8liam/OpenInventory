/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ItemView } from "../../lib/items/item.types.ts";
import { columnsFor, sortItems } from "./item-grid.utils.ts";

function item(id: string, name: string, price: number | null, wear: number | null): ItemView {
  return {
    id,
    name,
    marketHashName: name,
    imageUrl: null,
    rarityColor: null,
    rarityName: null,
    category: "Rifle",
    customName: null,
    wear,
    wearName: null,
    isStatTrak: false,
    isSouvenir: false,
    stickers: [],
    charms: [],
    pattern: null,
    videoUrl: null,
    terminal: null,
    tradableAfter: null,
    price,
    locationId: "inventory",
    locationName: "Inventory",
  };
}

const ITEMS = [
  item("a", "AK-47 | Redline", 10, 0.3),
  item("b", "AWP | Asiimov", null, null),
  item("c", "M4A4 | Howl", 400, 0.01),
];
const ids = (sorted: readonly ItemView[]) => sorted.map((i) => i.id).join("");

describe("sortItems", () => {
  it("sorts by price with unpriced items last in both directions", () => {
    assert.equal(ids(sortItems(ITEMS, "price-desc")), "cab");
    assert.equal(ids(sortItems(ITEMS, "price-asc")), "acb");
  });
  it("sorts by float with missing floats last in both directions", () => {
    assert.equal(ids(sortItems(ITEMS, "float-asc")), "cab");
    assert.equal(ids(sortItems(ITEMS, "float-desc")), "acb");
  });
  it("sorts by name and leaves the input untouched", () => {
    assert.equal(ids(sortItems(ITEMS, "name")), "abc");
    assert.equal(ids(ITEMS), "abc");
  });
  it("sorts highlights first: by tier, then price, then untiered, without mutating the input", () => {
    const base = item("a", "AK-47 | Redline", 500, 0.3);
    const gem = (id: string, seed: number, price: number): ItemView => ({
      ...base,
      id,
      name: "AK-47 | Case Hardened",
      paintSeed: seed,
      price,
    });
    const floatOnly: ItemView = {
      ...base,
      id: "f",
      price: 900,
      wear: 0.0005,
      minWear: 0,
      maxWear: 1,
    };
    const input = [
      base,
      floatOnly,
      gem("t3", 11, 50),
      gem("t1cheap", 661, 100),
      gem("t1rich", 151, 300),
    ];
    const before = ids(input);
    assert.deepEqual(
      sortItems(input, "highlights-desc").map(({ id }) => id),
      ["t1rich", "t1cheap", "t3", "f", "a"],
    );
    assert.equal(ids(input), before);
  });
});

describe("columnsFor", () => {
  it("fits as many minimum-width cards as the width allows", () => {
    assert.equal(columnsFor(1168, 160, 12, 12), 6);
    assert.equal(columnsFor(358, 160, 12, 12), 2);
  });
  it("never returns fewer than one column", () => {
    assert.equal(columnsFor(0, 160, 12, 12), 1);
    assert.equal(columnsFor(120, 160, 12, 12), 1);
  });
});
