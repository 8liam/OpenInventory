import { COPY } from "~/lib/copy/copy.config";
import type { SharedItem } from "~/lib/shares/share.types";
import { formatDate, formatMoney } from "~/utils/format";
import { SHARED_INVENTORY } from "./shared-inventory.config";
import type { SharedInventoryProps } from "./shared-inventory.types";

const EMPTY = "—";

/** A read-only view of one share: its header, totals and cards. Nothing here can change the owner's inventory. */
export function SharedInventory({ state }: SharedInventoryProps) {
  if (state.status === "loading") {
    return <p className={SHARED_INVENTORY.emptyClass}>{COPY.shares.sharedLoading}</p>;
  }
  if (state.status === "error") {
    return (
      <p role="alert" className="text-destructive">
        {state.message}
      </p>
    );
  }
  const { data } = state;
  return (
    <div className={SHARED_INVENTORY.wrapperClass}>
      <header className={SHARED_INVENTORY.headerClass}>
        <h1 className="text-xl font-semibold">{data.title || COPY.shares.sharedTitleFallback}</h1>
        <div className={SHARED_INVENTORY.metaRowClass}>
          <span>{COPY.shares.sharedItemsCount(data.items.length)}</span>
          {data.currency !== null && data.totalValue !== null && (
            <span>
              {COPY.shares.totalValue}: {formatMoney(data.totalValue, data.currency)}
            </span>
          )}
          {data.currency === null && <span>{COPY.shares.pricesHidden}</span>}
          {data.expiresAt !== null && (
            <span>{COPY.shares.sharedExpires(formatDate(data.expiresAt))}</span>
          )}
        </div>
      </header>
      {data.items.length === 0 ? (
        <p className={SHARED_INVENTORY.emptyClass}>{COPY.shares.emptyShare}</p>
      ) : (
        <ul className={SHARED_INVENTORY.gridClass}>
          {data.items.map((item, index) => (
            <SharedCard
              key={`${index}-${item.marketHashName ?? item.name}`}
              item={item}
              currency={data.currency}
            />
          ))}
        </ul>
      )}
      <p className={SHARED_INVENTORY.footerClass}>{COPY.shares.readOnly}</p>
    </div>
  );
}

function SharedCard({
  item,
  currency,
}: {
  readonly item: SharedItem;
  readonly currency: string | null;
}) {
  const price = item.price ?? null;
  return (
    <li
      className={SHARED_INVENTORY.cardClass}
      style={{ borderTopColor: item.rarityColor ?? undefined }}
    >
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={SHARED_INVENTORY.imageClass}
        />
      )}
      <p className={SHARED_INVENTORY.nameClass} title={item.name}>
        {item.customName ?? item.name}
      </p>
      <p className={SHARED_INVENTORY.metaClass}>
        {item.wearName ?? item.category}
        {item.isStatTrak ? " · StatTrak™" : ""}
        {item.isSouvenir ? " · Souvenir" : ""}
      </p>
      <p className={SHARED_INVENTORY.metaClass}>{item.locationName}</p>
      {currency !== null && (
        <p className="text-sm font-medium">
          {price === null ? EMPTY : formatMoney(price, currency)}
        </p>
      )}
    </li>
  );
}
