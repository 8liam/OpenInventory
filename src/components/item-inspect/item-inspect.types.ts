import type { ItemView } from "~/lib/items/item.types";

export type ItemInspectButtonProps = {
  readonly item: ItemView;
  /** Currency for prices on the card; they are left out without it. */
  readonly currency?: string;
  /** Positions the button inside its card or row. */
  readonly className?: string;
};
