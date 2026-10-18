import type { Slice } from "~/lib/items/dashboard.types";

export type BarListProps = {
  readonly slices: readonly Slice[];
  readonly currency: string;
  readonly limit?: number;
};
