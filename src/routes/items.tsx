import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ItemCollection } from "~/components/item-collection/item-collection.component";
import { ItemTableSkeleton } from "~/components/item-table/item-table.skeleton";
import { ExportItems } from "~/components/export-items/export-items.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Reveal } from "~/components/reveal/reveal.component";
import { TransferBar } from "~/components/transfer-bar/transfer-bar.component";
import { ViewToggle } from "~/components/view-toggle/view-toggle.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Select } from "~/components/select/select.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import { matchesItem } from "~/lib/items/item-search";
import type { InventoryResponse } from "~/lib/items/item.types";
import { reasonsByItemKey } from "~/lib/items/sell-suggestions";
import type { SellSuggestionsResponse } from "~/lib/items/sell-suggestions.types";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { useItemViewMode } from "~/lib/items/view-mode.store";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { formatInteger } from "~/utils/format";

export const Route = createFileRoute("/items")({
  // `?q=` pre-fills the search, e.g. when a dashboard row links here.
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q !== "" ? { q: search.q } : {},
  component: ItemsPage,
});

const ALL = "all";
const SELECT_WIDTH = "min-w-0 flex-1 sm:w-48 sm:flex-none";

function ItemsPage() {
  const { q: linkedQuery = "" } = Route.useSearch();
  const snapshot = useStorageSnapshot();
  const { mode: view, setMode: setView } = useItemViewMode();
  const priceQuery = usePriceQuery();
  const data = useRemoteData<InventoryResponse>(
    `${STORAGE_API.items}?${priceQuery}`,
    snapshot.revision,
  );
  const suggestionsData = useRemoteData<SellSuggestionsResponse>(
    `${STORAGE_API.suggestions}?${priceQuery}`,
    snapshot.revision,
  );
  const reasonsByKey = useMemo(
    () =>
      suggestionsData.status === "ready"
        ? reasonsByItemKey(suggestionsData.data.suggestions)
        : undefined,
    [suggestionsData],
  );
  const [query, setQuery] = useState(linkedQuery);
  // A new link (or back/forward) replaces what was typed; typing never rewrites the URL.
  const [appliedQuery, setAppliedQuery] = useState(linkedQuery);
  if (appliedQuery !== linkedQuery) {
    setAppliedQuery(linkedQuery);
    setQuery(linkedQuery);
  }
  const [location, setLocation] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const deferred = useDeferredValue(query);
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
          matchesItem(i, deferred),
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
        {rows && data.status === "ready" && (
          <ExportItems items={rows} currency={data.data.currency} />
        )}
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
        <ViewToggle value={view} onChange={setView} />
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
      <Reveal open={selectedItems.length > 0}>
        {selectedItems.length > 0 && (
          <TransferBar
            selected={selectedItems}
            units={snapshot.units}
            busy={snapshot.transfer.status === "running"}
            onClear={() => setSelected(new Set())}
          />
        )}
      </Reveal>
      {rows && data.status === "ready" && (
        <ItemCollection
          view={view}
          items={rows}
          currency={data.data.currency}
          selected={selected}
          onSelectionChange={setSelected}
          reasonsByKey={reasonsByKey}
        />
      )}
    </>
  );
}
