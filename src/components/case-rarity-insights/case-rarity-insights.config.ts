import type { CaseRarityStat } from "~/lib/cases/cases.types";

export const CASE_RARITY_INSIGHTS = {
  /** Tiers in the order they are listed, rarest last. */
  displayOrder: [
    "milSpec",
    "restricted",
    "classified",
    "covert",
    "gold",
  ] as const satisfies readonly CaseRarityStat["key"][],
  /** Classified pulls below this count are a small sample, so rates can swing far from the odds. */
  smallSampleThreshold: 500,
  /** Decimals for both your rate and the published odds, so the two compare like for like. */
  percentDecimals: 3,
  /** Full width of a track, in percent, and the width of the odds marker, in pixels. */
  fullTrackPercent: 100,
  markerWidthPx: 2,
  classes: {
    grid: "grid grid-cols-1 gap-4 xl:grid-cols-5",
    streaksPanel: "xl:col-span-2 xl:self-start",
    streakList: "grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-5 xl:grid-cols-1 xl:gap-y-0",
    streak:
      "min-w-0 xl:grid xl:grid-cols-[minmax(0,1fr)_auto] xl:items-baseline xl:gap-x-3 xl:border-b xl:py-3 xl:last:border-0",
    streakTerm: "flex items-center gap-2 text-xs text-muted-foreground",
    streakDot: "h-2.5 w-2.5 shrink-0 rounded-full",
    streakValue:
      "tabular mt-1 text-xl font-semibold leading-tight xl:col-start-2 xl:row-start-1 xl:mt-0",
    streakNote: "text-xs text-muted-foreground xl:col-start-1 xl:row-start-2",
    explainer: "mt-4 border-t pt-3 text-xs leading-relaxed text-muted-foreground",
    explainerSummary:
      "cursor-pointer rounded-sm font-medium text-foreground outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring",
    explainerBody: "mt-2 space-y-2",
    oddsPanel: "xl:col-span-3",
    note: "mb-4 text-xs leading-relaxed text-muted-foreground",
    link: "font-medium text-foreground underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    empty: "text-sm text-muted-foreground",
    rows: "space-y-5",
    rowHead: "mb-1.5 flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5 text-xs",
    rowLabel: "font-medium",
    rowCount: "tabular text-muted-foreground",
    track: "relative h-2.5 rounded-full bg-muted-foreground/25",
    fillClip: "absolute inset-0 overflow-hidden rounded-full",
    fill: "h-full rounded-full",
    marker: "absolute -top-1 -bottom-1 rounded-full bg-foreground",
    values: "mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs",
    value: "inline-flex items-center gap-1.5",
    valueName: "text-muted-foreground",
    valueNumber: "tabular font-medium",
    legendFill: "h-2 w-2 shrink-0 rounded-full",
    legendMarker: "h-3 w-0.5 shrink-0 rounded-full bg-foreground",
    unclassified: "mt-4 text-xs text-muted-foreground",
  },
  copy: {
    /** One accessible name per tier, so a screen reader hears the pair together. */
    group: (tier: string, yourRate: string, odds: string, pulls: string, total: string) =>
      `${tier}: your rate ${yourRate}, published odds ${odds} (${pulls} of ${total} pulls)`,
    percent: (value: string) => `${value}%`,
    scaleNote:
      "Each tier has its own scale, so compare a bar with its marker, not one tier with another.",
    emptyBarNote:
      "A tier you have not pulled yet shows an empty bar, with its odds marker at the end.",
    upperBoundSummary: "Why “Up to” and “Unknown rarity”?",
    upperBoundBody: [
      "Steam did not record the rarity of some openings in your history. If one of those came after your last confirmed pull of a tier, it might have been that tier.",
      "So we cannot say exactly how long ago you last pulled it. “Up to 42” means it was at most 42 cases ago, and may be fewer.",
    ],
  },
} as const;
