export const FLASH_BURST = {
  viewBox: "0 0 150 150",
  center: 75,
  rayCount: 12,
  rayInner: 22,
  rayLong: 60,
  rayShort: 44,
  rayOpacity: 0.85,
  rayWidth: { long: 4, short: 3 },
  coreRadius: 40,
  /** Gradient stops of the glow: white heart, accent, primary, fading out. */
  stops: [
    { offset: 0, source: "white", opacity: 1 },
    { offset: 0.35, source: "accent", opacity: 0.85 },
    { offset: 0.7, source: "primary", opacity: 0.35 },
    { offset: 1, source: "primary", opacity: 0 },
  ],
  white: "#fff",
  /** Animated by the `flash-core` and `flash-rays` rules in index.css (off under reduced motion). */
  coreClass: "flash-core",
  raysClass: "flash-rays",
} as const;
