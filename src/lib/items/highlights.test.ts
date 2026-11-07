/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ItemView } from "./item.types.ts";
import { scoreItemHighlights } from "./highlights.ts";

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
    ...overrides,
  };
}

const labels = (highlights: ReturnType<typeof scoreItemHighlights>) =>
  highlights.reasons.map(({ label }) => label);

describe("scoreItemHighlights", () => {
  it("scores an extreme float relative to the skin's wear range and shows the float", () => {
    const result = scoreItemHighlights(item({ paintSeed: null }));
    assert.equal(result.score, 30);
    assert.deepEqual(labels(result), ["Float 0.0020"]);
    assert.equal(result.reasons[0]?.kind, "float");
    assert.equal(result.tier, null);
  });

  it("flags configured blue gem patterns and marks them exceptional", () => {
    const result = scoreItemHighlights(item({ wear: 0.5, paintSeed: 661 }));
    assert.equal(result.score, 45);
    assert.deepEqual(labels(result), ["Blue gem #661"]);
    assert.equal(result.tier, "exceptional");
  });

  it("labels 100% fade seeds", () => {
    const result = scoreItemHighlights(
      item({ wear: 0.5, name: "Butterfly Knife | Fade", paintSeed: 763 }),
    );
    assert.deepEqual(labels(result), ["100% Fade #763"]);
  });

  it("shows sticker crafts with a USD premium estimate", () => {
    const result = scoreItemHighlights(
      item({
        wear: 0.5,
        paintSeed: null,
        stickers: [{ name: "Crown (Foil)", imageUrl: null }],
      }),
    );
    assert.equal(result.estimatedPremiumUsd, 8);
    assert.deepEqual(labels(result), ["Sticker craft"]);
    assert.equal(result.tier, null);
  });

  it("does not infer highlights when float bounds or references are unavailable", () => {
    const result = scoreItemHighlights(item({ minWear: null, maxWear: null, paintSeed: null }));
    assert.equal(result.score, 0);
    assert.equal(result.estimatedPremiumUsd, null);
    assert.deepEqual(result.reasons, []);
    assert.equal(result.tier, null);
  });

  describe("doppler gem phases", () => {
    const doppler = (name: string, paintIndex: number) =>
      item({ wear: 0.5, paintSeed: 12, name, paintIndex });

    it("scores Sapphire, Ruby and Black Pearl by paint kit", () => {
      const cases = [
        [416, "Sapphire"],
        [415, "Ruby"],
        [417, "Black Pearl"],
      ] as const;
      for (const [paintIndex, label] of cases) {
        const result = scoreItemHighlights(doppler("★ Karambit | Doppler", paintIndex));
        assert.equal(result.score, 45);
        assert.deepEqual(labels(result), [label]);
        assert.equal(result.reasons[0]?.kind, "pattern");
        assert.equal(result.tier, "exceptional");
      }
    });

    it("scores Emerald on Gamma Doppler", () => {
      const result = scoreItemHighlights(doppler("★ Karambit | Gamma Doppler", 568));
      assert.deepEqual(labels(result), ["Emerald"]);
    });

    it("scores a gem phase named in the item name", () => {
      const result = scoreItemHighlights(
        item({ wear: 0.5, paintSeed: null, name: "★ M9 Bayonet | Doppler Sapphire" }),
      );
      assert.deepEqual(labels(result), ["Sapphire"]);
    });

    it("ignores common Doppler phases and other finishes with a gem paint kit id", () => {
      assert.equal(scoreItemHighlights(doppler("★ Karambit | Doppler", 419)).score, 0);
      assert.equal(scoreItemHighlights(doppler("★ Karambit | Doppler Phase 2", 420)).score, 0);
      assert.equal(scoreItemHighlights(doppler("AK-47 | Redline", 416)).score, 0);
    });
  });
});
