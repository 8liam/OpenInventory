import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ItemTable } from "~/components/item-table/item-table.component";
import { ItemTableSkeleton } from "~/components/item-table/item-table.skeleton";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { TransferBar } from "~/components/transfer-bar/transfer-bar.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import type { InventoryResponse } from "~/lib/items/item.types";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { formatInteger } from "~/utils/format";

export const Route = createFileRoute("/items")({ component: ItemsPage });

const ALL = "all";
const SELECT_WIDTH = "min-w-0 flex-1 sm:w-48 sm:flex-none";

function ItemsPage() {
  const snapshot = useStorageSnapshot();
  const priceQuery = usePriceQuery();
  const data = useRemoteData<InventoryResponse>(
    `${STORAGE_API.items}?${priceQuery}`,
    snapshot.revision,
  );
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const items = data.status === "ready" ? data.data.items : undefined;

  const locationOptions = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const item of items ?? []) {
      const known = counts.get(item.locationId);
      if (known) known.count += 1;
      else counts.set(item.locationId, { name: item.locationName, count: 1 });
    }
    return [
      { id: ALL, label: COPY.items.allLocations, detail: formatInteger(items?.length ?? 0) },
      ...[...counts].map(([id, { name, count }]) => ({
        id,
        label: name,
        detail: formatInteger(count),
      })),
    ];
  }, [items]);
  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items ?? []) counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return [
      { id: ALL, label: COPY.items.allTypes, detail: formatInteger(items?.length ?? 0) },
      ...[...counts]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, count]) => ({ id, label: id, detail: formatInteger(count) })),
    ];
  }, [items]);
  const rows = useMemo(
    () =>
      items?.filter(
        (i) =>
          (location === ALL || i.locationId === location) &&
          (type === ALL || i.category === type) &&
          (!deferred ||
            i.name.toLowerCase().includes(deferred) ||
            (i.customName?.toLowerCase().includes(deferred) ?? false)),
      ),
    [items, location, type, deferred],
  );

  const selectedItems = useMemo(
    () => (items ?? []).filter((i) => selected.has(itemRowKey(i))),
    [items, selected],
  );

  return (
    <>
      <PageHeader title={COPY.items.title} description={COPY.items.description}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={COPY.common.searchPlaceholder}
          className="h-8 w-full rounded-md border border-input bg-card px-2.5 outline-none placeholder:text-muted-foreground focus:border-primary sm:w-56"
        />
        <Select
          value={location}
          ariaLabel={COPY.itemColumns.location}
          className={SELECT_WIDTH}
          options={locationOptions}
          onChange={setLocation}
        />
        <Select
          value={type}
          ariaLabel={COPY.itemColumns.type}
          className={SELECT_WIDTH}
          options={typeOptions}
          onChange={setType}
        />
      </PageHeader>
      {data.status === "loading" && (
        <LoadingRegion className="flex min-h-0 flex-1 flex-col">
          <ItemTableSkeleton selectable />
        </LoadingRegion>
      )}
      {data.status === "error" && (
        <p role="alert" className="text-destructive">
          {COPY.common.errorPrefix} {data.message}
        </p>
      )}
      {selectedItems.length > 0 && (
        <TransferBar
          selected={selectedItems}
          units={snapshot.units}
          busy={snapshot.transfer.status === "running"}
          onClear={() => setSelected(new Set())}
        />
      )}
      {rows && data.status === "ready" && (
        <ItemTable
          items={rows}
          currency={data.data.currency}
          selected={selected}
          onSelectionChange={setSelected}
        />
      )}
    </>
  );
}
