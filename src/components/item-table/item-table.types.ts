import type { ItemView } from "~/lib/items/item.types";
import type { SuggestionReason } from "~/lib/items/sell-suggestions.types";

export type ItemTableProps = {
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly showLocation?: boolean;
  /** Enables row selection; keys are `rowKey(item)`. */
  readonly selected?: ReadonlySet<string>;
  readonly onSelectionChange?: (next: ReadonlySet<string>) => void;
  /** Sell-it-now reasons per item, keyed by `itemRowKey`; absent until suggestions load. */
  readonly reasonsByKey?: ReadonlyMap<string, readonly SuggestionReason[]>;
};

export type ItemTableSkeletonProps = {
  readonly showLocation?: boolean;
  /** Reserves the checkbox column so the real table does not shift sideways. */
  readonly selectable?: boolean;
};
