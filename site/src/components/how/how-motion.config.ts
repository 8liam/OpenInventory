export const howMotion = {
  selector: "[data-how]",
  cardSelector: ".how__card",
  /** Ratio of the illustration that must be on screen before its story plays. */
  visibleRatio: 0.55,
  /** Cards on the same row start a beat apart. */
  staggerMs: 140,
  /** Must match each illustration's keyframe length in how.css (--how-dur). */
  durationsMs: [5200, 4600, 5600],
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
} as const;
