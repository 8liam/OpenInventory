import type { MovePlan, OrganiserRule } from "~/lib/organiser/organiser.types";

export type PlanPreviewProps = {
  readonly plan: MovePlan;
  readonly rules: readonly OrganiserRule[];
  /** Unit names by id, for describing rules. */
  readonly unitNames: ReadonlyMap<string, string>;
};
