import type { Slice } from "~/lib/items/dashboard.types";

export type BarListProps = {
  readonly slices: readonly Slice[];
  readonly currency: string;
  readonly limit?: number;
  /** False for count-only data (no money): the count takes the value's place. */
  readonly showValue?: boolean;
};

export type BarListSkeletonProps = { readonly rows: number };
