import type { HistoryPoint } from "~/lib/items/dashboard.types";

export type ValueChartProps = {
  readonly points: readonly HistoryPoint[];
  readonly currency: string;
};
