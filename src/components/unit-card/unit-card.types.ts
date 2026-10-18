import type { ItemView } from "~/lib/items/item.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type UnitCardProps = {
  readonly unit: StorageUnit;
  readonly items: readonly ItemView[];
  readonly currency: string;
  readonly selected: boolean;
  readonly onSelect: () => void;
  readonly onRename: (name: string) => Promise<void>;
};
