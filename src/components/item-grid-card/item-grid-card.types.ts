import type { KeyboardEvent } from "react";
import type { ItemView } from "../../lib/items/item.types.ts";

export type ItemGridCardProps = {
  readonly item: ItemView;
  readonly currency: string;
  readonly showLocation: boolean;
  /** The holding account, shown ahead of the location in the all-accounts view. */
  readonly accountName?: string;
  readonly index: number;
  /** Selection is on; the card toggles when activated. */
  readonly selectable: boolean;
  readonly checked: boolean;
  /** Show the checkbox even without hover, once something is selected. */
  readonly checkboxVisible: boolean;
  readonly tabIndex: 0 | -1;
  readonly onToggle: () => void;
  readonly onFocus: () => void;
  readonly onKeyDown: (event: KeyboardEvent<HTMLDivElement>) => void;
};

export type WearSplit = {
  readonly skin: string;
  /** The wear name taken off the end of the skin, or null when the name carried none. */
  readonly wear: string | null;
};
