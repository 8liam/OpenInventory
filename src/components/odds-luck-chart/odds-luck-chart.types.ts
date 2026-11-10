import type { CaseRarityStat } from "~/lib/cases/cases.types";

export type OddsLuckChartProps = {
  readonly rarities: readonly CaseRarityStat[];
  /** Openings with a recognised rarity; the sample the odds are applied to. */
  readonly total: number;
};

export type AxisLabel =
  | { readonly text: string; readonly placement: "start" }
  | { readonly text: string; readonly placement: "end" }
  | { readonly text: string; readonly placement: "at"; readonly percent: number };
