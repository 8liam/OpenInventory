export type ChartPoint = { readonly takenAt: number; readonly value: number };

export type ValueChartProps = {
  readonly points: readonly ChartPoint[];
  readonly currency: string;
  /** Colours the line: green when the range ended higher than it began, red otherwise. */
  readonly tone: "up" | "down";
};
