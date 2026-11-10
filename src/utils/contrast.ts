import {
  CONTRAST_ERRORS,
  HEX_PATTERN,
  OKLAB,
  OKLCH_PATTERN,
  READABLE_TEXT,
  SRGB,
} from "./contrast.config.ts";
import type { Rgb } from "./contrast.types.ts";

const HEX_SHORT_LENGTH = 3;
const HEX_RADIX = 16;
const PERCENT = 100;

function toLinear(channel: number): number {
  return channel <= SRGB.linearThreshold
    ? channel / SRGB.linearDivisor
    : ((channel + SRGB.gammaOffset) / SRGB.gammaDivisor) ** SRGB.gammaExponent;
}

function fromLinear(channel: number): number {
  const clamped = Math.min(1, Math.max(0, channel));
  return clamped <= SRGB.linearThreshold / SRGB.linearDivisor
    ? clamped * SRGB.linearDivisor
    : SRGB.gammaDivisor * clamped ** (1 / SRGB.gammaExponent) - SRGB.gammaOffset;
}

function parseHex(hex: string): Rgb {
  const digits = hex.slice(1);
  const full = digits.length === HEX_SHORT_LENGTH ? digits.replace(/./g, "$&$&") : digits;
  const [red = 0, green = 0, blue = 0] = [0, 2, 4].map(
    (start) => Number.parseInt(full.slice(start, start + 2), HEX_RADIX) / SRGB.channelMax,
  );
  return [red, green, blue];
}

function parseOklch(lightness: number, chroma: number, hue: number): Rgb {
  const radians = (hue * Math.PI) / OKLAB.degreesPerHalfTurn;
  const a = chroma * Math.cos(radians);
  const b = chroma * Math.sin(radians);
  const [l, m, s] = OKLAB.lmsFromLab.map(
    ([aWeight, bWeight]) => (lightness + aWeight * a + bWeight * b) ** OKLAB.cubeExponent,
  );
  const [red = 0, green = 0, blue = 0] = OKLAB.rgbFromLms.map(([lw, mw, sw]) =>
    fromLinear((l ?? 0) * lw + (m ?? 0) * mw + (s ?? 0) * sw),
  );
  return [red, green, blue];
}

/** Parses `#rgb`, `#rrggbb` or `oklch(L% C H)` to sRGB channels in 0..1. */
export function parseColor(color: string): Rgb {
  const value = color.trim();
  if (HEX_PATTERN.test(value)) return parseHex(value);
  const oklch = OKLCH_PATTERN.exec(value);
  if (oklch) {
    return parseOklch(Number(oklch[1]) / PERCENT, Number(oklch[2]), Number(oklch[3]));
  }
  throw new Error(`${CONTRAST_ERRORS.unsupported}: ${color}`);
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance(color: string): number {
  const [red, green, blue] = parseColor(color).map(toLinear);
  const [redWeight, greenWeight, blueWeight] = SRGB.luminanceWeights;
  return redWeight * (red ?? 0) + greenWeight * (green ?? 0) + blueWeight * (blue ?? 0);
}

/** WCAG 2.x contrast ratio between two opaque colours, 1..21. */
export function contrastRatio(first: string, second: string): number {
  const a = relativeLuminance(first);
  const b = relativeLuminance(second);
  return (Math.max(a, b) + SRGB.contrastOffset) / (Math.min(a, b) + SRGB.contrastOffset);
}

/** Black or white, whichever has the higher contrast on the given background. */
export function readableTextOn(background: string): string {
  return contrastRatio(background, READABLE_TEXT.dark) >=
    contrastRatio(background, READABLE_TEXT.light)
    ? READABLE_TEXT.dark
    : READABLE_TEXT.light;
}
