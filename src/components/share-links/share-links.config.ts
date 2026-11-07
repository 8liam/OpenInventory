export const SHARE_LINKS = {
  /** Scope choice values in the picker: "all", or one unit by id. */
  allChoice: "all",
  unitChoicePrefix: "unit:",
  selectWidth: "min-w-0 flex-1 sm:w-56 sm:flex-none",
  listClass: "divide-y",
  rowClass: "flex flex-wrap items-center justify-between gap-x-3 gap-y-2 py-2.5",
  textClass: "min-w-0",
  metaClass: "text-xs text-muted-foreground",
  /** Joins a link's created, expiry and price-hidden facts on one line. */
  metaSeparator: " · ",
} as const;
