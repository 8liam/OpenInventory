export const SELECT = {
  /** Lists longer than this get a search box. */
  searchThreshold: 7,
  searchPlaceholder: "Search",
  noMatches: "No matches",
  iconSize: 14,
  /** A square, touch-sized button that opens the list when the trigger is only an icon. */
  iconTriggerClass:
    "grid size-8 shrink-0 place-items-center rounded-md text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:border-primary aria-expanded:bg-muted aria-expanded:text-foreground disabled:pointer-events-none disabled:opacity-50 max-sm:size-9",
  fieldTriggerClass:
    "flex h-8 w-full items-center justify-between gap-2 rounded-md border border-input bg-card pl-3 pr-2 text-left text-foreground outline-none transition-colors hover:bg-muted focus-visible:border-primary disabled:pointer-events-none disabled:opacity-50 max-sm:h-9",
  triggerIconSize: 16,
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
