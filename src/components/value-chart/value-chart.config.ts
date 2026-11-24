export const VALUE_CHART = {
  height: 280,
  padding: { top: 16, right: 12, bottom: 28, left: 96 },
  yTicks: 4,
  /** Most x-axis intervals; narrower charts get fewer so labels never collide. */
  maxXTicks: 4,
  /** Minimum px between x-axis labels: dates, and the wider date-with-time labels. */
  xTickSpacing: { date: 120, time: 150 },
  strokeWidth: 2,
  tooltipGap: 14,
  axisFontSize: 10,
  /** The line is the accent mark; the area under it a flat 9% lime wash, never a gradient. */
  lineColor: "var(--accent-ink)",
  areaColor: "var(--accent)",
  areaOpacity: 0.09,
  gridColor: "var(--border-strong)",
  crosshairColor: "var(--foreground)",
  dotRadius: 4,
  classes: {
    tooltip:
      "pointer-events-none absolute whitespace-nowrap rounded-md border border-border-strong bg-card px-2 py-1.5 text-left text-foreground",
    tooltipValue: "font-mono text-xs font-medium tabular-nums",
    tooltipDate: "text-[11px] text-muted-foreground",
  },
  /** Below this span, axis and tooltip labels include the time of day. */
  timeLabelSpanMs: 2 * 86_400_000,
} as const;
