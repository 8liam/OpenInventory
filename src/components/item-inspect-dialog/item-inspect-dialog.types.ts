import type { ItemView } from "~/lib/items/item.types";

export type ItemInspectDialogProps = {
  readonly item: ItemView;
  readonly currency?: string;
  readonly onClose: () => void;
};
