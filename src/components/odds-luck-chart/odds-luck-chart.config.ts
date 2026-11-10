import type { LuckStatus } from "~/lib/cases/odds-luck.types";
import type { AxisLabel } from "./odds-luck-chart.types";

export const ODDS_LUCK_CHART = {
  expectedDecimals: 1,
  /** Axis words, left to right; the end labels hug the plot edges so they are not clipped. */
  axisLabels: [
    { text: "Far fewer", placement: "start" },
    { text: "Fewer", placement: "at", percent: 25 },
    { text: "As expected", placement: "at", percent: 50 },
    { text: "More", placement: "at", percent: 75 },
    { text: "Far more", placement: "end" },
  ] as const satisfies readonly AxisLabel[],
  dotSizePx: 14,
  classes: {
    root: "space-y-1",
    row: "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 border-b py-2 sm:grid-cols-[7rem_6.5rem_minmax(0,1fr)_7.5rem]",
    name: "flex items-center gap-2 text-sm font-medium",
    nameDot: "h-2.5 w-2.5 shrink-0 rounded-full",
    numbers: "tabular text-right text-xs leading-snug text-muted-foreground sm:text-left",
    pulled: "text-sm font-semibold text-foreground",
    plot: "relative col-span-2 h-9 sm:col-span-1",
    band: "absolute inset-y-2 rounded-md bg-foreground/10",
    centre: "absolute inset-y-1 w-px bg-foreground/35",
    stem: "absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full opacity-60",
    dot: "absolute top-1/2 rounded-full border-2 border-background",
    status: "hidden text-right text-xs sm:block",
    statusNormal: "text-muted-foreground",
    statusUnusual: "font-medium text-foreground",
    axisRow: "hidden gap-x-4 sm:grid sm:grid-cols-[7rem_6.5rem_minmax(0,1fr)_7.5rem]",
    axis: "relative col-start-3 h-5 text-[10px] text-muted-foreground",
    axisLabel: "absolute whitespace-nowrap",
    caption: "pt-2 text-xs text-muted-foreground",
    verdict: "pt-3 text-xs text-muted-foreground",
    verdictStrong: "font-medium text-foreground",
  },
  copy: {
    title: "How your pulls compare to the odds",
    status: {
      low: "Unusually low",
      normal: "Normal",
      high: "Unusually high",
    } as const satisfies Record<LuckStatus, string>,
    pulled: (count: string) => `${count} pulled`,
    expected: (count: string) => `${count} expected`,
    caption: "The shaded area is the normal range of luck for that tier.",
    allNormal: "Every tier is within the normal range.",
    someUnusual: (tiers: string) => `Outside the normal range: ${tiers}.`,
    group: (tier: string, pulled: string, expected: string, status: string) =>
      `${tier}: ${pulled} pulled, ${expected} expected. ${status}.`,
  },
} as const;
