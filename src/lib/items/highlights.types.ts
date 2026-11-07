import type { PatternTierMatch } from "./patterns/pattern-tiers.types.ts";

export type HighlightKind = "float" | "pattern" | "craft";

export type HighlightReason = {
  readonly kind: HighlightKind;
  readonly label: string;
};

export type ItemHighlights = {
  readonly reasons: readonly HighlightReason[];
  /** Set when the skin's seed or phase is in a sourced tier list; T1 is the most valuable. */
  readonly tier: PatternTierMatch | null;
};
