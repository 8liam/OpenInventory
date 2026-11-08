export const MONTHLY_BARS = {
  height: 120,
  maxMonths: 24,
  /** Up to this many months each bar carries its own count and month; beyond it only the ends are labelled. */
  labelledMax: 12,
  /** Up to this many bars the month under each is written in full; past it, just the month number (the ends carry the year). */
  fullMonthMax: 6,
  /** Height kept free in a labelled column for its count above and month below the bar. */
  labelReserve: "2.5rem",
  /** Smallest drawn bar, so a month with a few openings is still visible next to a big one. */
  minBar: "2px",
  classes: {
    chart: "flex items-end gap-1",
    /** Bars never grow past this width, so a couple of months don't become slabs. */
    column: "flex h-full min-w-0 max-w-14 flex-1 flex-col justify-end gap-1",
    bar: "w-full rounded-t bg-primary/80 transition-colors hover:bg-primary",
    value: "tabular text-center text-[11px] font-medium leading-none",
    month: "tabular truncate text-center text-[11px] text-muted-foreground",
    /** Many months: slim bars share the width and the chart's own height. */
    slimBar: "min-w-0 flex-1 rounded-t bg-primary/80 transition-colors hover:bg-primary",
    ends: "tabular mt-1.5 flex justify-between text-[11px] text-muted-foreground",
    details: "mt-3 text-xs",
    summary:
      "w-fit cursor-pointer rounded text-muted-foreground underline-offset-2 hover:text-foreground hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    list: "mt-2 grid grid-cols-2 gap-x-5 gap-y-1 sm:grid-cols-3 lg:grid-cols-4",
    item: "flex justify-between gap-2 border-b py-1",
    count: "tabular font-medium",
  },
  summary: "View monthly counts",
  /** Splits "2026-09" into its year and month number. */
  monthSeparator: "-",
} as const;
