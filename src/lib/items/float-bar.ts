import { FLOAT_SCALE, WEAR_BANDS } from "./float-bar.config.ts";
import type { BarSpan, WearBand } from "./float-bar.types.ts";

const PERCENT = 100;

/** True for a real, finite float: the only kind the app can place on the bar or print. */
export function isOnScale(value: number | null | undefined): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function clampToScale(value: number): number {
  return Math.min(FLOAT_SCALE.max, Math.max(FLOAT_SCALE.min, value));
}

/** Where a float sits on the 0..1 bar, as a percentage; out-of-scale values stick to the ends. */
export function floatPosition(value: number): number {
  return ((clampToScale(value) - FLOAT_SCALE.min) * PERCENT) / (FLOAT_SCALE.max - FLOAT_SCALE.min);
}

/** The wear band a float falls in, or null when it is not a number. */
export function wearBandFor(value: number | null | undefined): WearBand | null {
  if (!isOnScale(value)) return null;
  const clamped = clampToScale(value);
  return WEAR_BANDS.find((band) => clamped < band.max) ?? WEAR_BANDS[WEAR_BANDS.length - 1] ?? null;
}

/** A band's width as a percentage of the bar. */
export function bandWidth(band: WearBand): number {
  return floatPosition(band.max) - floatPosition(band.min);
}

/** The skin's own float range as a span on the bar, or null when it is unknown or empty. */
export function floatRangeSpan(
  minWear: number | null | undefined,
  maxWear: number | null | undefined,
): BarSpan | null {
  if (!isOnScale(minWear) || !isOnScale(maxWear)) return null;
  const start = floatPosition(minWear);
  const end = floatPosition(maxWear);
  return end > start ? { start, end } : null;
}
