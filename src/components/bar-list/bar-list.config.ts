export const BAR_LIST = {
  defaultLimit: 8,
  fallbackColor: "var(--fill-3)",
  /** Read (not shown) between a row's label, count, value and share, so they never run together. */
  separator: ", ",
  classes: {
    list: "flex flex-col border-t border-border-strong",
    item: "group flex flex-col justify-center gap-1.5 border-b py-2",
    row: "flex items-baseline justify-between gap-3",
    labelGroup: "flex min-w-0 items-baseline gap-1.5",
    /** The slice's own colour (a rarity hue, or the donut's grey step) as an 8px key, never a fill. */
    tick: "size-2 shrink-0 self-center rounded-[1px]",
    label: "truncate",
    count: "tabular shrink-0 text-xs text-muted-foreground",
    figures: "shrink-0 font-mono text-xs tabular-nums",
    share: "ml-2 inline-block w-11 text-right text-xs text-muted-foreground",
    separator: "sr-only",
    track: "h-1.5 overflow-hidden",
    bar: "h-full bg-fill-3 transition-colors group-hover:bg-foreground",
  },
} as const;
