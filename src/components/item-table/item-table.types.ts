import type { ItemView } from "~/lib/items/item.types";

export type ItemTableProps = {
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly showLocation?: boolean;
  /** Account names by SteamID. When given, rows show which account holds each item. */
  readonly accountNames?: ReadonlyMap<string, string>;
  /** Enables row selection; keys are `rowKey(item)`. */
  readonly selected?: ReadonlySet<string>;
  readonly onSelectionChange?: (next: ReadonlySet<string>) => void;
};

export type ItemTableSkeletonProps = {
  readonly showLocation?: boolean;
  /** Reserves the Account column of the all-accounts view. */
  readonly showAccount?: boolean;
  /** Reserves the checkbox column so the real table does not shift sideways. */
  readonly selectable?: boolean;
};
