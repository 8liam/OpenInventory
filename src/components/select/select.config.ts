export const SELECT = {
  /** Lists longer than this get a search box. */
  searchThreshold: 7,
  searchPlaceholder: "Search",
  noMatches: "No matches",
  iconSize: 14,
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
    home: "Home",
    end: "End",
  },
} as const;
