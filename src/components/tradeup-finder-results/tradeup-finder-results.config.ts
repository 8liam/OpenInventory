import { SearchX } from "lucide-react";

export const TRADEUP_FINDER_RESULTS = {
  rank: (index: number) => `#${index + 1}`,
  expectedValue: "EV",
  cost: "Cost",
  profit: "Profit",
  float: "Float",
  inputs: "Inputs",
  inputSeparator: ", ",
  /** Each outcome column needs room for a full name beside its chance and price. */
  outcomeColumns: "repeat(auto-fit, minmax(min(100%, 28rem), 1fr))",
  listLabel: "Best EV contracts",
  /** Capped so up to 20 contracts never push the calculator far down the page; scrolls on its own. */
  listClass: "max-h-[40vh] shrink-0 overflow-y-auto",
  classes: {
    loading: "flex shrink-0 flex-col gap-3",
    skeletonCard: "rounded-lg border p-3",
    skeletonTitle: "mb-2 h-4 w-72 max-w-full",
    skeletonSubtitle: "mb-2 h-3 w-96 max-w-full",
    skeletonOutcomes: "grid gap-1 sm:grid-cols-2 lg:grid-cols-3",
    skeletonOutcome: "h-6",
    list: "flex min-w-0 flex-col gap-3",
    card: "min-w-0 rounded-lg border bg-card p-3",
    summary: "mb-2 flex flex-wrap items-center gap-x-4 gap-y-1",
    rank: "font-semibold tabular",
    figures: "flex flex-wrap items-center gap-x-4 gap-y-1",
    figure: "flex gap-1",
    figureLabel: "text-muted-foreground",
    figureValue: "tabular",
    gain: "text-success",
    loss: "text-destructive",
    inputs: "mb-2 text-xs text-muted-foreground",
    inputsLabel: "font-medium text-foreground",
    outcomes: "grid min-w-0 gap-1 text-xs",
    outcome: "flex min-w-0 justify-between gap-2 rounded bg-muted px-2 py-1",
    outcomeName: "min-w-0 flex-1 break-words",
    outcomeChance: "shrink-0 tabular text-muted-foreground",
    outcomePrice: "shrink-0 tabular",
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
