import { LUCK_AXIS } from "./cases.config.ts";
import type { LuckStatus, OddsLuck } from "./odds-luck.types.ts";

const PERCENT = 100;
const AXIS_SPAN = LUCK_AXIS.halfWidth * 2;

/** Axis position, 0-100, for a deviation in standard deviations; clamped to the axis ends. */
export function axisPosition(deviation: number): number {
  const clamped = Math.max(-LUCK_AXIS.halfWidth, Math.min(LUCK_AXIS.halfWidth, deviation));
  return ((clamped + LUCK_AXIS.halfWidth) / AXIS_SPAN) * PERCENT;
}

function statusOf(deviation: number): LuckStatus {
  if (deviation < -LUCK_AXIS.normalRange) return "low";
  if (deviation > LUCK_AXIS.normalRange) return "high";
  return "normal";
}

/**
 * Compares a tier's pull count with what the odds predict, using the binomial spread so that rare
 * tiers and small histories are judged fairly. `oddsPercent` is the published chance, 0-100.
 */
export function compareToOdds(count: number, total: number, oddsPercent: number): OddsLuck {
  const chance = oddsPercent / PERCENT;
  const expected = total * chance;
  const spread = Math.sqrt(total * chance * (1 - chance));
  const deviation = spread === 0 ? 0 : (count - expected) / spread;
  return { expected, deviation, position: axisPosition(deviation), status: statusOf(deviation) };
}
