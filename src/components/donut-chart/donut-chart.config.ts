export const DONUT_CHART = {
  size: 168,
  radius: 40,
  strokeWidth: 14,
  /** SVG units per side of the square viewBox. */
  viewBox: 100,
  /** Gap between neighbouring slices in screen px; the card shows through it. */
  gapPx: 2,
  /** Other slices fade to this while one is highlighted, so the highlighted one keeps its colour. */
  dimmedOpacity: 0.45,
  /** Cross-fade time for the centre readout when the hovered slice changes. */
  fadeMs: 150,
  fallbackColor: "var(--muted-foreground)",
} as const;
