/** Rows and the header inset their cells by this much on each side (px). */
const EDGE_PADDING = 16;

export const DATA_TABLE = {
  rowHeight: 40,
  overscan: 12,
  sortAscendingLabel: "ascending",
  sortDescendingLabel: "descending",
  emptyLabel: "No rows",
  /** Pluralised row count in the footer. */
  rowCount: { one: "row", other: "rows" },
  /** Checkbox column in px; touch screens get a 44px hit area instead of the 16px box. */
  selectionColumnWidth: 28,
  touchSelectionColumnWidth: 44,
  touchQuery: "(pointer: coarse), (max-width: 639px)",
  checkboxClass: "flex h-9 items-center",
  /** The label around the checkbox is the hit area: 44px tall, the column's full width. */
  touchCheckboxClass: "flex h-11 w-full items-center",
  /** Gap between columns, so two right-aligned headers never run together. */
  columnGap: 12,
  edgePadding: EDGE_PADDING,
  /** Both edges' padding, which the fitted columns can't use. */
  horizontalPadding: EDGE_PADDING * 2,
  /**
   * The table never squeezes below this height; on a short window the page scrolls instead.
   * Shared with the card grid, which sits in the same spot.
   */
  frameClass: "flex min-h-72 flex-1 flex-col rounded-lg border bg-card",
  /** A stable gutter keeps the rows' width (and so the chosen layout) the same with or without a scrollbar. */
  scrollClass: "min-h-0 flex-1 overflow-auto [scrollbar-gutter:stable]",
  skeletonScrollClass: "min-h-0 flex-1 overflow-hidden [scrollbar-gutter:stable]",
  headerClass: "grid shrink-0 border-b text-xs text-muted-foreground",
  sortSelectClass: "w-full max-w-48",
  sortIconSize: 12,
  selectAllLabel: "Select all rows",
  selectRowLabel: "Select row",
  keys: {
    next: "ArrowDown",
    previous: "ArrowUp",
    pageDown: "PageDown",
    pageUp: "PageUp",
    first: "Home",
    last: "End",
    activate: ["Enter", " "] as readonly string[],
  },
} as const;
