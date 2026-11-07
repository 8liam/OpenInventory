/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { PATTERN_TIERS } from "./pattern-tiers.config.ts";
import { parseSkinName, resolvePatternTier } from "./pattern-tiers.ts";
import type { PatternTierMatch } from "./pattern-tiers.types.ts";

const KNOWN = {
  akBlueGem: 661,
  seedOnBothWeapons: 690,
  fadeFullOnBayonet: 763,
  fadeFullOnKarambit: 412,
  gemPaintKits: { ruby: 415, sapphire: 416, blackPearl: 417, emerald: 568 },
} as const;

function tierOf(
  name: string,
  paintSeed: number | null,
  paintIndex: number | null = null,
): PatternTierMatch | null {
  return resolvePatternTier({ name, paintSeed, paintIndex });
}

function summary(match: PatternTierMatch | null) {
  return match && { tier: match.tier, of: match.tierCount, label: match.label };
}

describe("parseSkinName", () => {
  it("splits the weapon from the finish and drops prefixes", () => {
    assert.deepEqual(parseSkinName("★ StatTrak™ Karambit | Fade"), {
      weapon: "Karambit",
      finish: "Fade",
    });
    assert.deepEqual(parseSkinName("Souvenir AWP | Dragon Lore"), {
      weapon: "AWP",
      finish: "Dragon Lore",
    });
    assert.equal(parseSkinName("Sticker | Crown (Foil)")?.weapon, "Sticker");
    assert.equal(parseSkinName("Operation Hydra Case"), null);
  });
});

describe("case hardened tiers differ per weapon", () => {
  it("ranks the AK-47 #661 blue gem as T1", () => {
    assert.deepEqual(summary(tierOf("AK-47 | Case Hardened", KNOWN.akBlueGem)), {
      tier: 1,
      of: 3,
      label: "Blue gem",
    });
  });

  it("puts seed 690 in T3 on the AK-47 but T1 on the Five-SeveN", () => {
    assert.equal(tierOf("AK-47 | Case Hardened", KNOWN.seedOnBothWeapons)?.tier, 3);
    assert.equal(tierOf("Five-SeveN | Case Hardened", KNOWN.seedOnBothWeapons)?.tier, 1);
  });

  it("ranks #661 by each weapon's own list, not the AK-47's", () => {
    assert.equal(tierOf("Five-SeveN | Case Hardened", KNOWN.akBlueGem)?.tier, 2);
    assert.equal(tierOf("★ Karambit | Case Hardened", KNOWN.akBlueGem)?.tier, 2);
    assert.equal(tierOf("★ M9 Bayonet | Case Hardened", KNOWN.akBlueGem), null);
  });

  it("keeps Bayonet and M9 Bayonet apart", () => {
    assert.equal(tierOf("★ Bayonet | Case Hardened", 151)?.tier, 1);
    assert.equal(tierOf("★ M9 Bayonet | Case Hardened", 151), null);
    assert.equal(tierOf("★ M9 Bayonet | Case Hardened", 417)?.tier, 1);
    assert.equal(tierOf("★ Bayonet | Case Hardened", 417), null);
  });

  it("stops at the last notable tier: the source's T4 seeds get no tier", () => {
    assert.equal(tierOf("AK-47 | Case Hardened", 770), null);
    assert.equal(tierOf("AK-47 | Case Hardened", 11)?.tier, 3);
  });
});

describe("fade tiers", () => {
  it("treats the same seed differently on each weapon", () => {
    assert.deepEqual(summary(tierOf("★ Bayonet | Fade", KNOWN.fadeFullOnBayonet)), {
      tier: 1,
      of: 3,
      label: "100% Fade",
    });
    assert.equal(tierOf("★ Karambit | Fade", KNOWN.fadeFullOnBayonet), null);
    assert.equal(tierOf("★ Karambit | Fade", KNOWN.fadeFullOnKarambit)?.tier, 1);
    assert.equal(tierOf("★ Bayonet | Fade", KNOWN.fadeFullOnKarambit), null);
  });

  it("applies the 99.5% and 99% cutoffs at their boundaries (AWP)", () => {
    // 99.5199% is T2 and 99.4848% falls to T3; 99.0043% is T3 and 98.9860% has no tier.
    assert.equal(tierOf("AWP | Fade", 918)?.tier, 2);
    assert.equal(tierOf("AWP | Fade", 129)?.tier, 3);
    assert.equal(tierOf("AWP | Fade", 982)?.tier, 3);
    assert.equal(tierOf("AWP | Fade", 452), null);
  });

  it("is not confused with Marble Fade or Amber Fade", () => {
    assert.equal(tierOf("★ Karambit | Marble Fade", 763), null);
    assert.equal(tierOf("Galil AR | Fade", 0), null);
  });
});

describe("marble fade", () => {
  it("tiers Fire & Ice and keeps it apart from Fade", () => {
    assert.deepEqual(summary(tierOf("★ Karambit | Marble Fade", 412)), {
      tier: 1,
      of: 8,
      label: "Fire & Ice",
    });
    assert.equal(tierOf("★ Karambit | Marble Fade", 16)?.tier, 2);
    assert.equal(tierOf("★ Karambit | Fade", 412)?.label, "100% Fade");
  });

  it("has no tiers for knives without a published list", () => {
    assert.equal(tierOf("★ M9 Bayonet | Marble Fade", 412), null);
  });
});

describe("crimson web keeps the source tier per web type", () => {
  it("differs by knife and carries the type in the group", () => {
    const m9 = tierOf("★ M9 Bayonet | Crimson Web", 16);
    assert.equal(m9?.tier, 1);
    assert.equal(m9?.group, "Double Web");
    assert.equal(tierOf("★ Karambit | Crimson Web", 16), null);
    assert.equal(tierOf("★ Karambit | Crimson Web", 76)?.group, "Double Web");
  });

  it("leaves knives the source does not cover untiered", () => {
    assert.equal(tierOf("★ Talon Knife | Crimson Web", 16), null);
  });
});

describe("doppler phases by paint kit", () => {
  it("tiers gems T1 and Phase 2 T2 on a Karambit", () => {
    const { ruby, sapphire, blackPearl } = KNOWN.gemPaintKits;
    for (const [paintIndex, label] of [
      [ruby, "Ruby"],
      [sapphire, "Sapphire"],
      [blackPearl, "Black Pearl"],
    ] as const) {
      assert.deepEqual(summary(tierOf("★ Karambit | Doppler", 12, paintIndex)), {
        tier: 1,
        of: 2,
        label,
      });
    }
    assert.equal(tierOf("★ Karambit | Doppler", 12, 419)?.tier, 2);
  });

  it("gives common phases no tier", () => {
    for (const paintIndex of [418, 420, 421]) {
      assert.equal(tierOf("★ Karambit | Doppler", 12, paintIndex), null);
    }
  });

  it("uses the Butterfly Knife's own gem kits, and tiers its Phase 4", () => {
    assert.equal(tierOf("★ Butterfly Knife | Doppler", 12, 619)?.label, "Sapphire");
    assert.equal(tierOf("★ Butterfly Knife | Doppler", 12, 617)?.label, "Black Pearl");
    assert.equal(tierOf("★ Butterfly Knife | Doppler", 12, 618)?.tier, 2);
    assert.deepEqual(summary(tierOf("★ Butterfly Knife | Doppler", 12, 421)), {
      tier: 3,
      of: 3,
      label: "Phase 4",
    });
    assert.equal(tierOf("★ Karambit | Doppler", 12, 421), null);
    assert.equal(tierOf("★ Butterfly Knife | Doppler", 12, 416), null);
  });

  it("tiers Emerald on Gamma Doppler, including the Glock-18's own kit", () => {
    assert.equal(tierOf("★ Karambit | Gamma Doppler", 12, KNOWN.gemPaintKits.emerald)?.tier, 1);
    assert.equal(tierOf("Glock-18 | Gamma Doppler", 12, 1119)?.label, "Emerald");
    assert.equal(tierOf("★ Karambit | Doppler", 12, KNOWN.gemPaintKits.emerald), null);
    assert.equal(tierOf("★ Karambit | Gamma Doppler", 12, KNOWN.gemPaintKits.sapphire), null);
  });

  it("gates seed guides by paint kit so other phases are not flagged", () => {
    const pinkGalaxy = tierOf("★ Karambit | Doppler", 239, 419);
    assert.deepEqual(summary(pinkGalaxy), { tier: 1, of: 3, label: "Pink galaxy" });
    assert.equal(tierOf("★ Karambit | Doppler", 239, 418), null);
    assert.equal(tierOf("★ Karambit | Doppler", 239, null), null);
    assert.equal(tierOf("★ Karambit | Gamma Doppler", 168, 571)?.group, "Cyanbit Delta");
    assert.equal(tierOf("★ Karambit | Gamma Doppler", 168, 569), null);
  });
});

describe("unknown input", () => {
  it("returns no tier for unlisted seeds, missing seeds and unknown skins", () => {
    assert.equal(tierOf("AK-47 | Case Hardened", 1000), null);
    assert.equal(tierOf("AK-47 | Case Hardened", null), null);
    assert.equal(tierOf("AK-47 | Redline", 661), null);
    assert.equal(tierOf("Unknown Weapon | Case Hardened", 661), null);
    assert.equal(tierOf("Sticker | Crown (Foil)", 661), null);
  });
});

describe("tier data integrity", () => {
  it("lists every seed once per weapon and finish within its group, in range", () => {
    for (const table of PATTERN_TIERS.tables) {
      const where = `${table.weapon} | ${table.finish}`;
      assert.ok(table.groups.length > 0, where);
      for (const group of table.groups) {
        const seen = new Set<number>();
        group.tiers.forEach((tier) => {
          for (const seed of tier.seeds) {
            assert.ok(Number.isInteger(seed) && seed >= 0 && seed <= 1000, `${where}: ${seed}`);
            assert.ok(!seen.has(seed), `${where}: ${group.label} repeats ${seed}`);
            seen.add(seed);
          }
        });
        assert.ok(seen.size > 0, `${where}: ${group.label} is empty`);
      }
    }
  });

  it("numbers phase tiers within their table's tier count", () => {
    for (const table of PATTERN_TIERS.phaseTables) {
      assert.equal(table.tierCount, Math.max(...table.phases.map(({ tier }) => tier)));
    }
  });
});
