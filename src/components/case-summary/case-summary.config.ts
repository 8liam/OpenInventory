/** Same layout as the dashboard's value hero: kicker, ledger figure, colophon of stats. */
export const CASE_SUMMARY = {
  classes: {
    root: "@container border-b border-border-strong pb-5",
    top: "flex flex-col gap-5 @2xl:flex-row @2xl:items-end @2xl:justify-between",
    figure: "figure mt-3 block text-[52px] leading-[0.9] @md:text-[72px]",
    stats: "grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-xs @2xl:w-64 @2xl:shrink-0",
    statLabel: "text-muted-foreground",
    statValue: "font-mono tabular-nums text-foreground",
  },
} as const;
