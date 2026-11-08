export const PAGE_HEADER = {
  accountChip: (name: string) => `Account: ${name}`,
  iconSize: 12,
  /** Where focus goes when the control that had it disappears (e.g. a banner that resolved). */
  headingId: "page-heading",
  headingClass: "rounded-sm text-lg font-semibold tracking-tight outline-offset-2",
} as const;
