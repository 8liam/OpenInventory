import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useMemo, useState } from "react";
import { ItemTable } from "~/components/item-table/item-table.component";
import { TransferBar } from "~/components/transfer-bar/transfer-bar.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import type { InventoryResponse } from "~/lib/items/item.types";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { useSettings } from "~/lib/settings/settings.store";

export const Route = createFileRoute("/items")({ component: ItemsPage });

const ALL = "all";
const SELECT_CLASS =
  "h-8 min-w-0 flex-1 rounded-md border border-input bg-card px-2.5 outline-none sm:flex-none";

function ItemsPage() {
  const snapshot = useStorageSnapshot();
  const currency = useSettings((s) => s.currency);
  const data = useRemoteData<InventoryResponse>(
    `${STORAGE_API.items}?currency=${currency}`,
    snapshot.revision,
  );
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const items = data.status === "ready" ? data.data.items : undefined;

  const locations = useMemo(
    () => [...new Map((items ?? []).map((i) => [i.locationId, i.locationName]))],
    [items],
  );
  const types = useMemo(() => [...new Set((items ?? []).map((i) => i.category))].sort(), [items]);
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
        <select
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className={SELECT_CLASS}
          aria-label={COPY.itemColumns.location}
        >
          <option value={ALL}>{COPY.items.allLocations}</option>
          {locations.map(([id, name]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </select>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className={SELECT_CLASS}
          aria-label={COPY.itemColumns.type}
        >
          <option value={ALL}>{COPY.items.allTypes}</option>
          {types.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </PageHeader>
      {data.status === "loading" && <p className="text-muted-foreground">{COPY.common.loading}</p>}
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
