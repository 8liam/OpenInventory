export const SELL_SUGGESTIONS_CARD = {
  /** Rows shown on the dashboard; the Items page shows a chip on every affected item. */
  limit: 5,
  thumbSize: 32,
  title: "Suggestions",
  empty: "Nothing to consider selling right now.",
  trendsUnavailable: "Price trends are unavailable, so only idle stacks are shown.",
  note: "Read-only: OpenInventory never lists or trades. Locked items are left out.",
} as const;
