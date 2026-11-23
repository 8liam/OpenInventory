import type { ItemView } from "./item.types.ts";

export type InspectableItem = Pick<ItemView, "wear" | "paintSeed" | "stickers" | "charms">;

/** True when the item has a float, a paint seed, stickers or charms: something the card can show. */
export function canInspect(item: InspectableItem): boolean {
  return (
    item.wear !== null ||
    (item.paintSeed !== null && item.paintSeed !== undefined) ||
    item.stickers.length > 0 ||
    item.charms.length > 0
  );
}
