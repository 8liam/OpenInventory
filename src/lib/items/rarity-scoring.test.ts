/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ItemView } from "./item.types.ts";
import { scoreItemRarity } from "./rarity-scoring.ts";

function item(overrides: Partial<ItemView> = {}): ItemView {
  return {
    id: "item",
    name: "AK-47 | Case Hardened",
    marketHashName: "AK-47 | Case Hardened (Factory New)",
    imageUrl: null,
    rarityColor: null,
    rarityName: null,
    category: "Rifle",
    customName: null,
    wear: 0.03,
    wearName: "Factory New",
    minWear: 0,
    maxWear: 1,
    paintSeed: 661,
    isStatTrak: false,
    isSouvenir: false,
    stickers: [],
    charms: [],
    pattern: null,
    videoUrl: null,
    terminal: null,
    tradableAfter: null,
    price: 100,
    locationId: "inventory",
    locationName: "Inventory",
    ...overrides,
  };
}

describe("scoreItemRarity", () => {
  it("scores an extreme float relative to the skin's configured wear range", () => {
    const score = scoreItemRarity(item({ paintSeed: null }));
    assert.equal(score.score, 30);
    assert.deepEqual(
      score.badges.map(({ label }) => label),
      ["Low float"],
    );
  });

  it("flags configured blue gem patterns", () => {
    const score = scoreItemRarity(item({ wear: 0.5, paintSeed: 661 }));
    assert.equal(score.score, 45);
    assert.equal(score.badges[0]?.label, "Blue Gem #661");
  });

  it("shows configured craft estimates with an explicit USD premium", () => {
    const score = scoreItemRarity(
      item({
        wear: 0.5,
        paintSeed: null,
        stickers: [{ name: "Crown (Foil)", imageUrl: null }],
      }),
    );
    assert.equal(score.estimatedPremiumUsd, 8);
    assert.equal(score.badges[0]?.label, "Valuable craft");
  });

  it("does not infer rarity when float bounds or attachment references are unavailable", () => {
    const score = scoreItemRarity(item({ minWear: null, maxWear: null, paintSeed: null }));
    assert.equal(score.score, 0);
    assert.equal(score.estimatedPremiumUsd, null);
    assert.deepEqual(score.badges, []);
  });
});
