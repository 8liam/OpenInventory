import { useMemo, useState } from "react";
import { Pill } from "~/components/pill/pill.component";
import { ValueChart } from "~/components/value-chart/value-chart.component";
import { HISTORY_PANEL } from "./history-panel.config";
import { filterRange } from "./history-panel.utils";
import type { HistoryPanelProps, RangeKey, SeriesKey } from "./history-panel.types";

/** The history chart with its two filters: which series (total / inventory / storage) and how far back. */
export function HistoryPanel({ history, currency }: HistoryPanelProps) {
  const [range, setRange] = useState<RangeKey>(HISTORY_PANEL.defaultRange);
  const [series, setSeries] = useState<SeriesKey>(HISTORY_PANEL.defaultSeries);

  // The newest point is the live value, so it doubles as "now" and keeps render pure.
  const now = history[history.length - 1]?.takenAt ?? 0;
  const points = useMemo(
    () =>
      filterRange(history, range, now).map((pt) => ({
        takenAt: pt.takenAt,
        value: pt[series],
      })),
    [history, range, series, now],
  );
  const first = points[0]?.value ?? 0;
  const last = points[points.length - 1]?.value ?? 0;

  return (
    <div className="px-4 pb-3 pt-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1.5">
          {HISTORY_PANEL.series.map((s) => (
            <Pill key={s.key} active={series === s.key} onClick={() => setSeries(s.key)}>
              {s.label}
            </Pill>
          ))}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HISTORY_PANEL.ranges.map((r) => (
            <Pill
              key={r.key}
              active={range === r.key}
              disabled={filterRange(history, r.key, now).length < HISTORY_PANEL.minPoints}
              onClick={() => setRange(r.key)}
            >
              {r.label}
            </Pill>
          ))}
        </div>
      </div>
      {points.length >= HISTORY_PANEL.minPoints ? (
        <ValueChart points={points} currency={currency} tone={last >= first ? "up" : "down"} />
      ) : (
        <p className="py-16 text-center text-muted-foreground">{HISTORY_PANEL.copy.empty}</p>
      )}
    </div>
  );
}
