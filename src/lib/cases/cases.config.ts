export const CASES_PAGE = {
  /** How often to refresh while a history sync is running. */
  pollMs: 2_500,
  /** Slice colour for openings whose rarity Steam did not record: neutral, so it reads as "no data". */
  unknownRarityColor: "8b8b94",
  classes: {
    contents: "contents",
    muted: "text-muted-foreground",
    /** Rarity breakdown beside the monthly and rarest panels from `lg`. */
    summaryGrid: "grid grid-cols-1 gap-4 lg:grid-cols-5",
    rarityPanel: "lg:col-span-2",
    rarityBars: "mt-5",
    sideColumn: "flex flex-col gap-4 lg:col-span-3",
    /** `items-start`: a panel with little to list keeps its own height instead of stretching to its tallest neighbour. */
    listGrid: "grid grid-cols-1 items-start gap-4",
    listGridThree: "lg:grid-cols-3",
    listGridTwo: "lg:grid-cols-2",
  },
} as const;

/** The kinds of inventory-history event the Cases page can break down, in pill order. */
export const OPENING_KINDS = ["case", "souvenir", "capsule", "tradeUp", "drop"] as const;
export const DEFAULT_OPENING_KIND = "case" satisfies (typeof OPENING_KINDS)[number];

/** Published weapon-case odds in percent, at the linked disclosure's precision. */
export const CASE_DROP_ODDS = {
  milSpec: 79.923,
  restricted: 15.985,
  classified: 3.197,
  covert: 0.639,
  gold: 0.256,
} as const;

/** Where a tier's count sits against the odds: inside the normal range, or unusually low/high. */
export const LUCK_STATUSES = ["low", "normal", "high"] as const;

/** Chart axis for the odds comparison, in standard deviations from the expected count. */
export const LUCK_AXIS = {
  /** Ordinary luck stays within this distance of the expected count. */
  normalRange: 2,
  /** The axis runs this far either side of the expected count; points beyond are clamped. */
  halfWidth: 3,
} as const;

/** Kinds whose items can be StatTrak; the counter is noise everywhere else. */
export const STATTRAK_KINDS: readonly (typeof OPENING_KINDS)[number][] = ["case", "souvenir"];

/** Row counts the placeholder panels draw; they match the most the server returns per list. */
export const CASES_SKELETON = {
  rarityRows: 6,
  rarestRows: 8,
  topRows: 10,
  sourceRows: 8,
  recentRows: 12,
} as const;
