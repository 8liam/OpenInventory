import type { ItemView } from "../../lib/items/item.types.ts";
import type { SuggestionReason } from "../../lib/items/sell-suggestions.types.ts";
import type { ITEM_GRID } from "./item-grid.config.ts";

export type ItemGridSortId = (typeof ITEM_GRID.sorts)[number]["id"];

export type ItemGridProps = {
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly showLocation?: boolean;
  readonly selected?: ReadonlySet<string>;
  readonly onSelectionChange?: (next: ReadonlySet<string>) => void;
  readonly reasonsByKey?: ReadonlyMap<string, readonly SuggestionReason[]>;
};
