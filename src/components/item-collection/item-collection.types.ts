import type { ItemViewMode } from "~/lib/items/view-mode.types";
import type { ItemTableProps } from "~/components/item-table/item-table.types";

export type ItemCollectionProps = ItemTableProps & {
  readonly view: ItemViewMode;
};
