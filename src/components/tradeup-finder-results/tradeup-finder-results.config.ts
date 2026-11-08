export const TRADEUP_FINDER_RESULTS = {
  rank: (index: number) => `#${index + 1}`,
  expectedValue: "EV",
  cost: "Cost",
  profit: "Profit",
  float: "Float",
  inputs: "Inputs",
  inputSeparator: ", ",
  outcomeSeparator: " · ",
  listLabel: "Best EV contracts",
  /** Scrolls on its own so the calculator below stays on screen. */
  listClass: "max-h-[40vh] shrink-0 overflow-y-auto",
  empty: "No complete contracts found for these filters.",
  /** Placeholder cards while the search runs; real results vary up to the server's limit. */
  skeletonCards: 3,
  skeletonOutcomes: 3,
} as const;
