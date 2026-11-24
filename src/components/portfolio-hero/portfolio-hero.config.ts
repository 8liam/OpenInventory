/** Below this many points the history chart has nothing useful to show. */
export const PORTFOLIO_HERO = {
  minHistoryPoints: 3, // two snapshots plus the live value
  classes: {
    root: "@container",
    top: "flex flex-col gap-6 pb-5 @3xl:flex-row @3xl:items-end @3xl:justify-between",
    figure: "mt-4 text-[52px] @md:text-[72px] @3xl:text-[96px] @5xl:text-[120px]",
    change: "mt-4 min-h-5",
    stats: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs @3xl:w-72 @3xl:shrink-0",
    statLabel: "text-muted-foreground",
    statValue: "min-w-0 font-mono tabular-nums text-foreground",
    statDetail: "ml-2 font-sans text-muted-foreground",
    chart: "border-y",
    empty: "py-10 text-center text-muted-foreground",
  },
} as const;
