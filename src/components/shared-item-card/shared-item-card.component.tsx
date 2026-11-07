import { COPY } from "~/lib/copy/copy.config";
import { formatMoney } from "~/utils/format";
import { SHARED_ITEM_CARD } from "./shared-item-card.config";
import type { SharedItemCardProps } from "./shared-item-card.types";

/** One item of a shared inventory, read-only. Only whitelisted fields reach here. */
export function SharedItemCard({ item, currency }: SharedItemCardProps) {
  const price = item.price ?? null;
  const meta = [
    item.wearName ?? item.category,
    item.isStatTrak ? COPY.shares.statTrak : undefined,
    item.isSouvenir ? COPY.shares.souvenir : undefined,
  ]
    .filter(Boolean)
    .join(SHARED_ITEM_CARD.metaSeparator);
  return (
    <li
      className={SHARED_ITEM_CARD.cardClass}
      style={{ borderTopColor: item.rarityColor ?? undefined }}
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={SHARED_ITEM_CARD.imageClass}
        />
      )}
      <p className={SHARED_ITEM_CARD.nameClass} title={item.name}>
        {item.customName ?? item.name}
      </p>
      <p className={SHARED_ITEM_CARD.metaClass}>{meta}</p>
      <p className={SHARED_ITEM_CARD.metaClass}>{item.locationName}</p>
      {currency !== null && (
        <p className={SHARED_ITEM_CARD.priceClass}>
          {price === null ? COPY.common.empty : formatMoney(price, currency)}
        </p>
      )}
    </li>
  );
}
