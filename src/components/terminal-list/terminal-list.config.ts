export const TERMINAL_LIST = {
  imageSize: 48,
  dayMs: 86_400_000,
  hourMs: 3_600_000,
  classes: {
    root: "flex flex-col gap-4",
    activeList: "flex flex-col divide-y",
    activeItem: "flex flex-col gap-3 py-4 first:pt-0 last:pb-0",
    activeHead: "flex flex-wrap items-center justify-between gap-2",
    /** An active Terminal is live: the accent dot, beside a mono countdown. */
    expiry:
      "inline-flex items-center gap-2 font-mono text-[11px] tabular-nums text-muted-foreground",
    sealedList: "flex flex-col divide-y",
    sealedItem: "flex flex-wrap items-center justify-between gap-2 py-2.5 first:pt-0 last:pb-0",
    inStorage: "text-xs text-muted-foreground",
  },
} as const;
