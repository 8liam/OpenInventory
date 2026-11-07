import type { ItemView } from "~/lib/items/item.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type TransferBarProps = {
  /** The currently selected items (may span locations, which disables moving). */
  readonly selected: readonly ItemView[];
  /** Units of the account the selected items belong to. */
  readonly units: readonly StorageUnit[];
  /** Shown beside the count so it is clear which account the move acts on (omit for a single account). */
  readonly accountName?: string;
  readonly busy: boolean;
  readonly onClear: () => void;
};
