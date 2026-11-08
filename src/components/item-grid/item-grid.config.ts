import { ITEM_SORT_LABEL, ITEM_SORTS } from "../../lib/items/item-sort.config.ts";

export const ITEM_GRID = {
  /** Cards share the row evenly, so this is the narrowest a card may get before a column is dropped. */
  minCardWidth: 160,
  gap: 12,
  padding: 12,
  /** Fixed so rows can be virtualised; includes the highlight chip line and location line. */
  cardHeight: { withLocation: 272, withoutLocation: 254 },
  overscan: 3,
  selectAllLabel: "Select all items",
  selectAllText: "Select all",
  sortLabel: ITEM_SORT_LABEL,
  emptyLabel: "No items",
  count: { one: "item", other: "items" },
  defaultSort: "price-desc",
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
