export const SETTINGS_PAGE = {
  /** The panels scroll under the page header, like every other page's content. */
  scrollClass: "@container min-h-0 flex-1 overflow-y-auto pb-4",
  /**
   * One full-width column while narrow; accounts and data beside the preferences once the content
   * is wide. No width cap, so the page ends where every other page's content does.
   */
  layoutClass: "grid grid-cols-1 items-start gap-3 @3xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]",
  columnClass: "flex min-w-0 flex-col gap-3",
  selectWidth: "w-40",
  refreshIconSize: 14,
  classes: {
    body: "mb-3 text-muted-foreground",
    refreshRow: "flex flex-wrap items-center gap-x-3 gap-y-1",
    spinning: "motion-safe:animate-spin",
    scope: "text-xs text-muted-foreground",
    skipped: "mt-2 text-xs text-muted-foreground",
    error: "mt-2 text-xs text-destructive",
    field: "flex items-center justify-between gap-4",
    hint: "mt-3 text-muted-foreground",
  },
} as const;
