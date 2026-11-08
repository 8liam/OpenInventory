import type { ItemView } from "~/lib/items/item.types";
import type { StorageUnit } from "~/lib/storage/storage.types";

export type OrganiserPanelProps = {
  /** Every item across the inventory and loaded units. */
  readonly items: readonly ItemView[];
  /** False while the item list is loading or failed, so an empty list is not read as "nothing to move". */
  readonly itemsReady: boolean;
  readonly units: readonly StorageUnit[];
  /** The account the plan acts on; undefined in the all-accounts view, where nothing can run. */
  readonly accountId: string | undefined;
  /** Names the account in the run confirmation; omitted when only one account is tracked. */
  readonly accountName?: string;
  /** A transfer is already running, so nothing can start. */
  readonly busy: boolean;
};
