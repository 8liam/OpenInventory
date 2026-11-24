export const BREAKDOWN_PANEL = {
  tabs: [
    { key: "byCategory", label: "Type" },
    { key: "byRarity", label: "Rarity" },
    { key: "byWear", label: "Wear" },
    { key: "byLocation", label: "Location" },
  ],
  defaultTab: "byCategory",
  rowLimit: 8,
  otherColor: "var(--fill-5)",
  /** Grey steps used in order when the data supplies no colour (everything except rarity). */
  palette: ["var(--fill-1)", "var(--fill-2)", "var(--fill-3)", "var(--fill-4)", "var(--fill-5)"],
  classes: {
    section: "rounded-lg border bg-card p-4",
    header: "mb-4 flex flex-wrap items-center justify-between gap-3",
    title: "text-[13px] font-semibold",
    tablist: "flex gap-0.5 rounded-md border border-control p-0.5",
    tab: "flex h-6 items-center rounded-sm border border-transparent px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
    tabActive:
      "border-accent-edge bg-accent font-semibold text-accent-foreground hover:bg-accent hover:text-accent-foreground",
  },
} as const;
