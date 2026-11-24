export const SELECT = {
  /** Lists longer than this get a search box. */
  searchThreshold: 7,
  searchPlaceholder: "Search",
  noMatches: "No matches",
  iconSize: 14,
  /** A square, touch-sized button that opens the list when the trigger is only an icon. */
  iconTriggerClass:
    "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground disabled:pointer-events-none disabled:opacity-50 max-sm:size-9",
  fieldTriggerClass:
    "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-control bg-background pl-2.5 pr-2 text-left text-foreground transition-colors hover:bg-muted disabled:pointer-events-none disabled:opacity-45 max-sm:h-9",
  triggerIconSize: 16,
  classes: {
    popover:
      "fixed z-50 flex flex-col overflow-hidden rounded-md border border-border-strong bg-card text-foreground outline-none",
    searchRow: "flex h-9 shrink-0 items-center gap-2 border-b px-2.5",
    searchIcon: "shrink-0 text-muted-foreground",
    searchInput:
      "no-focus-ring min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted-foreground",
    list: "no-focus-ring overflow-y-auto p-1 outline-none",
    option: "flex min-h-8 cursor-pointer items-center gap-2 rounded-sm px-2 py-1",
    optionActive: "bg-muted",
    /** The chosen option: ink tick and semibold, so it reads without colour. */
    optionSelected: "font-semibold",
    optionDisabled: "cursor-not-allowed opacity-45",
    check: "shrink-0 text-accent-ink",
    hint: "block truncate text-xs text-muted-foreground",
    detail: "shrink-0 font-mono text-[11px] tabular-nums text-muted-foreground",
    empty: "px-2 py-1.5 text-muted-foreground",
  },
  gap: 6,
  viewportMargin: 8,
  maxListHeight: 280,
  minListWidth: 176,
  keys: {
    open: ["ArrowDown", "ArrowUp", "Enter", " "] as readonly string[],
    next: "ArrowDown",
    previous: "ArrowUp",
    commit: "Enter",
    close: "Escape",
    /** Closes the list and lets focus move on as usual. */
    leave: "Tab",
    home: "Home",
    end: "End",
  },
} as const;
