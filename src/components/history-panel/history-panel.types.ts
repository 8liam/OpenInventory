import type { HistoryPoint } from "~/lib/items/dashboard.types";
import type { HISTORY_PANEL } from "./history-panel.config";

export type RangeKey = (typeof HISTORY_PANEL.ranges)[number]["key"];
export type SeriesKey = (typeof HISTORY_PANEL.series)[number]["key"];

export type HistoryPanelProps = {
  readonly history: readonly HistoryPoint[];
  readonly currency: string;
};
