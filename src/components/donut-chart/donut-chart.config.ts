export const DONUT_CHART = {
  size: 168,
  radius: 40,
  strokeWidth: 14,
  /** Visual gap between segments, in circumference units out of 100. */
  gap: 0.8,
  dimmedOpacity: 0.35,
  /** Cross-fade time for the centre readout when the hovered slice changes. */
  fadeMs: 150,
  fallbackColor: "var(--muted-foreground)",
  /** Slices are grey steps in order, the biggest share first; the hovered one is the accent. */
  steps: ["var(--fill-1)", "var(--fill-2)", "var(--fill-3)", "var(--fill-4)", "var(--fill-5)"],
  activeColor: "var(--accent)",
  /** Hairline between slices, in the card's colour, so neighbouring greys stay apart. */
  separatorColor: "var(--card)",
  separatorWidth: 0.6,
} as const;
