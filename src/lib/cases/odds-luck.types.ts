import type { LUCK_STATUSES } from "./cases.config.ts";

export type LuckStatus = (typeof LUCK_STATUSES)[number];

export type OddsLuck = {
  /** Pulls the published odds predict over this many openings. */
  readonly expected: number;
  /** Distance from the expected count in standard deviations; negative means fewer than expected. */
  readonly deviation: number;
  /** Position on the chart axis, 0 (far left) to 100 (far right), clamped. */
  readonly position: number;
  readonly status: LuckStatus;
};
