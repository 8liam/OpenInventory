import { ITEM_LABEL } from "./item-label.config";

/** "AK-47 | Redline" becomes ["AK-47", "Redline"]; names without a skin come back as [null, name]. */
export function splitItemName(name: string): [string | null, string] {
  const { nameSeparator } = ITEM_LABEL;
  const at = name.indexOf(nameSeparator);
  return at < 0 ? [null, name] : [name.slice(0, at), name.slice(at + nameSeparator.length)];
}
