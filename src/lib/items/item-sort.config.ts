/**
 * The item orderings offered by the card grid's sort menu and the compact table's. `field` is
 * the item table's column id for the same key, so both views agree on what each entry means.
 * Missing prices and floats always sort last.
 */
export const ITEM_SORTS = [
  {
    id: "price-desc",
    label: "Price: high to low",
    triggerLabel: "Price ↓",
    field: "price",
    direction: "desc",
  },
  {
    id: "price-asc",
    label: "Price: low to high",
    triggerLabel: "Price ↑",
    field: "price",
    direction: "asc",
  },
  {
    id: "float-asc",
    label: "Float: low to high",
    triggerLabel: "Float ↑",
    field: "float",
    direction: "asc",
  },
  {
    id: "float-desc",
    label: "Float: high to low",
    triggerLabel: "Float ↓",
    field: "float",
    direction: "desc",
  },
  {
    id: "highlights-desc",
    label: "Highlights: best first",
    triggerLabel: "Best",
    field: "highlights",
    direction: "desc",
  },
  { id: "name-asc", label: "Name: A to Z", triggerLabel: "A–Z", field: "item", direction: "asc" },
  { id: "name-desc", label: "Name: Z to A", triggerLabel: "Z–A", field: "item", direction: "desc" },
] as const;

/** Kept beside the table so the settings schema can validate a stored sort; a test keeps them in step. */
export const ITEM_SORT_IDS = [
  "price-desc",
  "price-asc",
  "float-asc",
  "float-desc",
  "highlights-desc",
  "name-asc",
  "name-desc",
] as const;
export const DEFAULT_ITEM_SORT = "price-desc";

export const ITEM_SORT_LABEL = "Sort items";
