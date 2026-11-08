export const BAR_LIST = {
  defaultLimit: 8,
  fallbackColor: "var(--primary)",
  /** Read (not shown) between a row's label, count, value and share, so they never run together. */
  separator: ", ",
  classes: {
    list: "flex flex-col gap-3",
    row: "flex items-baseline justify-between gap-3",
    labelGroup: "flex min-w-0 items-baseline gap-1.5",
    label: "truncate",
    count: "tabular shrink-0 text-xs text-muted-foreground",
    figures: "tabular shrink-0",
    share: "ml-2 inline-block w-11 text-right text-xs text-muted-foreground",
    separator: "sr-only",
    track: "mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted",
    bar: "h-full rounded-full",
  },
} as const;
