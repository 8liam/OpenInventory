/** Thresholds in USD; the analysis converts them to the viewer's currency with the book's rate. */
export const SELL_SUGGESTIONS = {
  /** Spike: Steam's 24h average is at least this multiple of its 30-day average. */
  spikeRatio: 1.25,
  /** Steady decline: the 24h average sits at least this share below the 90-day average. */
  declineShare: 0.15,
  /** Trend signals on items below this price are noise, so they are skipped. */
  minTrendPriceUsd: 1,
  /** Idle stack: at least this many tradable copies sitting in storage units... */
  idleMinCount: 10,
  /** ...each worth no more than this. */
  idleMaxUnitPriceUsd: 1,
} as const;
