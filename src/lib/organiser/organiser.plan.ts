import { INVENTORY_LOCATION_ID } from "../items/item.types.ts";
import { STORAGE_LIMITS } from "../storage/storage.config.ts";
import {
  CONDITION_KIND,
  GC_ACTIONS_PER_MOVE,
  ORGANISER_LIMITS,
  PROBLEM_KIND,
  SEVERITY_BY_PROBLEM,
  PROBLEM_SEVERITY,
} from "./organiser.config.ts";
import type {
  MovePlan,
  OrganiserRule,
  PlanInput,
  PlannerItem,
  PlanProblem,
  PlanStep,
  RuleCondition,
  RuleReport,
  UnitChange,
} from "./organiser.types.ts";

const normalise = (value: string): string => value.trim().toLocaleLowerCase();

export function matchesCondition(item: PlannerItem, condition: RuleCondition): boolean {
  const wanted = normalise(condition.value);
  switch (condition.kind) {
    case CONDITION_KIND.category:
      return normalise(item.category) === wanted;
    case CONDITION_KIND.rarity:
      return item.rarityName !== null && normalise(item.rarityName) === wanted;
    case CONDITION_KIND.collection:
      return item.collections.some((collection) => normalise(collection) === wanted);
    case CONDITION_KIND.name:
      return [item.name, item.marketHashName, item.customName].some((text) =>
        text?.toLocaleLowerCase().includes(wanted),
      );
  }
}

export function matchesRule(item: PlannerItem, rule: OrganiserRule): boolean {
  return rule.conditions.every((condition) => matchesCondition(item, condition));
}

/** An item a rule wants somewhere else; `priority` orders who wins scarce room. */
type Candidate = {
  readonly item: PlannerItem;
  readonly ruleIndex: number;
  readonly order: number;
  readonly to: string;
};

const pairKey = (from: string, to: string): string => `${from}\u0000${to}`;

/** Highest priority first: earlier rule, then earlier in the item list. */
const byPriority = (a: Candidate, b: Candidate): number =>
  a.ruleIndex - b.ruleIndex || a.order - b.order;

/**
 * Computes what a set of rules would move, without touching anything.
 *
 * The first matching rule decides an item's destination; items already there stay
 * out of the plan. Capacity is checked against the same rule the server applies
 * (a unit never holds more than `unitCapacity`), counting room freed by items
 * that leave. Whatever doesn't fit stays put and is reported. Steps are ordered
 * so each one fits at the moment it runs, inventory pulls first (they free
 * nothing but never need room), and unit-to-unit moves are marked as passing
 * through the inventory.
 */
export function computePlan(input: PlanInput): MovePlan {
  const capacity = STORAGE_LIMITS.unitCapacity;
  const units = new Map(input.units.map((unit) => [unit.id, unit]));
  const problems: PlanProblem[] = [];

  for (const unit of input.units) {
    if (!unit.loaded)
      problems.push({ kind: PROBLEM_KIND.unitNotLoaded, unitId: unit.id, unitName: unit.name });
  }

  const usable: { readonly rule: OrganiserRule; readonly index: number }[] = [];
  input.rules.forEach((rule, index) => {
    if (units.has(rule.targetUnitId)) usable.push({ rule, index });
    else problems.push({ kind: PROBLEM_KIND.targetMissing, ruleId: rule.id });
  });

  const reports = new Map<string, { matched: number; inPlace: number; unplaced: number }>(
    input.rules.map((rule) => [rule.id, { matched: 0, inPlace: 0, unplaced: 0 }]),
  );
  const report = (ruleId: string) => {
    const entry = reports.get(ruleId);
    if (!entry) throw new Error(`Unknown rule ${ruleId}`);
    return entry;
  };

  let candidates: Candidate[] = [];
  input.items.forEach((item, order) => {
    const hit = usable.find(({ rule }) => matchesRule(item, rule));
    if (!hit) return;
    const entry = report(hit.rule.id);
    entry.matched += 1;
    if (hit.rule.targetUnitId === item.locationId) entry.inPlace += 1;
    else candidates.push({ item, ruleIndex: hit.index, order, to: hit.rule.targetUnitId });
  });

  // Admission: drop the lowest-priority incoming items of any unit that would overflow,
  // until stable. A dropped item stays where it is, which can overflow *its* unit in turn.
  const rejectedBy = new Map<string, number>();
  const rejectedRules = new Map<string, number>();
  for (;;) {
    const delta = new Map<string, number>();
    for (const { item, to } of candidates) {
      delta.set(to, (delta.get(to) ?? 0) + 1);
      delta.set(item.locationId, (delta.get(item.locationId) ?? 0) - 1);
    }
    let rejected: Candidate | undefined;
    for (const unit of input.units) {
      const overflow = unit.itemCount + (delta.get(unit.id) ?? 0) - capacity;
      if (overflow <= 0) continue;
      const incoming = candidates.filter((c) => c.to === unit.id).sort(byPriority);
      rejected = incoming[incoming.length - 1];
      if (rejected) break;
    }
    if (!rejected) break;
    const dropped = rejected;
    candidates = candidates.filter((c) => c !== dropped);
    rejectedBy.set(dropped.to, (rejectedBy.get(dropped.to) ?? 0) + 1);
    const ruleId = input.rules[dropped.ruleIndex]?.id;
    if (ruleId) rejectedRules.set(ruleId, (rejectedRules.get(ruleId) ?? 0) + 1);
  }
  for (const [unitId, unplaced] of rejectedBy) {
    const unit = units.get(unitId);
    if (unit)
      problems.push({ kind: PROBLEM_KIND.targetFull, unitId, unitName: unit.name, unplaced });
  }

  // Scheduling: simulate counts and emit steps that fit at the moment they run.
  const queues = new Map<string, Candidate[]>();
  for (const candidate of [...candidates].sort(byPriority)) {
    const key = pairKey(candidate.item.locationId, candidate.to);
    queues.set(key, [...(queues.get(key) ?? []), candidate]);
  }
  const counts = new Map(input.units.map((unit) => [unit.id, unit.itemCount]));
  const nameOf = (id: string): string =>
    id === INVENTORY_LOCATION_ID ? "Inventory" : (units.get(id)?.name ?? id);
  const steps: PlanStep[] = [];
  const outgoing = new Map<string, number>();
  const incomingCount = new Map<string, number>();
  const bump = (map: Map<string, number>, key: string, by: number) =>
    map.set(key, (map.get(key) ?? 0) + by);
  const moved = new Map<string, number>();

  for (;;) {
    const pending = [...queues.values()].filter((queue) => queue.length > 0);
    const room = (queue: Candidate[]): number => {
      const first = queue[0];
      return first ? capacity - (counts.get(first.to) ?? 0) : 0;
    };
    if (steps.length >= ORGANISER_LIMITS.maxPlanSteps) break;
    const runnable = pending.filter((queue) => room(queue) > 0);
    if (runnable.length === 0) break;
    const fits = (queue: Candidate[]) => room(queue) >= queue.length;
    const fromInventory = (queue: Candidate[]) =>
      queue[0]?.item.locationId === INVENTORY_LOCATION_ID;
    const next =
      runnable.find((queue) => fits(queue) && fromInventory(queue)) ??
      runnable.find(fits) ??
      runnable[0];
    if (!next) break;
    const size = Math.min(next.length, room(next), STORAGE_LIMITS.maxItemsPerTransfer);
    const chunk = next.splice(0, size);
    const head = chunk[0];
    if (!head) break;
    const from = head.item.locationId;
    const { to } = head;
    steps.push({
      from,
      to,
      fromName: nameOf(from),
      toName: nameOf(to),
      itemIds: chunk.map((c) => c.item.id),
      viaInventory: from !== INVENTORY_LOCATION_ID,
    });
    bump(counts, to, size);
    bump(incomingCount, to, size);
    if (from !== INVENTORY_LOCATION_ID) {
      bump(counts, from, -size);
      bump(outgoing, from, size);
    }
    for (const c of chunk) bump(moved, input.rules[c.ruleIndex]?.id ?? "", 1);
  }

  const stuck = [...queues.values()].reduce((sum, queue) => sum + queue.length, 0);
  for (const queue of queues.values()) {
    for (const c of queue) {
      const ruleId = input.rules[c.ruleIndex]?.id;
      if (ruleId) rejectedRules.set(ruleId, (rejectedRules.get(ruleId) ?? 0) + 1);
    }
  }
  if (stuck > 0) problems.push({ kind: PROBLEM_KIND.swapBlocked, unplaced: stuck });

  const ruleReports: RuleReport[] = input.rules.map((rule) => {
    const entry = report(rule.id);
    return {
      ruleId: rule.id,
      matched: entry.matched,
      alreadyInPlace: entry.inPlace,
      moving: moved.get(rule.id) ?? 0,
      unplaced: rejectedRules.get(rule.id) ?? 0,
    };
  });

  const unitChanges: UnitChange[] = input.units
    .map((unit) => ({
      unitId: unit.id,
      name: unit.name,
      before: unit.itemCount,
      after: counts.get(unit.id) ?? unit.itemCount,
      incoming: incomingCount.get(unit.id) ?? 0,
      outgoing: outgoing.get(unit.id) ?? 0,
    }))
    .filter((change) => change.incoming > 0 || change.outgoing > 0);

  const itemsToMove = steps.reduce((sum, step) => sum + step.itemIds.length, 0);
  const gcActions = steps.reduce(
    (sum, step) =>
      sum +
      step.itemIds.length *
        (step.viaInventory ? GC_ACTIONS_PER_MOVE.viaInventory : GC_ACTIONS_PER_MOVE.direct),
    0,
  );
  const blocked = problems.some(
    (problem) => SEVERITY_BY_PROBLEM[problem.kind] === PROBLEM_SEVERITY.error,
  );
  return {
    steps,
    itemsToMove,
    gcActions,
    unitChanges,
    ruleReports,
    problems,
    executable: itemsToMove > 0 && !blocked,
  };
}
