/** Filter value meaning "no filter" for the account, location and type pickers. */
export const ALL_FILTER = "all";

/** Account-filter values that pick every account with a label, e.g. `label:trade`. */
export const LABEL_FILTER_PREFIX = "label:";

export const ITEMS_PAGE = {
  /** Below `sm` the controls sit in a two-column grid; from `sm` they flow in one wrapping row. */
  controlsClass: "grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center",
  searchClass:
    "col-span-2 h-9 w-full rounded-md border border-input bg-card px-2.5 outline-none placeholder:text-muted-foreground focus:border-primary sm:h-8 sm:w-56",
  /** Each picker takes one grid cell on phones and a fixed width from `sm`. */
  selectClass: "min-w-0 sm:w-48",
  /** The account filter only shows in the all-accounts view, where it gets a full row on phones. */
  accountSelectClass: "col-span-2 min-w-0 sm:col-span-1 sm:w-48",
  togglesClass: "col-span-2 flex items-center gap-2",
  highlightsToggleClass:
    "gap-1.5 px-2.5 text-xs max-sm:h-9 aria-pressed:border-accent-strong/60 aria-pressed:bg-accent/15 aria-pressed:text-foreground",
  iconSize: 14,
} as const;
