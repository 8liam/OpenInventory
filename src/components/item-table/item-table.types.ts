import type { ItemView } from "~/lib/items/item.types";

export type ItemTableProps = {
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly showLocation?: boolean;
  /** Enables row selection; keys are `rowKey(item)`. */
  readonly selected?: ReadonlySet<string>;
  readonly onSelectionChange?: (next: ReadonlySet<string>) => void;
};
