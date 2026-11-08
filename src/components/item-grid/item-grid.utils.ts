import type { ItemView } from "../../lib/items/item.types.ts";
import type { ItemGridSortId } from "./item-grid.types.ts";
import { highlightRank } from "../../lib/items/highlights.ts";

/** Ascending compare that always sends missing values (no price, no float) to the end. */
function compareNullsLast(a: number | null, b: number | null, direction: 1 | -1): number {
  if (a === null || b === null) return a === b ? 0 : a === null ? 1 : -1;
  return direction * (a - b);
}

/** Highlight rank ascending (T1 first), then price descending; ranks are computed once per item. */
function sortByHighlights(items: ItemView[]): ItemView[] {
  return items
    .map((item) => ({ item, rank: highlightRank(item) }))
    .sort((a, b) => a.rank - b.rank || compareNullsLast(a.item.price, b.item.price, -1))
    .map(({ item }) => item);
}

export function sortItems(items: readonly ItemView[], sort: ItemGridSortId): readonly ItemView[] {
  const sorted = [...items];
  switch (sort) {
    case "price-desc":
      return sorted.sort((a, b) => compareNullsLast(a.price, b.price, -1));
    case "price-asc":
      return sorted.sort((a, b) => compareNullsLast(a.price, b.price, 1));
    case "float-asc":
      return sorted.sort((a, b) => compareNullsLast(a.wear, b.wear, 1));
    case "float-desc":
      return sorted.sort((a, b) => compareNullsLast(a.wear, b.wear, -1));
    case "highlights-desc":
      return sortByHighlights(sorted);
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
  }
}

/** How many cards fit across `width` px, never fewer than one. */
export function columnsFor(width: number, minCard: number, gap: number, padding: number): number {
  return Math.max(1, Math.floor((width - padding * 2 + gap) / (minCard + gap)));
}
