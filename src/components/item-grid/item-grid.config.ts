import { ITEM_SORT_LABEL, ITEM_SORTS } from "../../lib/items/item-sort.config.ts";

export const ITEM_GRID = {
  /** Cards share the row evenly, so this is the narrowest a card may get before a column is dropped. */
  minCardWidth: 160,
  gap: 12,
  padding: 12,
  focusInset: 6,
  /**
   * Only a first guess for rows not yet on screen; each row is measured and takes the height of
   * its tallest card, so a card is only as tall as what it holds.
   */
  estimatedCardHeight: { withLocation: 270, withoutLocation: 250 },
  overscan: 3,
  selectAllLabel: "Select all items",
  selectAllText: "Select all",
  sortLabel: ITEM_SORT_LABEL,
  emptyLabel: "No items",
  count: { one: "item", other: "items" },
  sorts: ITEM_SORTS,
  keys: {
    left: "ArrowLeft",
    right: "ArrowRight",
    up: "ArrowUp",
    down: "ArrowDown",
    pageDown: "PageDown",
    pageUp: "PageUp",
    first: "Home",
    last: "End",
    activate: ["Enter", " "] as readonly string[],
  },
} as const;
