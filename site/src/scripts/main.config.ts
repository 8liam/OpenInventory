/** Motion and behaviour constants for main.ts. */
export const MAIN_SELECTORS = {
  reveal: "[data-reveal]",
  parallax: "[data-parallax]",
  count: "[data-count]",
  countText: "[data-count-text]",
  starsNumber: "[data-stars-n]",
} as const;

export const MAIN_CLASSES = {
  motion: "motion",
  pending: "is-pending",
  revealed: "is-in",
} as const;

export const MAIN_MEDIA = {
  reducedMotion: "(prefers-reduced-motion: reduce)",
  noReducedMotion: "(prefers-reduced-motion: no-preference)",
} as const;

export const MAIN_STORAGE = { seen: "oi-seen", seenValue: "1" } as const;

export const LENIS_OPTIONS = { lerp: 0.1, anchors: true } as const;

export const REVEAL_START = "top 90%";

export const PARALLAX = {
  /** Default travel in px when data-parallax is empty. */
  defaultDistance: 20,
  /** Hard clamp so a stray value cannot pull artwork out of its panel. */
  maxDistance: 48,
  scrub: 1,
  start: "top bottom",
  end: "bottom top",
} as const;

export const COUNT_UP = {
  start: "top 92%",
  durationSeconds: 1.2,
  ease: "expo.out",
  locale: "en-US",
  currency: "USD",
} as const;

export const MS_PER_SECOND = 1000;
