/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { contrastRatio } from "../../utils/contrast.ts";
import { PALETTE_LIST, PALETTES } from "./palettes.config.ts";
import {
  ACCENT_COLORS,
  ACCENT_IDS,
  MIN_CONTRAST,
  PALETTE_IDS,
  RESOLVED_SCHEMES,
  THEME_TOKENS,
} from "./theme.config.ts";
import { accentOverrides, getPalette, pickVariant, resolveColorScheme } from "./theme.ts";

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

test("the default accent overrides nothing", () => {
  assert.equal(accentOverrides("default"), null);
});

test("every accent brings a foreground that stays readable on it", () => {
  for (const accent of ACCENT_IDS) {
    const overrides = accentOverrides(accent);
    if (accent === "default") continue;
    assert.ok(overrides, accent);
    assert.equal(overrides.primary, ACCENT_COLORS[accent]);
    assert.ok(
      contrastRatio(overrides.primary, overrides["primary-foreground"]) >= MIN_CONTRAST.onPrimary,
      accent,
    );
  }
});
