import type { AccountDisplayName } from "~/lib/accounts/accounts.types";
import type { ItemView } from "~/lib/items/item.types";

export type ItemCellProps = {
  readonly item: ItemView;
  /** The holding account, as a line under the name; for narrow rows, where there is no Account column. */
  readonly account?: AccountDisplayName;
  /** Narrow rows: chips don't fit, so the tier and a count open the full highlight list instead. */
  readonly compact?: boolean;
};
