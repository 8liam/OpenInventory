import { OKLAB, SRGB } from "./contrast.config.ts";
import { fromLinear, parseColor, toLinear } from "./contrast.ts";
import type { Rgb } from "./contrast.types.ts";
import {
  CVD_MATRICES,
  HEX_CHANNEL_DIGITS,
  HEX_RADIX,
  OKLAB_FORWARD,
} from "./color-distance.config.ts";
import type { Deficiency, Oklab } from "./color-distance.types.ts";

type Matrix = readonly (readonly number[])[];

function apply(matrix: Matrix, vector: readonly number[]): [number, number, number] {
  const [x = 0, y = 0, z = 0] = matrix.map(
    (row) =>
      (row[0] ?? 0) * (vector[0] ?? 0) +
      (row[1] ?? 0) * (vector[1] ?? 0) +
      (row[2] ?? 0) * (vector[2] ?? 0),
  );
  return [x, y, z];
}

function mapRgb(rgb: Rgb, fn: (channel: number) => number): Rgb {
  return [fn(rgb[0]), fn(rgb[1]), fn(rgb[2])];
}

function oklabFromRgb(rgb: Rgb): Oklab {
  const lms = mapRgb(apply(OKLAB_FORWARD.lmsFromRgb, mapRgb(rgb, toLinear)), Math.cbrt);
  return apply(OKLAB_FORWARD.labFromLms, lms);
}

/** Oklab coordinates of a `#hex` or `oklch()` colour. */
export function toOklab(color: string): Oklab {
  return oklabFromRgb(parseColor(color));
}

/** Euclidean distance in Oklab (ΔE ok). About 0.02 is a just-noticeable difference. */
export function deltaE(first: string, second: string): number {
  const [l1, a1, b1] = toOklab(first);
  const [l2, a2, b2] = toOklab(second);
  return Math.hypot(l1 - l2, a1 - a2, b1 - b2);
}

/** How `color` looks to someone with the given colour-vision deficiency, as `#rrggbb`. */
export function simulateDeficiency(color: string, deficiency: Deficiency): string {
  const linear = apply(CVD_MATRICES[deficiency], mapRgb(parseColor(color), toLinear));
  return toHex(mapRgb(linear, fromLinear));
}

/** `#rrggbb` for sRGB channels in 0..1. */
export function toHex(rgb: Rgb): string {
  return `#${rgb
    .map((channel) =>
      Math.round(Math.min(1, Math.max(0, channel)) * SRGB.channelMax)
        .toString(HEX_RADIX)
        .padStart(HEX_CHANNEL_DIGITS, "0"),
    )
    .join("")}`;
}

/** Scales a colour toward black in Oklab by `factor` (1 keeps it), so hue stays put while it darkens. */
export function darkenOklab(color: string, factor: number): string {
  const [lightness, a, b] = mapRgb(toOklab(color), (channel) => channel * factor);
  const lms = OKLAB.lmsFromLab.map(
    ([aWeight, bWeight]) => (lightness + aWeight * a + bWeight * b) ** OKLAB.cubeExponent,
  );
  return toHex(mapRgb(apply(OKLAB.rgbFromLms, lms), fromLinear));
}
