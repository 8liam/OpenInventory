import type { TradeUpStatTrakFilter } from "~/lib/items/item.types";

export type TradeUpFinderControlsProps = {
  readonly statTrak: TradeUpStatTrakFilter;
  readonly onStatTrakChange: (filter: TradeUpStatTrakFilter) => void;
  readonly includeStorage: boolean;
  readonly onIncludeStorageChange: (include: boolean) => void;
};
