import type { TradeUpFinderResult, TradeUpFinderResponse } from "~/lib/items/item.types";
import type { RemoteData } from "~/lib/storage/storage.types";

export type TradeUpFinderResultsProps = {
  readonly onOpen: (contract: TradeUpFinderResult) => void;
  readonly finder: RemoteData<TradeUpFinderResponse>;
};
