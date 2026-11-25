export const BAR_LIST = {
  defaultLimit: 8,
  fallbackColor: "var(--muted-foreground)",
  /** Read (not shown) between a row's label, count, value and share, so they never run together. */
  separator: ", ",
  classes: {
    list: "flex flex-col border-t border-border-strong",
    item: "group flex flex-col justify-center gap-1.5 border-b px-1 py-2 transition-opacity focus-inset",
    /** Rows other than the highlighted one step back. */
    itemDimmed: "opacity-60",
    itemInteractive: "cursor-default hover:bg-muted",
    row: "flex items-baseline justify-between gap-3",
    labelGroup: "flex min-w-0 items-baseline gap-1.5",
    /** The slice's colour as an 8px key: the same colour as its donut slice and its bar. */
    tick: "size-2 shrink-0 self-center rounded-[1px]",
    label: "truncate",
    count: "tabular shrink-0 text-xs text-muted-foreground",
    figures: "shrink-0 font-mono text-xs tabular-nums",
    share: "ml-2 inline-block w-11 text-right text-xs text-muted-foreground",
    separator: "sr-only",
    /** A hairline track; the bar sits on it in the slice's colour. */
    track:
      "relative flex h-1.5 items-center overflow-hidden before:absolute before:inset-x-0 before:h-px before:bg-border before:content-['']",
    bar: "relative h-full rounded-[1px]",
  },
} as const;
