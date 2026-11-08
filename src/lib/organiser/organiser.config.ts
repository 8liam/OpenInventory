export const CONDITION_KIND = {
  category: "category",
  rarity: "rarity",
  collection: "collection",
  name: "name",
} as const;

export const CONDITION_KINDS = [
  CONDITION_KIND.category,
  CONDITION_KIND.rarity,
  CONDITION_KIND.collection,
  CONDITION_KIND.name,
] as const;

export const ORGANISER_LIMITS = {
  maxRules: 50,
  maxConditionsPerRule: 4,
  maxValueLength: 100,
  /** Steps in one plan request; a plan never legitimately needs more than every pair, chunked. */
  maxPlanSteps: 500,
} as const;

/** Rules are per account (unit ids only mean something within one): `openinventory:organiser-rules:<steamId>`. */
export const ORGANISER_STORAGE_KEY = "openinventory:organiser-rules";
export const ORGANISER_STORAGE_SEPARATOR = ":";

export const PROBLEM_KIND = {
  unitNotLoaded: "unit-not-loaded",
  targetMissing: "target-missing",
  targetFull: "target-full",
  swapBlocked: "swap-blocked",
} as const;

export const PROBLEM_SEVERITY = {
  /** The plan can't be trusted or run until the user fixes it. */
  error: "error",
  /** Part of the plan can't be done; the rest can still run. */
  warning: "warning",
} as const;

/** Errors block execution; warnings are shown in the preview and the rest still runs. */
export const SEVERITY_BY_PROBLEM = {
  [PROBLEM_KIND.unitNotLoaded]: PROBLEM_SEVERITY.error,
  [PROBLEM_KIND.targetMissing]: PROBLEM_SEVERITY.error,
  [PROBLEM_KIND.targetFull]: PROBLEM_SEVERITY.warning,
  [PROBLEM_KIND.swapBlocked]: PROBLEM_SEVERITY.warning,
} as const;

/** One unit-to-unit item is two GC actions (out to the inventory, then into the unit). */
export const GC_ACTIONS_PER_MOVE = { direct: 1, viaInventory: 2 } as const;
