import type { Holding } from "~/lib/items/dashboard.types";

export type HoldingsTableProps = {
  readonly holdings: readonly Holding[];
  readonly currency: string;
};
