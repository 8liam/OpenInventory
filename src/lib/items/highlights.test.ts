/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ItemView } from "./item.types.ts";
import { highlightRank, highlightSortValue, itemHighlights } from "./highlights.ts";

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
    wear: 0.002,
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
    collections: [],
    accountId: "1",
    note: null,
    ...overrides,
  };
}

const labels = (highlights: ReturnType<typeof itemHighlights>) =>
  highlights.reasons.map(({ label }) => label);

describe("itemHighlights", () => {
  it("flags an extreme float relative to the skin's wear range and shows the float", () => {
    const result = itemHighlights(item({ paintSeed: null }));
    assert.deepEqual(labels(result), ["Float 0.0020"]);
    assert.equal(result.reasons[0]?.kind, "float");
    assert.equal(result.tier, null);
  });

  it("tiers a blue gem and names the seed in the pattern reason", () => {
    const result = itemHighlights(item({ wear: 0.5, paintSeed: 661 }));
    assert.deepEqual(labels(result), ["Blue gem #661"]);
    assert.equal(result.reasons[0]?.kind, "pattern");
    assert.equal(result.tier?.tier, 1);
    assert.equal(result.tier?.weapon, "AK-47");
  });

  it("labels fade tiers with the percentage band", () => {
    const result = itemHighlights(item({ wear: 0.5, name: "★ Bayonet | Fade", paintSeed: 763 }));
    assert.deepEqual(labels(result), ["100% Fade #763"]);
    assert.equal(result.tier?.tier, 1);
  });

  it("does not tier seeds that are not in the sourced lists", () => {
    const result = itemHighlights(item({ wear: 0.5, paintSeed: 770 }));
    assert.deepEqual(result.reasons, []);
    assert.equal(result.tier, null);
  });

  it("shows a plain sticker craft reason with no price", () => {
    const result = itemHighlights(
      item({
        wear: 0.5,
        paintSeed: null,
        stickers: [{ name: "Crown (Foil)", imageUrl: null }],
      }),
    );
    assert.deepEqual(labels(result), ["Sticker craft"]);
    assert.equal(result.reasons[0]?.kind, "craft");
    assert.equal(result.tier, null);
    assert.equal("estimatedPremiumUsd" in result, false);
  });

  it("does not infer highlights when float bounds or references are unavailable", () => {
    const result = itemHighlights(item({ minWear: null, maxWear: null, paintSeed: null }));
    assert.deepEqual(result.reasons, []);
    assert.equal(result.tier, null);
  });

  it("scores gem phases by paint kit with no seed in the label", () => {
    const sapphire = itemHighlights(
      item({ wear: 0.5, paintSeed: 12, name: "★ Karambit | Doppler", paintIndex: 416 }),
    );
    assert.deepEqual(labels(sapphire), ["Sapphire"]);
    assert.equal(sapphire.tier?.tier, 1);
    const common = itemHighlights(
      item({ wear: 0.5, paintSeed: 12, name: "★ Karambit | Doppler", paintIndex: 418 }),
    );
    assert.deepEqual(common.reasons, []);
  });

  it("keeps a float reason beside the pattern tier", () => {
    const result = itemHighlights(item({ wear: 0.002, paintSeed: 661 }));
    assert.deepEqual(labels(result), ["Float 0.0020", "Blue gem #661"]);
  });
});

describe("highlightRank", () => {
  it("orders tiered items by tier, then other highlights, then the rest", () => {
    const t1 = highlightRank(item({ wear: 0.5, paintSeed: 661 }));
    const t3 = highlightRank(item({ wear: 0.5, paintSeed: 11 }));
    const floatOnly = highlightRank(item({ paintSeed: null }));
    const none = highlightRank(item({ wear: 0.5, paintSeed: null }));
    assert.ok(t1 < t3 && t3 < floatOnly && floatOnly < none);
    assert.equal(t1, 1);
    assert.equal(t3, 3);
  });
});

describe("highlightSortValue", () => {
  it("sorts a better tier above any price and breaks ties by price", () => {
    const cheapT1 = highlightSortValue(item({ wear: 0.5, paintSeed: 661, price: 10 }));
    const richT1 = highlightSortValue(item({ wear: 0.5, paintSeed: 661, price: 900 }));
    const richT3 = highlightSortValue(item({ wear: 0.5, paintSeed: 11, price: 50_000 }));
    assert.ok(richT1 > cheapT1);
    assert.ok(cheapT1 > richT3);
  });
});
