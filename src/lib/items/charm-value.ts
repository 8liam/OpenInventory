import type { ItemView } from "./item.types.ts";

/**
 * Combined market value of the charms attached to a weapon, or null when none is priced.
 * A loose charm lists itself in `charms`, and its own price already covers it, so it is skipped.
 */
export function attachedCharmsValue(
  item: Pick<ItemView, "charms" | "marketHashName">,
): number | null {
  let total = 0;
  let priced = false;
  for (const charm of item.charms) {
    if (charm.price === null || charm.marketHashName === item.marketHashName) continue;
    total += charm.price;
    priced = true;
  }
  return priced ? total : null;
}
