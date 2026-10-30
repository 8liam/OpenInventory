export const ITEM_TABLE = {
  rowHeight: 64,
  wideQuery: "(min-width: 768px)",
  /** CSS grid tracks, shared by the table and its loading skeleton. */
  widths: {
    item: { wide: "4fr", narrow: "minmax(0, 1fr)" },
    location: "1.6fr",
    type: "1.2fr",
    float: "0.9fr",
    price: { wide: "0.9fr", narrow: "92px" },
  },
  /** Enough rows to fill a tall screen; the rest are clipped. */
  skeletonRows: 16,
} as const;
