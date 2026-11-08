import type { ITEM_SORTS } from "./item-sort.config.ts";

export type ItemSort = (typeof ITEM_SORTS)[number];
export type ItemSortId = ItemSort["id"];
