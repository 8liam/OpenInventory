import type { ItemView } from "~/lib/items/item.types";
import type { SuggestionReason } from "~/lib/items/sell-suggestions.types";

export type ItemCellProps = {
  readonly item: ItemView;
  readonly currency: string;
  readonly reasons?: readonly SuggestionReason[];
};
