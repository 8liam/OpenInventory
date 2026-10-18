import { INVENTORY_LOCATION_ID, type ItemView } from "../../src/lib/items/item.types.ts";
import type { PriceBook } from "../prices/prices.ts";
import type { GcItem, StorageGateway } from "../steam/steam.types.ts";
import type { Catalog, SkinFacts } from "./catalog.types.ts";

export const INVENTORY_LOCATION_NAME = "Inventory";

export type CollectedItem = { readonly view: ItemView; readonly skin: SkinFacts | null };

/** Every item the account holds (loose + loaded units), decoded and priced. */
export function collectItems(
  gateway: StorageGateway,
  catalog: Catalog,
  book: PriceBook,
): CollectedItem[] {
  const priceOf = (hash: string | null): number | null =>
    hash ? (book.byName.get(hash)?.price ?? null) : null;

  const toCollected = (raw: GcItem, locationId: string, locationName: string): CollectedItem => {
    const { view, skin } = catalog.describe(raw);
    return {
      skin,
      view: {
        ...view,
        price: priceOf(view.marketHashName),
        locationId,
        locationName,
      },
    };
  };

  const collected = gateway
    .getInventory()
    .map((raw) => toCollected(raw, INVENTORY_LOCATION_ID, INVENTORY_LOCATION_NAME));
  for (const unit of gateway.getUnits()) {
    for (const raw of unit.items) collected.push(toCollected(raw, unit.id, unit.name));
  }
  return collected;
}
