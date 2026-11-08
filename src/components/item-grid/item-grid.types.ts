import type { AccountDisplayName } from "../../lib/accounts/accounts.types.ts";
import type { ItemView } from "../../lib/items/item.types.ts";
import type { ITEM_GRID } from "./item-grid.config.ts";

export type ItemGridSortId = (typeof ITEM_GRID.sorts)[number]["id"];

export type ItemGridProps = {
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly showLocation?: boolean;
  /** Account names by SteamID. When given, cards say which account holds the item. */
  readonly accountNames?: ReadonlyMap<string, AccountDisplayName>;
  readonly selected?: ReadonlySet<string>;
  readonly onSelectionChange?: (next: ReadonlySet<string>) => void;
};
