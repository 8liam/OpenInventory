import { PROBLEM_KIND } from "~/lib/organiser/organiser.config";
import type { PlanProblem } from "~/lib/organiser/organiser.types";

export const PLAN_PREVIEW = {
  heading: "Dry run",
  noRules: "Add a rule to see what would move.",
  nothingToMove: "Nothing to move: every matching item is already where its rule wants it.",
  summary: (items: number, steps: number, actions: number) =>
    `${items} ${items === 1 ? "item" : "items"} would move in ${steps} ${steps === 1 ? "step" : "steps"} (${actions} Game Coordinator ${actions === 1 ? "action" : "actions"}).`,
  inventoryNote:
    "Unit-to-unit moves pass through your inventory one item at a time, so keep at least one inventory slot free.",
  noChanges: "Nothing is changed until you confirm.",
  stepsHeading: "Moves",
  step: (count: number, from: string, to: string) =>
    `${count} ${count === 1 ? "item" : "items"}: ${from} → ${to}`,
  viaInventory: "via inventory",
  unitsHeading: "Storage units after",
  unitLine: (name: string, before: number, after: number, capacity: number) =>
    `${name}: ${before} → ${after} of ${capacity}`,
  rulesHeading: "Rules",
  ruleLine: (index: number, moving: number, inPlace: number, unplaced: number) =>
    `Rule ${index}: ${moving} to move, ${inPlace} already in place${unplaced > 0 ? `, ${unplaced} can't be placed` : ""}`,
  problemsHeading: "Problems",
  problem: (problem: PlanProblem, ruleLabel: (id: string) => string): string => {
    switch (problem.kind) {
      case PROBLEM_KIND.unitNotLoaded:
        return `${problem.unitName} hasn't finished loading, so its contents are unknown. Reload units and try again.`;
      case PROBLEM_KIND.targetMissing:
        return `${ruleLabel(problem.ruleId)} points at a storage unit that no longer exists. Remove or recreate it.`;
      case PROBLEM_KIND.targetFull:
        return `${problem.unitName} is full: ${problem.unplaced} matching ${problem.unplaced === 1 ? "item stays" : "items stay"} where ${problem.unplaced === 1 ? "it is" : "they are"}.`;
      case PROBLEM_KIND.swapBlocked:
        return `${problem.unplaced} ${problem.unplaced === 1 ? "item needs" : "items need"} full units to swap places, which can't be done. Free a slot first.`;
    }
  },
  errorClass: "text-destructive",
  warningClass: "text-amber-600 dark:text-amber-400",
} as const;
