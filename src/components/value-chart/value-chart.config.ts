export const VALUE_CHART = {
  height: 220,
  padding: { top: 12, right: 8, bottom: 22, left: 52 },
  yTicks: 4,
  xTicks: 4,
  strokeWidth: 1.5,
  /** Below this span, axis and tooltip labels include the time of day. */
  timeLabelSpanMs: 2 * 86_400_000,
} as const;
