import type { Slice } from "~/lib/items/dashboard.types";

export type BarListProps = {
  readonly slices: readonly Slice[];
  readonly currency: string;
  readonly limit?: number;
  /** False for count-only data (no money): the count takes the value's place. */
  readonly showValue?: boolean;
  /** The highlighted row (a hovered donut slice); the others dim. */
  readonly activeLabel?: string;
  /** Hovering or focusing a row reports its label; makes rows focusable. */
  readonly onActiveChange?: (label: string | undefined) => void;
};

export type BarListSkeletonProps = { readonly rows: number };
