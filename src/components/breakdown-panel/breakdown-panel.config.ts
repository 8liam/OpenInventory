export const BREAKDOWN_PANEL = {
  tabs: [
    { key: "byCategory", label: "Type" },
    { key: "byRarity", label: "Rarity" },
    { key: "byWear", label: "Wear" },
    { key: "byLocation", label: "Location" },
  ],
  defaultTab: "byCategory",
  rowLimit: 8,
  otherColor: "var(--muted-foreground)",
  /** Used in order when the data supplies no colour (everything except rarity). */
  palette: [
    "oklch(62% 0.19 264)",
    "oklch(70% 0.15 165)",
    "oklch(74% 0.16 75)",
    "oklch(64% 0.21 20)",
    "oklch(64% 0.2 305)",
    "oklch(72% 0.13 215)",
    "oklch(70% 0.17 130)",
    "oklch(68% 0.18 350)",
  ],
} as const;
