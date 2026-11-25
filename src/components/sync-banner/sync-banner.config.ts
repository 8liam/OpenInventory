export const SYNC_BANNER = {
  iconSize: 12,
  /** The button keeps focus while a sync runs, so it dims instead of using `disabled`. */
  busyClass: "opacity-60",
  spinClass: "motion-safe:animate-spin",
  classes: {
    root: "flex flex-wrap items-center justify-between gap-3 border-y border-border-strong py-3",
    status: "min-w-0 text-xs text-muted-foreground",
    progress: "tabular",
    error: "text-destructive",
    srOnly: "sr-only",
  },
} as const;
