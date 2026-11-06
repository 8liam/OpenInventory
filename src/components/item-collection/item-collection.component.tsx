import { ItemGrid } from "~/components/item-grid/item-grid.component";
import { ItemTable } from "~/components/item-table/item-table.component";
import type { ItemCollectionProps } from "./item-collection.types";

/** Items as a table or a card grid; both take the same props, so pages only pick the view. */
export function ItemCollection({ view, ...props }: ItemCollectionProps) {
  return view === "grid" ? <ItemGrid {...props} /> : <ItemTable {...props} />;
}
