/** One tier of a pattern group: the paint seeds in it, with an optional label that overrides the group's. */
export type PatternTier = {
  readonly seeds: readonly number[];
  readonly label?: string;
};

/**
 * A family of patterns with its own tier numbering (for example "Blue gem" or "Double Web").
 * `tiers[0]` is T1, the most valuable; a tier may be empty when a source skips a number.
 */
export type PatternGroup = {
  readonly label: string;
  /** When set, the group only applies to these paint kits (Doppler and Gamma Doppler phases). */
  readonly paintIndexes?: readonly number[];
  readonly tiers: readonly PatternTier[];
};

/** Seed tiers for one weapon and finish: the same seed ranks differently on each weapon. */
export type PatternTable = {
  readonly weapon: string;
  readonly finish: string;
  readonly groups: readonly PatternGroup[];
};

/** A tiered Doppler or Gamma Doppler phase, identified by its paint kit id. */
export type PhaseEntry = {
  readonly paintIndex: number;
  readonly label: string;
  readonly tier: number;
};

export type PhaseTable = {
  readonly weapon: string;
  readonly finish: string;
  readonly tierCount: number;
  readonly phases: readonly PhaseEntry[];
};

/** The tier a skin earns, with enough context to explain it ("Tier 1 of 3 for AK-47 Case Hardened"). */
export type PatternTierMatch = {
  readonly weapon: string;
  readonly finish: string;
  /** The pattern family the tier belongs to, such as "Blue gem" or "Double Web". */
  readonly group: string;
  /** Short name for the pattern or phase, such as "Blue gem" or "Sapphire". */
  readonly label: string;
  readonly tier: number;
  readonly tierCount: number;
  /** The paint seed for seed patterns; null for phases. */
  readonly seed: number | null;
};

export type PatternTierSubject = {
  readonly name: string;
  readonly paintSeed?: number | null;
  readonly paintIndex?: number | null;
};
