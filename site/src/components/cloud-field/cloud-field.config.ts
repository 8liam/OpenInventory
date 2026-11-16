export const GLOW_FIELD = {
  selector: "[data-glow-field]",
  variantAttribute: "data-glow-field",
  reducedMotionQuery: "(prefers-reduced-motion: reduce)",
  finePointerQuery: "(hover: hover) and (pointer: fine)",
  mouseXVar: "--mx",
  mouseYVar: "--my",
  /** Panel scroll progress (0 at rest, 1 once the panel has scrolled by its own height). */
  scrollVar: "--sp",
  /** Fraction of the way the pointer value eases toward its target each frame. */
  easing: 0.07,
  /** Stop easing once within this distance of the target. */
  settleEpsilon: 0.001,
} as const;
