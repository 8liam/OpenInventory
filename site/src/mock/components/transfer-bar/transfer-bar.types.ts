import type { ItemView } from "~/lib/items/item.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type TransferBarProps = {
  /** The currently selected items (may span locations, which disables moving). */
  readonly selected: readonly ItemView[];
  readonly units: readonly StorageUnit[];
  readonly busy: boolean;
  readonly onClear: () => void;
};
