/** Layout classes shared by the pages that scroll their whole body under the header. */
export const PAGE_LAYOUT = {
  /** One scroll region for the page's panels; each child keeps its height instead of squeezing. */
  scrollRegion: "flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4 [&>*]:shrink-0",
  /** Two panels side by side from the `lg` breakpoint, three-fifths and two-fifths of the width. */
  fiveColumns: "grid grid-cols-1 gap-4 lg:grid-cols-5",
  spanThree: "lg:col-span-3",
  spinning: "motion-safe:animate-spin",
  note: "text-xs text-muted-foreground",
  errorNote: "text-xs text-destructive",
} as const;
