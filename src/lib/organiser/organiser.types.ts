import * as z from "zod/mini";
import type { ItemView } from "../items/item.types.ts";
import {
  CONDITION_KINDS,
  ORGANISER_LIMITS,
  PROBLEM_KIND,
  PROBLEM_SEVERITY,
} from "./organiser.config.ts";

const idSchema = z.string().check(z.minLength(1), z.maxLength(ORGANISER_LIMITS.maxValueLength));

export const conditionSchema = z.object({
  kind: z.enum(CONDITION_KINDS),
  value: z.string().check(z.trim(), z.minLength(1), z.maxLength(ORGANISER_LIMITS.maxValueLength)),
});
export type RuleCondition = z.infer<typeof conditionSchema>;

/** Every condition must match (AND). The first rule that matches an item decides where it goes. */
export const ruleSchema = z.object({
  id: idSchema,
  targetUnitId: idSchema,
  conditions: z
    .array(conditionSchema)
    .check(z.minLength(1), z.maxLength(ORGANISER_LIMITS.maxConditionsPerRule)),
});
export type OrganiserRule = z.infer<typeof ruleSchema>;

export const rulesSchema = z.array(ruleSchema).check(z.maxLength(ORGANISER_LIMITS.maxRules));

/** What a plan needs to know about an item. */
export type PlannerItem = Pick<
  ItemView,
  | "id"
  | "name"
  | "marketHashName"
  | "customName"
  | "category"
  | "rarityName"
  | "collections"
  | "locationId"
>;

export type PlannerUnit = {
  readonly id: string;
  readonly name: string;
  /** Live count reported by the GC; the capacity maths starts from this. */
  readonly itemCount: number;
  readonly loaded: boolean;
};

export type PlanInput = {
  readonly items: readonly PlannerItem[];
  readonly units: readonly PlannerUnit[];
  readonly rules: readonly OrganiserRule[];
};

/** One GC-confirmed batch for the existing transfer machinery. */
export type PlanStep = {
  readonly from: string;
  readonly to: string;
  readonly fromName: string;
  readonly toName: string;
  readonly itemIds: readonly string[];
  /** Unit to unit: every item passes through the inventory. */
  readonly viaInventory: boolean;
};

export type PlanProblem =
  | {
      readonly kind: typeof PROBLEM_KIND.unitNotLoaded;
      readonly unitId: string;
      readonly unitName: string;
    }
  | { readonly kind: typeof PROBLEM_KIND.targetMissing; readonly ruleId: string }
  | {
      readonly kind: typeof PROBLEM_KIND.targetFull;
      readonly unitId: string;
      readonly unitName: string;
      /** Matching items left where they are because the unit has no room. */
      readonly unplaced: number;
    }
  | {
      readonly kind: typeof PROBLEM_KIND.swapBlocked;
      /** Items that could only move once units, all full, had swapped. */
      readonly unplaced: number;
    };

export type UnitChange = {
  readonly unitId: string;
  readonly name: string;
  readonly before: number;
  readonly after: number;
  readonly incoming: number;
  readonly outgoing: number;
};

export type RuleReport = {
  readonly ruleId: string;
  /** Items this rule claimed (first match wins). */
  readonly matched: number;
  readonly alreadyInPlace: number;
  readonly moving: number;
  readonly unplaced: number;
};

export type MovePlan = {
  readonly steps: readonly PlanStep[];
  readonly itemsToMove: number;
  /** Individual GC add/remove actions the plan will issue. */
  readonly gcActions: number;
  readonly unitChanges: readonly UnitChange[];
  readonly ruleReports: readonly RuleReport[];
  readonly problems: readonly PlanProblem[];
  /** True when an error-level problem stops the plan from running. */
  readonly blocked: boolean;
  /** True when there is something to move and no error-level problem. */
  readonly executable: boolean;
};

export type ProblemSeverity = (typeof PROBLEM_SEVERITY)[keyof typeof PROBLEM_SEVERITY];

/** Body of the plan-execution request; the server re-checks every step against live state. */
export const planRequestSchema = z.object({
  steps: z
    .array(
      z.object({
        from: idSchema,
        to: idSchema,
        itemIds: z.array(idSchema).check(z.minLength(1)),
      }),
    )
    .check(z.minLength(1), z.maxLength(ORGANISER_LIMITS.maxPlanSteps)),
});
export type PlanRequest = z.infer<typeof planRequestSchema>;
