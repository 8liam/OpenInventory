import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { DangerDialog } from "~/components/danger-dialog/danger-dialog.component";
import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { COPY } from "~/lib/copy/copy.config";
import type { TerminalOffer, TerminalOfferResponse } from "~/lib/items/item.types";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { postForJson } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { formatMoney } from "~/utils/format";
import { OfferCard } from "./offer-card.component";
import { OFFER_PANEL } from "./offer-panel.config";
import type { OfferPanelProps } from "./offer-panel.types";

/** Browse an active Terminal's offer and, after a confirmation, move on to the next one. */
export function OfferPanel({ terminalId }: OfferPanelProps) {
  const copy = COPY.terminal;
  const priceQuery = usePriceQuery();
  const [response, setResponse] = useState<TerminalOfferResponse>();
  const [earlier, setEarlier] = useState<readonly TerminalOffer[]>([]);
  const [error, setError] = useState<string>();
  const [confirming, setConfirming] = useState(false);
  const requested = useRef<string | undefined>(undefined);

  const ask = useCallback(
    async (path: string) => {
      const next = await postForJson<TerminalOfferResponse>(`${path}?${priceQuery}`, {
        id: terminalId,
      });
      setResponse(next);
    },
    [priceQuery, terminalId],
  );

  useEffect(() => {
    // The terminal's id changes when an offer is taken, and prices can change; refetch for either.
    const key = `${terminalId}:${priceQuery}`;
    if (requested.current === key) return;
    requested.current = key;
    setError(undefined);
    ask(STORAGE_API.terminalOffer).catch((failure: unknown) =>
      setError(failure instanceof Error ? failure.message : String(failure)),
    );
  }, [ask, priceQuery, terminalId]);

  const current = response?.offers[0];

  async function nextOffer() {
    const before = current;
    await ask(STORAGE_API.terminalNextOffer);
    if (before) setEarlier((seen) => [before, ...seen]);
  }

  return (
    <div className="flex flex-col gap-3">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {!response && !error && <p className="text-sm text-muted-foreground">{copy.offerLoading}</p>}
      {response && !current && <p className="text-sm text-muted-foreground">{copy.offerEmpty}</p>}
      {response && current && <OfferCard offer={current} currency={response.currency} />}
      {response && current && (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground">{copy.offerNote}</p>
          {response.isFinalOffer ? (
            <span className="rounded-md border px-2.5 py-1 text-xs font-medium">
              {copy.finalOffer}
            </span>
          ) : (
            <Button variant="secondary" onClick={() => setConfirming(true)}>
              {copy.nextOffer}
            </Button>
          )}
        </div>
      )}
      {earlier.length > 0 && response && (
        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium text-muted-foreground">{copy.earlierOffers}</p>
          {earlier.map((offer) => (
            <div key={offer.id} className="flex items-center justify-between gap-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <ItemThumb
                  imageUrl={offer.imageUrl}
                  rarityColor={offer.rarityColor}
                  size={OFFER_PANEL.earlierImageSize}
                />
                <span className="truncate">{offer.name}</span>
              </div>
              <span className="shrink-0 text-muted-foreground tabular">
                {offer.price === null ? "—" : formatMoney(offer.price, response.currency)}
              </span>
            </div>
          ))}
        </div>
      )}
      <DangerDialog
        open={confirming}
        title={copy.nextTitle}
        warning={copy.nextWarning}
        effects={copy.nextEffects}
        acknowledgement={copy.nextCheckbox}
        confirmLabel={copy.nextConfirm}
        workingLabel={copy.nextWorking}
        cancelLabel={copy.cancel}
        onConfirm={nextOffer}
        onClose={() => setConfirming(false)}
      />
    </div>
  );
}
