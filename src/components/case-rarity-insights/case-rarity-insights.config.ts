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
    empty: "text-sm text-muted-foreground",
    unclassified: "mt-4 text-xs text-muted-foreground",
  },
  copy: {
    upperBoundSummary: "Why “Up to” and “Unknown rarity”?",
    upperBoundBody: [
      "Steam did not record the rarity of some openings in your history. If one of those came after your last confirmed pull of a tier, it might have been that tier.",
      "So we cannot say exactly how long ago you last pulled it. “Up to 42” means it was at most 42 cases ago, and may be fewer.",
    ],
  },
} as const;
