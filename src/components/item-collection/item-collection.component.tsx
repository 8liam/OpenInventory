import { ITEM_COLLECTION } from "./item-collection.config";
import type { ItemCollectionProps } from "./item-collection.types";

/** Items as a table or a card grid; both take the same props, so pages only pick the view. */
export function ItemCollection({ view, ...props }: ItemCollectionProps) {
  const View = ITEM_COLLECTION.views[view];
  return <View {...props} />;
}
