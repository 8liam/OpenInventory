import type { FittableColumn } from "~/components/data-table/data-table.types";

export const ITEM_TABLE = {
  /**
   * Narrow rows are taller: the item name may wrap to two lines above the highlight button, and
   * `narrowWithAccount` adds the owning account's line in the all-accounts view.
   */
  rowHeight: { wide: 64, narrow: 80, narrowWithAccount: 96 },
  /**
   * The wide layout starts at the 960px Electron minimum: below it the columns that never hide
   * (item, float, highlights, price) don't fit beside the sidebar, so the compact rows take over.
   */
  wideQuery: "(min-width: 960px)",
  /**
   * Grid tracks, shared by the table and its loading skeleton. Minimums keep prices and floats
   * whole; when the table can't fit them all, Type hides first, then Location, then Account.
   * At 960px with every account in view they leave ~24px spare, room for a classic scrollbar.
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
  /** Enough rows to fill a tall screen; the rest are clipped. */
  skeletonRows: 16,
} as const;
