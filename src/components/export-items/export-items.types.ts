import type { ItemView } from "~/lib/items/item.types";

export type ExportItemsProps = {
  readonly items: readonly ItemView[];
  readonly currency: string;
};
