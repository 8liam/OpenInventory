/**
 * Data-visualisation colours. UI chrome stays monotone plus lime; charts get their own palette.
 * Values are mirrored as CSS tokens (--chart-n, --wear-n) in src/index.css, and
 * chart-palette.test.ts checks the two match and that every colour holds the rules below.
 */
export const CHART_PALETTE = {
  /**
   * Eight categorical hues for Type and Location. Lightness alternates between neighbours so
   * adjacent slices separate under deuteranopia and protanopia too; none is the accent lime.
   */
  categorical: {
    dark: ["#87bafd", "#c97409", "#2bd2c2", "#d8559b", "#b385fb", "#f3c935", "#0f99c9", "#fd968f"],
    light: ["#0051a0", "#794402", "#179a8e", "#a82571", "#9769dc", "#a18308", "#077fa8", "#bc4945"],
  },
  /** One blue family from Factory New (strongest) to Battle-Scarred (closest to the card). */
  wear: {
    dark: ["#b5e2fd", "#74ccfe", "#33b4f2", "#109bd5", "#0481b3"],
    light: ["#033d57", "#0a5475", "#046b96", "#0481b3", "#3c96c5"],
  },
  /** The default palette's card surfaces, which every chart colour is measured against. */
  cards: { dark: "#111111", light: "#ffffff" },
  /** Reserved for selected, primary and live; no chart colour may sit close to it. */
  accent: "#a0ff69",
  limits: {
    /** WCAG 1.4.11 non-text contrast for a slice, bar or legend dot against the card. */
    contrast: 3,
    /** Oklab ΔE between neighbouring categories, with full colour vision. */
    adjacentDeltaE: 0.15,
    /** The same, as seen with deuteranopia or protanopia. */
    adjacentDeficiencyDeltaE: 0.1,
    /** Oklab ΔE between neighbouring steps of the wear ramp. */
    wearStepDeltaE: 0.06,
    /** Oklab ΔE every chart colour keeps from the accent lime. */
    accentDeltaE: 0.15,
  },
  /** Light-mode darkening of item-data colours (rarity hues) that miss the contrast floor on white. */
  shade: { step: 0.97, minFactor: 0.4 },
  cssVar: {
    categorical: (index: number) => `var(--chart-${index + 1})`,
    wear: (index: number) => `var(--wear-${index + 1})`,
  },
  /** For a slice with no category, such as "Other". Tested at 3.5:1 or more in every palette. */
  neutral: "var(--muted-foreground)",
} as const;
