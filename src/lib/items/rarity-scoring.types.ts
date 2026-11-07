export type RarityBadge = {
  readonly kind: "float" | "pattern" | "attachments";
  readonly label: string;
};

export type ItemRarity = {
  /** A transparent 0–100 score from the configured float, pattern and attachment signals. */
  readonly score: number;
  readonly badges: readonly RarityBadge[];
  /** Approximate USD premium from configured attachment references, or null without a match. */
  readonly estimatedPremiumUsd: number | null;
};
