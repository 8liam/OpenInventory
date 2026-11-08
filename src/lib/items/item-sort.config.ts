/**
 * The item orderings offered by the card grid's sort menu and the compact table's. `field` is
 * the item table's column id for the same key, so both views agree on what each entry means.
 * Missing prices and floats always sort last.
 */
export const ITEM_SORTS = [
  { id: "price-desc", label: "Price: high to low", field: "price", direction: "desc" },
  { id: "price-asc", label: "Price: low to high", field: "price", direction: "asc" },
  { id: "float-asc", label: "Float: low to high", field: "float", direction: "asc" },
  { id: "float-desc", label: "Float: high to low", field: "float", direction: "desc" },
  {
    id: "highlights-desc",
    label: "Highlights: best first",
    field: "highlights",
    direction: "desc",
  },
  { id: "name-asc", label: "Name: A to Z", field: "item", direction: "asc" },
  { id: "name-desc", label: "Name: Z to A", field: "item", direction: "desc" },
] as const;

export const ITEM_SORT_LABEL = "Sort items";
