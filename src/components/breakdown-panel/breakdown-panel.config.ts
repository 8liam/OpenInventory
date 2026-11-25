import { CHART_PALETTE } from "~/lib/theme/chart-palette.config";

export const BREAKDOWN_PANEL = {
  /**
   * Each tab picks how its slices are coloured: categorical hues for Type and Location, CS2's own
   * rarity colours for Rarity, and a one-hue ramp from Factory New to Battle-Scarred for Wear.
   */
  tabs: [
    { key: "byCategory", label: "Type", scheme: "categorical" },
    { key: "byRarity", label: "Rarity", scheme: "rarity" },
    { key: "byWear", label: "Wear", scheme: "wear" },
    { key: "byLocation", label: "Location", scheme: "categorical" },
  ],
  defaultTab: "byCategory",
  rowLimit: 8,
  /** The folded tail has no category of its own, so it stays neutral. */
  otherColor: CHART_PALETTE.neutral,
  defaultScheme: "categorical",
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
