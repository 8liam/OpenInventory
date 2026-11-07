import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { EXPORT_CSV } from "~/lib/items/export-csv.config";
import { historyToCsv, historyToJson } from "~/lib/items/export-csv";
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

  function download(format: "csv" | "json"): void {
    const content = format === "csv" ? historyToCsv(history, currency) : historyToJson(history, currency);
    const url = URL.createObjectURL(new Blob([content], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `openinventory-value-history-${new Date().toISOString().slice(0, EXPORT_CSV.dateLength)}.${format}`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

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
        <div className="flex gap-1.5">
          <Button small onClick={() => download("csv")}><Download size={12} /> CSV</Button>
          <Button small onClick={() => download("json")}><Download size={12} /> JSON</Button>
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
