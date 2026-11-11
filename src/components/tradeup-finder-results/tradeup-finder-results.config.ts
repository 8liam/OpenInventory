import { SearchX } from "lucide-react";

export const TRADEUP_FINDER_RESULTS = {
  columnCount: 4,
  rank: (index: number) => `#${index + 1}`,
  expectedValue: "EV",
  cost: "Cost",
  classes: {
    loading: "flex shrink-0 flex-col gap-3",
    skeletonCard: "rounded-lg border p-3",
    skeletonTitle: "mb-2 h-4 w-72 max-w-full",
    skeletonSubtitle: "mb-2 h-3 w-96 max-w-full",
    skeletonOutcomes: "grid gap-1 sm:grid-cols-2 lg:grid-cols-3",
    skeletonOutcome: "h-6",
  },
  empty: {
    icon: SearchX,
    title: "No contracts found",
    body: "No complete contract can be built from these skins. Try including storage unit items or another StatTrak filter.",
  },
  /** Placeholder cards while the search runs; real results vary up to the server's limit. */
  skeletonCards: 3,
  skeletonOutcomes: 3,
} as const;
