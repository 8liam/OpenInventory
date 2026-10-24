import type { HistoryPoint } from "~/lib/items/dashboard.types";
import { HISTORY_PANEL } from "./history-panel.config";
import type { RangeKey } from "./history-panel.types";

/** Earliest timestamp included by a range, or null for everything. */
export function rangeStart(range: RangeKey, now: number): number | null {
  const { windowMs } = HISTORY_PANEL.ranges.find((r) => r.key === range) ?? { windowMs: null };
  if (windowMs === null) return null;
  if (windowMs === "ytd") return new Date(new Date(now).getFullYear(), 0, 1).getTime();
  return now - windowMs;
}

export function filterRange(
  history: readonly HistoryPoint[],
  range: RangeKey,
  now: number,
): readonly HistoryPoint[] {
  const start = rangeStart(range, now);
  return history.filter((pt) => start === null || pt.takenAt >= start);
}
