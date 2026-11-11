import type { TradeUpOutcome } from "~/lib/items/item.types";

export type TradeUpOutcomesProps = {
  readonly outcomes: readonly TradeUpOutcome[];
  readonly inputCost: number;
  readonly currency: string;
};
