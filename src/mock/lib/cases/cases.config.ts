export const CASES_PAGE = {
  /** How often to refresh while a history sync is running. */
  pollMs: 2_500,
} as const;

/** The kinds of inventory-history event the Cases page can break down, in pill order. */
export const OPENING_KINDS = ["case", "souvenir", "capsule", "tradeUp", "drop"] as const;
export const DEFAULT_OPENING_KIND = "case" satisfies (typeof OPENING_KINDS)[number];

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
