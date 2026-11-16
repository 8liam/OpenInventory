/** Knobs for the touch-screen auto-play (hover-capable screens play the same animations on :hover instead). */
export const BENTO_PLAY = {
  selectors: { grid: ".bento__grid", card: ".bento__card" },
  /** Added to a card while its illustration plays; the CSS keys off it exactly like :hover. */
  playClass: "is-play",
  media: { canHover: "(hover: hover)", reducedMotion: "(prefers-reduced-motion: reduce)" },
  /** How much of the card must be on screen before it plays. */
  threshold: 0.6,
  /** One pass of the longest sequence, plus a breath, before the card settles back to its static frame. */
  playMs: 10_000,
} as const;
