const DAY_MS = 86_400_000;

export const HISTORY_PANEL = {
  ranges: [
    { key: "1d", label: "1D", windowMs: DAY_MS },
    { key: "1w", label: "1W", windowMs: 7 * DAY_MS },
    { key: "1m", label: "1M", windowMs: 30 * DAY_MS },
    { key: "3m", label: "3M", windowMs: 90 * DAY_MS },
    { key: "ytd", label: "YTD", windowMs: "ytd" },
    { key: "all", label: "Total", windowMs: null },
  ],
  defaultRange: "all",
  series: [
    { key: "totalValue", label: "Total" },
    { key: "inventoryValue", label: "Inventory" },
    { key: "storageValue", label: "Storage units" },
  ],
  defaultSeries: "totalValue",
  /** Fewer points than this and a line says nothing. */
  minPoints: 2,
  copy: { empty: "Not enough history in this range yet." },
} as const;
