export const SYNC_ERROR = {
  retry: "Try again",
  retrying: "Retrying…",
  iconSize: 12,
  alertIconSize: 14,
  classes: {
    /** An icon and a sentence that says what happens next. No tinted banner. */
    root: "flex shrink-0 flex-wrap items-center justify-between gap-3 border-y border-border-strong py-3",
    message: "flex min-w-0 items-start gap-2",
    icon: "mt-0.5 shrink-0 text-destructive",
  },
} as const;
