export const ITEM_TABLE = {
  /** Narrow rows are taller: the item name may wrap to two lines above its highlight chips. */
  /** `narrowWithAccount` adds the owning account's line under the name in the all-accounts view. */
  rowHeight: { wide: 64, narrow: 80, narrowWithAccount: 96 },
  wideQuery: "(min-width: 768px)",
  /** CSS grid tracks, shared by the table and its loading skeleton. */
  widths: {
    item: { wide: "4fr", narrow: "minmax(0, 1fr)" },
    account: "1.3fr",
    location: "1.6fr",
    type: "1.2fr",
    float: "0.9fr",
    highlights: "0.7fr",
    highlightsNarrow: "84px",
    price: { wide: "0.9fr", narrow: "92px" },
  },
  /** Enough rows to fill a tall screen; the rest are clipped. */
  skeletonRows: 16,
} as const;
