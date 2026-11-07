import type { ItemView } from "~/lib/items/item.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type OrganiserPanelProps = {
  /** Every item across the inventory and loaded units. */
  readonly items: readonly ItemView[];
  /** False while the item list is loading or failed, so an empty list is not read as "nothing to move". */
  readonly itemsReady: boolean;
  readonly units: readonly StorageUnit[];
  /** A transfer is already running, so nothing can start. */
  readonly busy: boolean;
};
