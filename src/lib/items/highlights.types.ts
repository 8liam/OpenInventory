export type HighlightKind = "float" | "pattern" | "craft";

export type HighlightReason = {
  readonly kind: HighlightKind;
  readonly label: string;
};

export type HighlightTier = "exceptional";

export type ItemHighlights = {
  /** Internal 0–100 ranking weight from float, pattern and craft signals. Never shown to users. */
  readonly score: number;
  readonly reasons: readonly HighlightReason[];
  /** Set only for truly exceptional items. */
  readonly tier: HighlightTier | null;
  /** Approximate USD premium from configured sticker/charm references, or null without a match. */
  readonly estimatedPremiumUsd: number | null;
};
