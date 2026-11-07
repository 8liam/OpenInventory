import { PATTERN_TIERS } from "./pattern-tiers.config.ts";
import type {
  PatternGroup,
  PatternTierMatch,
  PatternTierSubject,
  PhaseEntry,
} from "./pattern-tiers.types.ts";

type IndexedGroup = {
  readonly group: PatternGroup;
  /** Seed to zero-based tier index. */
  readonly tierBySeed: ReadonlyMap<number, number>;
};

type FinishEntry = {
  readonly weapon: string;
  readonly finish: string;
  readonly groups: IndexedGroup[];
  readonly phases: Map<number, { readonly entry: PhaseEntry; readonly tierCount: number }>;
};

function finishKey(weapon: string, finish: string): string {
  return `${weapon}${PATTERN_TIERS.nameSeparator}${finish}`;
}

function buildIndex(): ReadonlyMap<string, FinishEntry> {
  const index = new Map<string, FinishEntry>();
  const entryFor = (weapon: string, finish: string): FinishEntry => {
    const key = finishKey(weapon, finish);
    const existing = index.get(key);
    if (existing) return existing;
    const created: FinishEntry = { weapon, finish, groups: [], phases: new Map() };
    index.set(key, created);
    return created;
  };
  for (const table of PATTERN_TIERS.tables) {
    const entry = entryFor(table.weapon, table.finish);
    for (const group of table.groups) {
      const tierBySeed = new Map<number, number>();
      group.tiers.forEach((tier, tierIndex) => {
        for (const seed of tier.seeds) tierBySeed.set(seed, tierIndex);
      });
      entry.groups.push({ group, tierBySeed });
    }
  }
  for (const table of PATTERN_TIERS.phaseTables) {
    const entry = entryFor(table.weapon, table.finish);
    for (const phase of table.phases) {
      entry.phases.set(phase.paintIndex, { entry: phase, tierCount: table.tierCount });
    }
  }
  return index;
}

const INDEX = buildIndex();

/** "★ StatTrak™ Karambit | Fade" becomes the weapon "Karambit" and the finish "Fade". */
export function parseSkinName(name: string): { weapon: string; finish: string } | null {
  let rest = name;
  let stripped = true;
  while (stripped) {
    stripped = false;
    for (const prefix of PATTERN_TIERS.namePrefixes) {
      if (rest.startsWith(prefix)) {
        rest = rest.slice(prefix.length);
        stripped = true;
      }
    }
  }
  const at = rest.indexOf(PATTERN_TIERS.nameSeparator);
  if (at < 0) return null;
  return {
    weapon: rest.slice(0, at),
    finish: rest.slice(at + PATTERN_TIERS.nameSeparator.length),
  };
}

/**
 * Maps a skin to its pattern tier for its exact weapon and finish, or null when its seed or
 * phase is not in the sourced tier lists. When several lists match, the best tier wins.
 */
export function resolvePatternTier(subject: PatternTierSubject): PatternTierMatch | null {
  const parsed = parseSkinName(subject.name);
  if (parsed === null) return null;
  const entry = INDEX.get(finishKey(parsed.weapon, parsed.finish));
  if (entry === undefined) return null;
  const { paintSeed, paintIndex } = subject;
  const candidates: PatternTierMatch[] = [];

  for (const { group, tierBySeed } of entry.groups) {
    if (paintSeed === null || paintSeed === undefined) break;
    if (group.paintIndexes && (paintIndex == null || !group.paintIndexes.includes(paintIndex))) {
      continue;
    }
    const tierIndex = tierBySeed.get(paintSeed);
    if (tierIndex === undefined) continue;
    candidates.push({
      weapon: entry.weapon,
      finish: entry.finish,
      group: group.label,
      label: group.tiers[tierIndex]?.label ?? group.label,
      tier: tierIndex + 1,
      tierCount: group.tiers.length,
      seed: paintSeed,
    });
  }

  const phase = paintIndex == null ? undefined : entry.phases.get(paintIndex);
  if (phase) {
    candidates.push({
      weapon: entry.weapon,
      finish: entry.finish,
      group: phase.entry.label,
      label: phase.entry.label,
      tier: phase.entry.tier,
      tierCount: phase.tierCount,
      seed: null,
    });
  }
  return candidates.reduce<PatternTierMatch | null>(
    (best, candidate) => (best === null || candidate.tier < best.tier ? candidate : best),
    null,
  );
}
