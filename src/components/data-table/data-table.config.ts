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
  /** The rows' `px-4`, which the fitted columns can't use. */
  horizontalPadding: 32,
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
