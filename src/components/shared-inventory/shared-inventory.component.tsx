import { COPY } from "~/lib/copy/copy.config";
import { SharedItemCard } from "~/components/shared-item-card/shared-item-card.component";
import { formatDate, formatMoney } from "~/utils/format";
import { SHARED_INVENTORY } from "./shared-inventory.config";
import type { SharedInventoryProps } from "./shared-inventory.types";

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
            <SharedItemCard
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
