import type {
  DataTableSortOption,
  FittableColumn,
  SortState,
} from "~/components/data-table/data-table.types";
import { ITEM_SORT_LABEL, ITEM_SORTS } from "~/lib/items/item-sort.config";
import { ITEM_INSPECT } from "~/components/item-inspect/item-inspect.config";

export const ITEM_TABLE = {
  /**
   * Narrow rows are taller: the item name may wrap to two lines above the location / float line
   * and the highlight button, and `narrowWithAccount` adds the owning account's line in the
   * all-accounts view.
   */
  rowHeight: { wide: 64, narrow: 104, narrowWithAccount: 120 },
  /** Between the location and the float in a narrow row's detail line. */
  detailSeparator: " · ",
  /**
   * Grid tracks, shared by the table and its loading skeleton. Minimums keep prices and floats
   * whole; when the table can't fit them all, Type hides first, then Location, then Account.
   * Compact rows keep the item, price and inspect action, with the other details under the name.
   */
  columns: {
    item: { wide: { width: "4fr", minWidth: 208 }, narrow: { width: "minmax(0, 1fr)" } },
    account: { width: "1.3fr", minWidth: 112, hidePriority: 3 },
    location: { width: "1.6fr", minWidth: 96, hidePriority: 2 },
    type: { width: "1.2fr", minWidth: 80, hidePriority: 1 },
    float: { width: "0.9fr", minWidth: 64 },
    highlights: { width: "0.7fr", minWidth: 76 },
    price: { wide: { width: "0.9fr", minWidth: 96 }, narrow: { width: "92px" } },
  } satisfies Record<string, FittableColumn | { wide: FittableColumn; narrow: FittableColumn }>,
  inspectColumn: {
    id: "inspect",
    header: ITEM_INSPECT.buttonLabel,
    hideHeader: true,
    align: "right",
    width: "24px",
    minWidth: 24,
  },
  inspectClass: "flex justify-end",
  /** The compact table's sort menu, standing in for the Float and Highlights headers. */
  sortOptions: ITEM_SORTS.map(({ id, label, triggerLabel, field, direction }) => ({
    id,
    label,
    triggerLabel,
    columnId: field,
    direction,
  })) satisfies readonly DataTableSortOption[],
  sortLabel: ITEM_SORT_LABEL,
  charmsValueClass: "block text-xs font-normal text-muted-foreground",
  initialSort: { columnId: "price", direction: "desc" } satisfies SortState,
  /** Enough rows to fill a tall screen; the rest are clipped. */
  skeletonRows: 16,
} as const;
