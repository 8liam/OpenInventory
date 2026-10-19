import type { ItemView } from "~/lib/items/item.types";

export type TradeUpInputsProps = {
  readonly candidates: readonly ItemView[];
  readonly selectedIds: ReadonlySet<string>;
  readonly inputCount: number;
  readonly currency: string;
  readonly onToggle: (id: string) => void;
  readonly onAutoFill: () => void;
  readonly onClear: () => void;
};
