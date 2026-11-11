import type { ItemView, TradeUpOddsResponse } from "~/lib/items/item.types";
export type TradeUpSummaryProps = {
  readonly result: Extract<TradeUpOddsResponse, { ok: true }>;
  readonly inputs: readonly ItemView[];
};
