import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney, formatSignedMoney } from "~/utils/format";
import { OFFER_PANEL } from "./offer-panel.config";
import type { OfferCardProps } from "./offer-panel.types";

/** The offer on the table: the item, what the Terminal charges and what it is worth. */
export function OfferCard({ offer, currency }: OfferCardProps) {
  const copy = COPY.terminal;
  const [weapon, skin] = offer.name.includes(" | ")
    ? offer.name.split(" | ", 2)
    : [null, offer.name];
  // The Terminal charges in USD; the market value is in the display currency.
  const charge = offer.purchaseCost === null ? null : offer.purchaseCost / OFFER_PANEL.centsPerUnit;
  const edge =
    offer.price !== null && charge !== null && currency === OFFER_PANEL.priceCurrency
      ? offer.price - charge
      : null;
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-muted/30 p-4">
      <div className="flex min-w-0 items-center gap-4">
        <ItemThumb
          imageUrl={offer.imageUrl}
          rarityColor={offer.rarityColor}
          size={OFFER_PANEL.imageSize}
        />
        <div className="min-w-0">
          {weapon && (
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{weapon}</p>
          )}
          <p className="text-base font-medium leading-tight">{skin}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {[offer.rarityName, offer.wearName, offer.wear !== null && formatFloat(offer.wear)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1 text-sm">
        <dt className="text-muted-foreground">{copy.terminalPrice}</dt>
        <dd className="text-right tabular">
          {charge === null ? "—" : formatMoney(charge, OFFER_PANEL.priceCurrency)}
        </dd>
        <dt className="text-muted-foreground">{copy.marketValue}</dt>
        <dd className="text-right tabular">
          {offer.price === null ? "—" : formatMoney(offer.price, currency)}
        </dd>
        {edge !== null && (
          <>
            <dt className="text-muted-foreground">{copy.valueEdge}</dt>
            <dd
              className={cn("text-right tabular", edge >= 0 ? "text-success" : "text-destructive")}
            >
              {formatSignedMoney(edge, currency)}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
