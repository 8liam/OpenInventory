export const HISTORY_API = {
  origin: "https://steamcommunity.com",
  appId: 730,
  language: "english",
  loginPath: "/login",
  /** Pause between pages; Steam throttles this endpoint aggressively. */
  pageGapMs: 2_500,
  /** Wait before retrying after a 429. */
  rateLimitBackoffMs: 15_000,
  maxRateLimitRetries: 8,
  requestTimeoutMs: 30_000,
} as const;

/** Selectors for the history markup Steam returns inside the JSON page. */
export const HISTORY_SELECTORS = {
  row: ".tradehistoryrow",
  date: ".tradehistory_date",
  time: ".tradehistory_timestamp",
  description: ".tradehistory_event_description",
  itemGroup: ".tradehistory_items",
  sign: ".tradehistory_items_plusminus",
  item: ".history_item",
  itemName: ".history_item_name",
} as const;

export const HISTORY_SIGN = { gained: "+", lost: "-" } as const;

/** Text of the date cell: "23 Sep, 2026" followed by a "9:51pm" timestamp child. */
export const HISTORY_DATE = {
  datePattern: /^(\d{1,2})\s+([A-Za-z]{3}),?\s+(\d{4})$/,
  timePattern: /^(\d{1,2}):(\d{2})\s*(am|pm)$/i,
  months: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
} as const;

/** English event wording and item type tags; classification depends on `l=english`. */
export const EVENT_TEXT = {
  unlocked: "Unlocked a container",
  crafted: "Crafted",
  drops: ["Earned a new rank and got a drop", "Got an item drop"],
  ignored: ["Earned due to game play time"],
} as const;

export const ITEM_TAGS = {
  rarity: "Rarity",
  type: "Type",
  exterior: "Exterior",
  quality: "Quality",
  itemSet: "ItemSet",
  weaponCase: "CSGO_Type_WeaponCase",
  caseKey: "CSGO_Tool_WeaponCase_KeyTag",
  stickerTool: "CSGO_Tool_Sticker",
  gloves: "Type_Hands",
  knife: "CSGO_Type_Knife",
  statTrak: "StatTrak™",
  souvenirName: "Souvenir",
  starName: "★",
  /** Weapon categories a case can drop (everything under CSGO_Type_ except tools and cases). */
  weaponPrefix: "CSGO_Type_",
} as const;

export const RARITY_COLOR = {
  gold: "eb4b4b",
  covert: "eb4b4b",
  classified: "d32ce6",
  restricted: "8847ff",
  milSpec: "4b69ff",
} as const;

export const TRADE_UP_INPUT_COUNTS: readonly number[] = [10, 5];

/** Rarity buckets shown in stats, best first; anything else counts as "Other". */
export const RARITY_BUCKETS = [
  { key: "gold", label: "Gold", color: "d4af37" },
  { key: "covert", label: "Covert", color: RARITY_COLOR.covert },
  { key: "classified", label: "Classified", color: RARITY_COLOR.classified },
  { key: "restricted", label: "Restricted", color: RARITY_COLOR.restricted },
  { key: "milSpec", label: "Mil-Spec", color: RARITY_COLOR.milSpec },
  { key: "other", label: "Other", color: "9ca3af" },
] as const;

export const CASE_STATS = {
  topItemCount: 10,
  topCaseCount: 8,
  recentCount: 12,
  rarestCount: 8,
} as const;

export const SYNC_POLICY = {
  /** A finished history is topped up with newer events when this old. */
  staleAfterMs: 15 * 60_000,
} as const;
