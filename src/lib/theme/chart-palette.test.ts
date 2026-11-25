/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { contrastRatio } from "../../utils/contrast.ts";
import { deltaE, simulateDeficiency, toOklab } from "../../utils/color-distance.ts";
import { CHART_PALETTE } from "./chart-palette.config.ts";
import { categoricalColor, dataColor, wearColor } from "./chart-palette.ts";

const { categorical, wear, cards, accent, limits } = CHART_PALETTE;
const THEMES = ["dark", "light"] as const;
const DEFICIENCIES = ["deuteranopia", "protanopia"] as const;
/** CS2's own rarity hues (Consumer to Contraband), as the inventory data carries them. */
const RARITY_HUES = ["#b0c3d9", "#5e98d9", "#4b69ff", "#8847ff", "#d32ce6", "#eb4b4b", "#e4ae39"];
const LIGHT_DARK = /^light-dark\((#[0-9a-f]{6}), (#[0-9a-f]{6})\)$/;

/** Neighbours in a donut, including the last slice back round to the first. */
function ringPairs<T>(list: readonly T[]): [T, T][] {
  return list.map((item, index) => [item, list[(index + 1) % list.length] as T]);
}

for (const theme of THEMES) {
  const card = cards[theme];

  test(`${theme} chart colours clear ${limits.contrast}:1 on the card`, () => {
    for (const color of [...categorical[theme], ...wear[theme]]) {
      const ratio = contrastRatio(color, card);
      assert.ok(ratio >= limits.contrast, `${color} on ${card}: ${ratio.toFixed(2)}`);
    }
  });

  test(`${theme} neighbouring categories stay apart, with and without colour vision`, () => {
    for (const [a, b] of ringPairs(categorical[theme])) {
      const distance = deltaE(a, b);
      assert.ok(distance >= limits.adjacentDeltaE, `${a} vs ${b}: ΔE ${distance.toFixed(3)}`);
      for (const deficiency of DEFICIENCIES) {
        const seen = deltaE(simulateDeficiency(a, deficiency), simulateDeficiency(b, deficiency));
        assert.ok(
          seen >= limits.adjacentDeficiencyDeltaE,
          `${a} vs ${b} (${deficiency}): ΔE ${seen.toFixed(3)}`,
        );
      }
    }
  });

  test(`${theme} wear ramp steps apart and fades toward the card`, () => {
    const ramp = wear[theme];
    for (let step = 1; step < ramp.length; step += 1) {
      const [previous, current] = [ramp[step - 1] ?? "", ramp[step] ?? ""];
      const distance = deltaE(previous, current);
      assert.ok(distance >= limits.wearStepDeltaE, `${previous} vs ${current}: ${distance}`);
      assert.ok(
        contrastRatio(current, card) < contrastRatio(previous, card),
        `${current} should sit closer to the card than ${previous}`,
      );
    }
  });

  test(`${theme} no chart colour passes for the accent lime`, () => {
    for (const color of [...categorical[theme], ...wear[theme]]) {
      const distance = deltaE(color, accent);
      assert.ok(distance >= limits.accentDeltaE, `${color}: ΔE ${distance.toFixed(3)}`);
    }
  });

  test(`${theme} CSS tokens match the config`, () => {
    const css = readFileSync(new URL("../../index.css", import.meta.url), "utf8");
    const selector = theme === "dark" ? '[data-theme="dark"] {' : ':root,\n[data-theme="light"] {';
    const blocks = css
      .split(selector)
      .slice(1)
      .map((body) => body.slice(0, body.indexOf("}")));
    const block = blocks.find((body) => body.includes("--chart-1:")) ?? "";
    const expected = [
      ...categorical[theme].map((value, index) => [`--chart-${index + 1}`, value]),
      ...wear[theme].map((value, index) => [`--wear-${index + 1}`, value]),
    ];
    for (const [token, value] of expected) {
      assert.ok(block.includes(`${token}: ${value};`), `${theme} ${token} should be ${value}`);
    }
  });
}

test("categorical and wear helpers hand out tokens, cycling and clamping", () => {
  assert.equal(categoricalColor(0), "var(--chart-1)");
  assert.equal(categoricalColor(categorical.dark.length), "var(--chart-1)");
  assert.equal(wearColor(0), "var(--wear-1)");
  assert.equal(wearColor(99), `var(--wear-${wear.dark.length})`);
});

test("rarity hues keep their exact colour on dark and clear the floor on light", () => {
  for (const hue of RARITY_HUES) {
    const color = dataColor(hue);
    const match = LIGHT_DARK.exec(color);
    const [lightValue, darkValue] = match ? [match[1] ?? "", match[2] ?? ""] : [hue, hue];
    assert.equal(darkValue, hue);
    assert.ok(contrastRatio(darkValue, cards.dark) >= limits.contrast, `${hue} on dark`);
    assert.ok(
      contrastRatio(lightValue, cards.light) >= limits.contrast,
      `${hue} light ${lightValue}`,
    );
    // Darkening keeps the hue: the Oklab a/b direction barely turns.
    const [, a1, b1] = toOklab(hue);
    const [, a2, b2] = toOklab(lightValue);
    const turn = Math.abs(Math.atan2(b1, a1) - Math.atan2(b2, a2));
    assert.ok(turn < 0.35, `${hue} hue turned ${turn.toFixed(2)} rad`);
  }
});
