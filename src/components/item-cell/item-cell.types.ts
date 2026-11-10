import type { ItemLabelNameFit } from "~/components/item-label/item-label.types";
import type { ItemView } from "~/lib/items/item.types";

export type ItemCellProps = {
  readonly item: ItemView;
  /** The holding account, as a line under the name; for narrow rows, where there is no Account column. */
  readonly account?: string;
  /** A muted line under the name, e.g. where the item is, its float and pattern; narrow rows put the pattern here, not on a line of its own. */
  readonly detail?: string;
  /** Narrow rows: chips don't fit, so the tier and a count open the full highlight list instead. */
  readonly compact?: boolean;
  /** How the name fits; fixed-height table rows pass what their height allows. */
  readonly nameFit?: ItemLabelNameFit;
};
