import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ItemLabel } from "~/components/item-label/item-label.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Panel } from "~/components/panel/panel.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import type { InventoryResponse, ItemView } from "~/lib/items/item.types";
import { daysUntilUnlock, groupUpcomingUnlocks } from "~/lib/items/tradability";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { formatMoney } from "~/utils/format";

export const Route = createFileRoute("/tradability")({ component: TradabilityPage });
const EMPTY_ITEMS: readonly ItemView[] = [];

function TradabilityPage() {
  const snapshot = useStorageSnapshot();
  const data = useRemoteData<InventoryResponse>(
    `${STORAGE_API.items}?${usePriceQuery()}`,
    snapshot.revision,
  );
  const [period, setPeriod] = useState("day");
  const [scope, setScope] = useState("upcoming");
  const [now] = useState(() => Date.now());
  const items = data.status === "ready" ? data.data.items : EMPTY_ITEMS;
  const filtered = useMemo(
    () =>
      items.filter((item) => {
        if (scope === "upcoming") return item.tradableAfter !== null && item.tradableAfter > now;
        if (scope === "now") return item.tradableAfter === null || item.tradableAfter <= now;
        if (scope.startsWith("date:")) {
          const date = new Date(item.tradableAfter ?? 0);
          const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
          return item.tradableAfter !== null && key === scope.slice(5);
        }
        return true;
      }),
    [items, scope, now],
  );
  const dateOptions = groupUpcomingUnlocks(items, now).map(({ key, label }) => ({
    id: `date:${key}`,
    label,
  }));
  const groups = useMemo(
    () => groupUpcomingUnlocks(filtered, now, period === "week" ? "week" : "day"),
    [filtered, now, period],
  );
  const copy = COPY.tradability;
  return (
    <>
      <PageHeader title={copy.title} description={copy.description}>
        <Select
          ariaLabel="Tradability filter"
          value={scope}
          onChange={setScope}
          options={[
            { id: "upcoming", label: copy.upcoming },
            { id: "now", label: copy.unrestricted },
            { id: "all", label: copy.allDates },
            ...dateOptions,
          ]}
        />
        <Select
          ariaLabel="Group unlocks by"
          value={period}
          onChange={setPeriod}
          options={[
            { id: "day", label: "By day" },
            { id: "week", label: "By week" },
          ]}
        />
      </PageHeader>
      {data.status === "loading" && (
        <LoadingRegion className="min-h-0 flex-1">
          <span className="sr-only">{COPY.common.loading}</span>
        </LoadingRegion>
      )}
      {data.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {data.message}
        </p>
      )}
      {data.status === "ready" && (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-4">
          {scope !== "now" &&
            groups.map((group) => (
              <Panel key={group.key} title={group.label}>
                <ul className="divide-y">
                  {group.items.map((item) => (
                    <UnlockRow
                      key={`${item.locationId}:${item.id}`}
                      item={item}
                      now={now}
                      currency={data.data.currency}
                    />
                  ))}
                </ul>
              </Panel>
            ))}
          {scope === "now" && (
            <Panel title={copy.unrestricted}>
              <ul className="divide-y">
                {filtered.map((item) => (
                  <UnlockRow
                    key={`${item.locationId}:${item.id}`}
                    item={item}
                    now={now}
                    currency={data.data.currency}
                  />
                ))}
              </ul>
            </Panel>
          )}
          {scope !== "now" && groups.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">{copy.noUpcoming}</p>
          )}
          {scope === "all" && (
            <Panel title={copy.unrestricted}>
              <ul className="divide-y">
                {filtered
                  .filter((item) => item.tradableAfter === null || item.tradableAfter <= now)
                  .map((item) => (
                    <UnlockRow
                      key={`${item.locationId}:${item.id}`}
                      item={item}
                      now={now}
                      currency={data.data.currency}
                    />
                  ))}
              </ul>
            </Panel>
          )}
        </div>
      )}
    </>
  );
}

function UnlockRow({
  item,
  now,
  currency,
}: {
  readonly item: ItemView;
  readonly now: number;
  readonly currency: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 py-2">
      <ItemLabel
        name={item.name}
        imageUrl={item.imageUrl}
        rarityColor={item.rarityColor}
        customName={item.customName}
        size={36}
      />
      <div className="shrink-0 text-right text-xs">
        <p className="tabular text-warning">
          {item.tradableAfter === null || item.tradableAfter <= now
            ? COPY.tradability.unrestricted
            : COPY.tradability.daysUntil(daysUntilUnlock(item.tradableAfter, now))}
        </p>
        {item.tradableAfter !== null && (
          <p className="text-muted-foreground">{new Date(item.tradableAfter).toLocaleString()}</p>
        )}
        {item.price !== null && (
          <p className="text-muted-foreground">
            {formatMoney(item.price, currency)} · {item.locationName}
          </p>
        )}
      </div>
    </li>
  );
}
