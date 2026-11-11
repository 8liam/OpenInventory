export const TRADEUP_PAGE = {
  classes: {
    scrollRegion: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2 [&>*]:shrink-0",
    calculator: "flex flex-col gap-4",
    muted: "text-muted-foreground",
    note: "text-xs text-muted-foreground",
  },
} as const;

export const TRADEUP_DESIGN = {
  views: ["tradeup", "finder"],
  tradeup: "Trade-up",
  finder: "EV finder",
  best: "Best case",
  worst: "Worst case",
  open: "Open in Trade-up",
  contract: "Contract",
  roi: "ROI",
  odds: "Odds",
  price: "Price",
  profit: "Profit / loss",
  inputs: "Inputs",
  outcomes: "Outcomes",
  noMatches: "No items match",
  separator: " · ",
} as const;
