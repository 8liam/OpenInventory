import type { TradeUpFinderResponse } from "~/lib/items/item.types";
import type { RemoteData } from "~/lib/storage/storage.types";

export type TradeUpFinderResultsProps = {
  readonly finder: RemoteData<TradeUpFinderResponse>;
};
