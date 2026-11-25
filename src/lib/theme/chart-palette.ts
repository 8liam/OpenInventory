import { contrastRatio } from "../../utils/contrast.ts";
import { darkenOklab } from "../../utils/color-distance.ts";
import { CHART_PALETTE } from "./chart-palette.config.ts";

const { categorical, wear, cssVar, cards, limits, shade } = CHART_PALETTE;

/** The categorical token for the slice at `index`, cycling past the last colour. */
export function categoricalColor(index: number): string {
  return cssVar.categorical(index % categorical.dark.length);
}

/** The wear-ramp token for step `index` (0 is Factory New), clamped to the ramp. */
export function wearColor(index: number): string {
  return cssVar.wear(Math.min(Math.max(index, 0), wear.dark.length - 1));
}

/**
 * An item-data colour (a CS2 rarity hue) made safe on both cards. Dark mode keeps it exactly; in
 * light mode, a hue that misses the contrast floor on white is darkened in Oklab until it clears,
 * so the hue stays recognisable. Colours that already pass come back unchanged.
 */
export function dataColor(hex: string): string {
  if (contrastRatio(hex, cards.light) >= limits.contrast) return hex;
  let factor = 1;
  let shaded = hex;
  while (contrastRatio(shaded, cards.light) < limits.contrast && factor > shade.minFactor) {
    factor *= shade.step;
    shaded = darkenOklab(hex, factor);
  }
  return `light-dark(${shaded}, ${hex})`;
}
