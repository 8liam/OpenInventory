import { useEffect } from "react";
import { IMAGE_PRELOAD } from "~/lib/images/image-preload.config";
import { preloadImages } from "~/lib/images/image-preload";
import type { InventoryResponse } from "~/lib/items/item.types";
import { useRemoteData } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";

/** Fetches the inventory once up front (filling the page cache) and warms its first item images. */
export function InventoryPrefetch() {
  const priceQuery = usePriceQuery();
  // Fixed revision: fetch on load and when prices change, never on every push.
  const data = useRemoteData<InventoryResponse>(`${STORAGE_API.items}?${priceQuery}`, 0);
  const items = data.status === "ready" ? data.data.items : undefined;

  useEffect(() => {
    if (!items) return;
    preloadImages(items.slice(0, IMAGE_PRELOAD.itemCount).map((item) => item.imageUrl));
  }, [items]);

  return null;
}
