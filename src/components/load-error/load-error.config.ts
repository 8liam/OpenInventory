export const LOAD_ERROR = {
  title: "Couldn't load this page",
  retry: "Try again",
  retrying: "Retrying…",
  iconSize: 12,
  /** The button keeps focus while retrying, so it dims instead of using `disabled`. */
  busyClass: "opacity-60",
  spinClass: "motion-safe:animate-spin",
  classes: {
    root: "flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-card px-4 py-3",
    body: "min-w-0",
    title: "font-medium",
    message: "mt-0.5 text-destructive",
  },
} as const;
