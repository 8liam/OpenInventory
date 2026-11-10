import { itemRowKey } from "./item-key.ts";
import type { ItemView } from "./item.types.ts";

/** Search the item itself, its attachments, its current location, your note and (when given) the account's name or label. */
export function matchesItem(item: ItemView, query: string, accountText?: string): boolean {
  const term = query.trim().toLocaleLowerCase();
  if (!term) return true;
  // Dashboard float links pass a row key, which must land on exactly that item.
  if (itemRowKey(item) === term) return true;
  return [
    item.id,
    item.name,
    item.customName,
    item.marketHashName,
    item.locationName,
    item.note,
    accountText,
    ...item.stickers.map((sticker) => sticker.name),
    ...item.charms.map((charm) => charm.name),
  ].some((value) => value?.toLocaleLowerCase().includes(term));
}
