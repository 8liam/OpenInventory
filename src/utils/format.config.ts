export const FORMAT_LOCALE = "en-US";
export const PERCENT_FRACTION_DIGITS = 2;
export const FLOAT_FRACTION_DIGITS = 4;
/** A 32-bit float needs at most nine significant digits to round-trip. */
export const FLOAT_EXACT_MAX_SIGNIFICANT_DIGITS = 9;
/** Intl.NumberFormat rejects more fraction digits than this. */
export const FLOAT_EXACT_MAX_FRACTION_DIGITS = 20;
export const EMPTY_VALUE = "—";

export const RELATIVE_TIME = {
  /** Anything newer than this reads as "just now". */
  justNowMs: 60_000,
  /** How often relative timestamps re-render. */
  refreshMs: 30_000,
  justNow: "just now",
} as const;
