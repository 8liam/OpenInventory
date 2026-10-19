import type { TradeUpOutcome } from "~/lib/items/item.types";

export type TradeUpOutcomesProps = {
  readonly outcomes: readonly TradeUpOutcome[];
  readonly currency: string;
};
