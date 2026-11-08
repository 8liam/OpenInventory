export const PAGE_HEADER = {
  accountChip: (name: string) => `Account: ${name}`,
  iconSize: 12,
  /** Where focus goes when the control that had it disappears (e.g. a banner that resolved). */
  headingId: "page-heading",
  headingClass: "rounded-sm text-lg font-semibold tracking-tight outline-offset-2",
  classes: {
    root: "flex shrink-0 flex-wrap items-end justify-between gap-3",
    titleBlock: "min-w-0",
    titleRow: "flex flex-wrap items-center gap-x-2.5 gap-y-1",
    chip: "inline-flex max-w-full items-center gap-1 truncate rounded-full border bg-card px-2 py-0.5 text-xs text-muted-foreground",
    chipIcon: "shrink-0",
    chipText: "truncate",
    description: "mt-0.5 text-xs text-muted-foreground",
    actions: "flex flex-wrap items-center gap-2 max-sm:w-full",
  },
} as const;
