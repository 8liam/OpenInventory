import { ChevronDown, ChevronUp } from "lucide-react";
import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney, formatSignedMoney } from "~/utils/format";
import { OFFER_PANEL } from "./offer-panel.config";
import type { OfferCardProps } from "./offer-panel.types";

/** The offer on the table: the item, what the Terminal charges and what it is worth. */
const C = OFFER_PANEL.classes;

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
    <div className={C.card}>
      {offer.rarityColor && (
        <span aria-hidden className={C.rarity} style={{ background: offer.rarityColor }} />
      )}
      <div className="flex min-w-0 items-center gap-4">
        <ItemThumb imageUrl={offer.imageUrl} rarityColor={null} size={OFFER_PANEL.imageSize} />
        <div className="min-w-0">
          {weapon && <p className={C.weapon}>{weapon}</p>}
          <p className={C.skin}>{skin}</p>
          <p className={C.meta}>
            {[offer.rarityName, offer.wearName, offer.wear !== null && formatFloat(offer.wear)]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>
      <dl className={C.facts}>
        <dt className={C.factLabel}>{copy.terminalPrice}</dt>
        <dd className={C.factValue}>
          {charge === null ? "—" : formatMoney(charge, OFFER_PANEL.priceCurrency)}
        </dd>
        <dt className={C.factLabel}>{copy.marketValue}</dt>
        <dd className={C.factValue}>
          {offer.price === null ? "—" : formatMoney(offer.price, currency)}
        </dd>
        {edge !== null && (
          <>
            <dt className={C.factLabel}>{copy.valueEdge}</dt>
            <dd className={cn(C.factValue, C.edge, edge >= 0 ? C.gain : C.loss)}>
              {edge >= 0 ? (
                <ChevronUp size={OFFER_PANEL.iconSize} strokeWidth={2.5} aria-hidden />
              ) : (
                <ChevronDown size={OFFER_PANEL.iconSize} strokeWidth={2.5} aria-hidden />
              )}
              {formatSignedMoney(edge, currency)}
            </dd>
          </>
        )}
      </dl>
    </div>
  );
}
