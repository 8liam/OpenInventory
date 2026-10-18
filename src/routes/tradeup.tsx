import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ItemLabel } from "~/components/item-label/item-label.component";
import { TradeUpSkeleton } from "~/components/tradeup-skeleton/tradeup-skeleton.component";
import { ItemCell } from "~/components/item-cell/item-cell.component";
import { Metric } from "~/components/metric/metric.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { COPY } from "~/lib/copy/copy.config";
import type { TradeUpResponse } from "~/lib/items/item.types";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API, TRADE_UP } from "~/lib/storage/storage.config";
import { useSettings } from "~/lib/settings/settings.store";
import { formatFloat, formatMoney, formatPercent } from "~/utils/format";

export const Route = createFileRoute("/tradeup")({ component: TradeUpPage });

const INPUT_RARITIES = TRADE_UP.rarityOrder.slice(0, -1);
const OUTCOME_IMAGE_SIZE = 40;

function TradeUpPage() {
  const snapshot = useStorageSnapshot();
  const currency = useSettings((s) => s.currency);
  const [rarity, setRarity] = useState<string>(TRADE_UP.defaultInputRarity);
  const result = useRemoteData<TradeUpResponse>(
    `${STORAGE_API.tradeUp}?rarity=${rarity}&currency=${currency}`,
    snapshot.revision,
  );
  const copy = COPY.tradeup;
  const ok = result.status === "ready" && result.data.ok ? result.data : undefined;

  return (
    <>
      <PageHeader title={copy.title} description={copy.description}>
        <label className="flex items-center gap-2 text-muted-foreground">
          {copy.rarity}
          <select
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
            className="h-8 rounded-md border border-input bg-card px-2.5 text-foreground outline-none"
          >
            {INPUT_RARITIES.map((id) => (
              <option key={id} value={id}>
                {copy.rarities[id as keyof typeof copy.rarities]}
              </option>
            ))}
          </select>
        </label>
      </PageHeader>
      {result.status === "loading" && <TradeUpSkeleton />}
      {result.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {result.message}
        </p>
      )}
      {result.status === "ready" && !result.data.ok && (
        <p className="text-muted-foreground">{result.data.reason}</p>
      )}
      {ok && (
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label={copy.inputCost} value={formatMoney(ok.inputCost, ok.currency)} />
            <Metric label={copy.averageFloat} value={formatFloat(ok.averageFloat)} />
            <Metric label={copy.expectedValue} value={formatMoney(ok.expectedValue, ok.currency)} />
            <Metric
              label={copy.expectedReturn}
              value={formatPercent(ok.expectedValue / ok.inputCost - 1)}
              tone={ok.expectedValue >= ok.inputCost ? "positive" : "negative"}
            />
          </div>
          <p className="text-xs text-muted-foreground">{copy.formulaNote}</p>
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            <Panel title={copy.inputs}>
              <ul className="flex flex-col gap-2">
                {ok.inputs.map((item) => (
                  <li key={item.id} className="flex items-center justify-between gap-3">
                    <ItemCell item={item} />
                    <span className="tabular shrink-0">
                      {item.price === null
                        ? COPY.common.empty
                        : formatMoney(item.price, ok.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
            <Panel title={copy.outcomes}>
              <ul className="flex flex-col gap-2">
                {ok.outcomes.map((outcome) => (
                  <li key={outcome.name} className="flex items-center justify-between gap-3">
                    <ItemLabel
                      name={outcome.name}
                      imageUrl={outcome.imageUrl}
                      rarityColor={null}
                      size={OUTCOME_IMAGE_SIZE}
                    />
                    <span className="tabular shrink-0 text-muted-foreground">
                      {formatPercent(outcome.probability)} ·{" "}
                      {outcome.price === null
                        ? COPY.common.empty
                        : formatMoney(outcome.price, ok.currency)}
                    </span>
                  </li>
                ))}
              </ul>
            </Panel>
          </div>
        </div>
      )}
    </>
  );
}
