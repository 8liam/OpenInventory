export const VALUE_CHART = {
  height: 280,
  padding: { top: 16, right: 12, bottom: 28, left: 56 },
  yTicks: 4,
  /** Most x-axis intervals; narrower charts get fewer so labels never collide. */
  maxXTicks: 4,
  /** Minimum px between x-axis labels: dates, and the wider date-with-time labels. */
  xTickSpacing: { date: 120, time: 150 },
  strokeWidth: 2,
  dotSpacing: 14,
  dotRadius: 0.9,
  tooltipGap: 14,
  /** Below this span, axis and tooltip labels include the time of day. */
  timeLabelSpanMs: 2 * 86_400_000,
  tone: { up: "var(--success)", down: "var(--destructive)" },
} as const;
