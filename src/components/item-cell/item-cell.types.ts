import type { AccountDisplayName } from "~/lib/accounts/accounts.types";
import type { ItemView } from "~/lib/items/item.types";

export type ItemCellProps = {
  readonly item: ItemView;
  /** The holding account, as a line under the name; for narrow rows, where there is no Account column. */
  readonly account?: AccountDisplayName;
};
