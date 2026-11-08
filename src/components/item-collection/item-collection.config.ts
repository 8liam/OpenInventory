import type { ComponentType } from "react";
import { ItemGrid } from "~/components/item-grid/item-grid.component";
import { ItemTable } from "~/components/item-table/item-table.component";
import type { ItemTableProps } from "~/components/item-table/item-table.types";
import type { ItemViewMode } from "~/lib/items/view-mode.types";

export const ITEM_COLLECTION = {
  /** The renderer for each view mode; a new mode won't compile until it has one. */
  views: { list: ItemTable, grid: ItemGrid } satisfies Record<
    ItemViewMode,
    ComponentType<ItemTableProps>
  >,
} as const;
