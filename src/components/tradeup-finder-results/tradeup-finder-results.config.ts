import { SearchX } from "lucide-react";

export const TRADEUP_FINDER_RESULTS = {
  rank: (index: number) => `#${index + 1}`,
  expectedValue: "EV",
  cost: "Cost",
  profit: "Profit",
  float: "Float",
  inputs: "Inputs",
  inputSeparator: ", ",
  listLabel: "Best EV contracts",
  /** Capped so up to 20 contracts never push the calculator far down the page; scrolls on its own. */
  listClass: "max-h-[40vh] shrink-0 overflow-y-auto",
  empty: {
    icon: SearchX,
    title: "No contracts found",
    body: "No complete contract can be built from these skins. Try including storage unit items or another StatTrak filter.",
  },
  /** Placeholder cards while the search runs; real results vary up to the server's limit. */
  skeletonCards: 3,
  skeletonOutcomes: 3,
} as const;
