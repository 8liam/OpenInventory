import type { ItemView } from "../../src/lib/items/item.types.ts";
import type { StorageUnit } from "../../src/lib/storage/storage.types.ts";
import { SHARE_TITLES } from "../../src/lib/shares/share.config.ts";
import type { ShareScope, SharedInventory, SharedItem } from "../../src/lib/shares/share.types.ts";

export type ShareSelection = {
  readonly title: string;
  readonly items: readonly ItemView[];
};

/**
 * The items a scope covers right now, or undefined when it names a unit that no
 * longer exists. Item ids that have left the inventory simply drop out.
 */
export function selectForScope(
  scope: ShareScope,
  items: readonly ItemView[],
  units: readonly StorageUnit[],
): ShareSelection | undefined {
  switch (scope.kind) {
    case "all":
      return { title: SHARE_TITLES.all, items };
    case "unit": {
      const unit = units.find((u) => u.id === scope.unitId);
      if (!unit) return undefined;
      return { title: unit.name, items: items.filter((i) => i.locationId === unit.id) };
    }
    case "items": {
      const wanted = new Set(scope.itemIds);
      return { title: SHARE_TITLES.items, items: items.filter((i) => wanted.has(i.id)) };
    }
  }
}

/**
 * The public payload for a selection. Each item is built field by field, so an asset
 * id, location id, Terminal state or any future `ItemView` field stays out unless it
 * is listed here. `price` is only added when prices are shown.
 */
export function buildSharedInventory({
  selection,
  hidePrices,
  currency,
  expiresAt,
}: {
  readonly selection: ShareSelection;
  readonly hidePrices: boolean;
  readonly currency: string;
  readonly expiresAt: number | null;
}): SharedInventory {
  const items = selection.items.map((item): SharedItem => {
    const shared: SharedItem = {
      name: item.name,
      marketHashName: item.marketHashName,
      imageUrl: item.imageUrl,
      rarityColor: item.rarityColor,
      rarityName: item.rarityName,
      category: item.category,
      customName: item.customName,
      wear: item.wear,
      wearName: item.wearName,
      isStatTrak: item.isStatTrak,
      isSouvenir: item.isSouvenir,
      stickers: item.stickers,
      charms: item.charms,
      locationName: item.locationName,
    };
    return hidePrices ? shared : { ...shared, price: item.price };
  });
  const priced = hidePrices ? [] : items.flatMap((i) => (i.price == null ? [] : [i.price]));
  return {
    title: selection.title,
    items,
    currency: hidePrices ? null : currency,
    totalValue: priced.length > 0 ? priced.reduce((sum, price) => sum + price, 0) : null,
    expiresAt,
  };
}
