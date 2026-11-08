export const ITEM_GRID = {
  /** Cards share the row evenly, so this is the narrowest a card may get before a column is dropped. */
  minCardWidth: 160,
  gap: 12,
  padding: 12,
  /** Fixed so rows can be virtualised; the location line adds height. */
  cardHeight: { withLocation: 248, withoutLocation: 230 },
  overscan: 3,
  selectAllLabel: "Select all items",
  selectAllText: "Select all",
  sortLabel: "Sort items",
  emptyLabel: "No items",
  countSuffix: "items",
  defaultSort: "price-desc",
  sorts: [
    { id: "price-desc", label: "Price: high to low" },
    { id: "price-asc", label: "Price: low to high" },
    { id: "float-asc", label: "Float: low to high" },
    { id: "float-desc", label: "Float: high to low" },
    { id: "highlights-desc", label: "Highlights: best first" },
    { id: "name", label: "Name" },
  ],
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
