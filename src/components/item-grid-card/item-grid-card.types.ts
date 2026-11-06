import type { KeyboardEvent } from "react";
import type { ItemView } from "~/lib/items/item.types";

export type ItemGridCardProps = {
  readonly item: ItemView;
  readonly currency: string;
  readonly showLocation: boolean;
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
