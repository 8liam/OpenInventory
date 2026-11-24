/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { contrastRatio, parseColor } from "../../utils/contrast.ts";
import { TRADE_UP } from "../storage/storage.config.ts";
import { PALETTE_LIST, PALETTES } from "./palettes.config.ts";
import { MIN_CONTRAST, PALETTE_IDS, RESOLVED_SCHEMES, THEME_TOKENS } from "./theme.config.ts";
import { getPalette, pickVariant, resolveColorScheme } from "./theme.ts";

const appCss = readFileSync(new URL("../../index.css", import.meta.url), "utf8");
const thumbnailRarities = [...Object.values(TRADE_UP.rarityColors), "#e4ae39"];
const minimumDotContrast = 1.8;

function thumbnailTint(scheme: "light" | "dark", token: "base" | "dot"): number {
  const theme = appCss.match(new RegExp(`\\[data-theme="${scheme}"\\]\\s*\\{([^}]+)\\}`))?.[1];
  const percent = theme?.match(new RegExp(`--thumb-${token}-tint:\\s*(\\d+)%`))?.[1];
  assert.ok(percent, `${scheme} thumbnail ${token} tint is missing`);
  return Number(percent) / 100;
}

function mixSrgb(first: string, second: string, weight: number): string {
  const background = parseColor(second);
  const channels = parseColor(first).map((channel, index) => {
    const mixed = channel * weight + (background[index] ?? 0) * (1 - weight);
    return Math.round(mixed * 255)
      .toString(16)
      .padStart(2, "0");
  });
  return `#${channels.join("")}`;
}

test("every palette id has a registry entry with a matching id and a name", () => {
  assert.equal(PALETTE_LIST.length, PALETTE_IDS.length);
  for (const id of PALETTE_IDS) {
    assert.equal(PALETTES[id].id, id);
    assert.ok(PALETTES[id].name.length > 0);
  }
});

for (const palette of PALETTE_LIST) {
  for (const scheme of RESOLVED_SCHEMES) {
    const variant = pickVariant(palette, scheme);
    const label = `${palette.id} ${scheme}`;

    test(`${label} defines every token`, () => {
      for (const token of THEME_TOKENS) {
        assert.ok(variant[token]?.trim(), `${label} is missing ${token}`);
      }
      assert.deepEqual(Object.keys(variant).sort(), [...THEME_TOKENS].sort());
    });

    test(`${label} is readable`, () => {
      const text = contrastRatio(variant.foreground, variant.background);
      const muted = contrastRatio(variant["muted-foreground"], variant.background);
      const onPrimary = contrastRatio(variant["primary-foreground"], variant.primary);
      assert.ok(text >= MIN_CONTRAST.text, `${label} foreground ${text.toFixed(2)}`);
      assert.ok(muted >= MIN_CONTRAST.mutedText, `${label} muted-foreground ${muted.toFixed(2)}`);
      assert.ok(onPrimary >= MIN_CONTRAST.onPrimary, `${label} primary ${onPrimary.toFixed(2)}`);
    });

    test(`${label} rarity dots stand out against their tinted tile`, () => {
      const baseTint = thumbnailTint(scheme, "base");
      const dotTint = thumbnailTint(scheme, "dot");
      for (const rarity of thumbnailRarities) {
        const tile = mixSrgb(rarity, variant.card, baseTint);
        const dot = mixSrgb(rarity, "#000000", dotTint);
        const ratio = contrastRatio(dot, tile);
        assert.notEqual(tile, variant.card, `${label} tile must carry the ${rarity} tint`);
        assert.ok(
          ratio >= minimumDotContrast,
          `${label} ${rarity} dot on ${tile} ${ratio.toFixed(2)}`,
        );
      }
    });
  }
}

test("resolveColorScheme follows the system only for system", () => {
  assert.equal(resolveColorScheme("system", true), "dark");
  assert.equal(resolveColorScheme("system", false), "light");
  assert.equal(resolveColorScheme("light", true), "light");
  assert.equal(resolveColorScheme("dark", false), "dark");
});

test("pickVariant returns the matching variant", () => {
  const palette = getPalette("nord");
  assert.equal(pickVariant(palette, "light"), palette.light);
  assert.equal(pickVariant(palette, "dark"), palette.dark);
});
