import type { Slice } from "~/lib/items/dashboard.types";

export type DonutChartProps = {
  /** Every slice needs a colour; the parent decides the palette. */
  readonly slices: readonly (Slice & { readonly color: string })[];
  readonly currency: string;
  readonly totalLabel: string;
  /** Formats the centre value; defaults to money in `currency`. */
  readonly formatValue?: (value: number) => string;
  /** A slice highlighted from outside (a hovered legend row); the chart's own hover wins. */
  readonly activeLabel?: string;
  /** Reports the slice under the pointer, or undefined when it leaves. */
  readonly onActiveChange?: (label: string | undefined) => void;
};
