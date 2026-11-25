import type { WEAR_BANDS } from "./float-bar.config.ts";

export type WearBand = (typeof WEAR_BANDS)[number];
export type WearBandId = WearBand["id"];

/** A span on the float scale, as percentages of the bar's width. */
export type BarSpan = {
  readonly start: number;
  readonly end: number;
};
