import { ITEM_CELL } from "~/components/item-cell/item-cell.config";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { MetricSkeleton } from "~/components/metric/metric.skeleton";
import { Panel } from "~/components/panel/panel.component";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { COPY } from "~/lib/copy/copy.config";
import { TRADE_UP } from "~/lib/storage/storage.config";
import { TRADEUP_SKELETON } from "./tradeup-skeleton.config";

function Row({ thumb, price }: { readonly thumb: number; readonly price: string }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <Skeleton className="shrink-0 rounded-md" style={{ width: thumb, height: thumb }} />
        <div className="min-w-0">
          <Skeleton className="mb-0.5 h-[11px] w-16" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <Skeleton className={`h-4 ${price}`} />
    </li>
  );
}

/** The trade-up page body: real labels and panel titles, placeholders for every figure and row. */
export function TradeUpSkeleton() {
  const copy = COPY.tradeup;
  return (
    <LoadingRegion className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-2 [&>*]:shrink-0">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricSkeleton label={copy.inputCost} />
        <MetricSkeleton label={copy.averageFloat} />
        <MetricSkeleton label={copy.expectedValue} />
        <MetricSkeleton label={copy.expectedReturn} />
      </div>
      <p className="text-xs text-muted-foreground">{copy.formulaNote}</p>
      <div className="flex flex-col gap-3">
        <Panel title={copy.inputs}>
          <ul className="flex flex-col gap-2">
            {Array.from({ length: TRADE_UP.inputCount }, (_, row) => (
              <Row key={row} thumb={ITEM_CELL.imageSize} price="w-14" />
            ))}
          </ul>
        </Panel>
        <Panel title={copy.outcomes}>
          <ul className="flex flex-col gap-2">
            {Array.from({ length: TRADEUP_SKELETON.outcomeRows }, (_, row) => (
              <Row key={row} thumb={TRADEUP_SKELETON.outcomeThumbSize} price="w-24" />
            ))}
          </ul>
        </Panel>
      </div>
    </LoadingRegion>
  );
}
