/** The standard CS wear bands. Bounds are lower-inclusive; the last band also includes its upper bound. */
export const WEAR_BANDS = [
  { id: "fn", label: "Factory New", short: "FN", min: 0, max: 0.07 },
  { id: "mw", label: "Minimal Wear", short: "MW", min: 0.07, max: 0.15 },
  { id: "ft", label: "Field-Tested", short: "FT", min: 0.15, max: 0.38 },
  { id: "ww", label: "Well-Worn", short: "WW", min: 0.38, max: 0.45 },
  { id: "bs", label: "Battle-Scarred", short: "BS", min: 0.45, max: 1 },
] as const;

export const FLOAT_SCALE = { min: 0, max: 1 } as const;
