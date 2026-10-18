import type { ItemView } from "~/lib/items/item.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type UnitCardProps = {
  readonly unit: StorageUnit;
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly selected: boolean;
  /** Value and preview are still being worked out; show placeholders, not a misleading $0. */
  readonly loading?: boolean;
  readonly onSelect: () => void;
  readonly onRename: (name: string) => Promise<void>;
};
