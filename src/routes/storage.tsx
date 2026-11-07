import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, RefreshCw } from "lucide-react";
import { useMemo, useState } from "react";
import { Button } from "~/components/button/button.component";
import { ItemCollection } from "~/components/item-collection/item-collection.component";
import { ItemTableSkeleton } from "~/components/item-table/item-table.skeleton";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { ViewToggle } from "~/components/view-toggle/view-toggle.component";
import { OrganiserPanel } from "~/components/organiser-panel/organiser-panel.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { TransferBar } from "~/components/transfer-bar/transfer-bar.component";
import { UnitCard } from "~/components/unit-card/unit-card.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import type { InventoryResponse, ItemView } from "~/lib/items/item.types";
import {
  callStorageApi,
  postJson,
  useRemoteData,
  useStorageSnapshot,
} from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { useItemViewMode } from "~/lib/items/view-mode.store";
import { usePriceQuery, useSettings } from "~/lib/settings/settings.store";
import { formatInteger, formatMoney } from "~/utils/format";

export const Route = createFileRoute("/storage")({ component: StoragePage });

function StoragePage() {
  const snapshot = useStorageSnapshot();
  const { mode: view, setMode: setView } = useItemViewMode();
  const currency = useSettings((s) => s.currency);
  const priceQuery = usePriceQuery();
  const data = useRemoteData<InventoryResponse>(
    `${STORAGE_API.items}?${priceQuery}`,
    snapshot.revision,
  );
  const [selectedId, setSelectedId] = useState<string>();
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [organising, setOrganising] = useState(false);
  const copy = COPY.storage;

  const byUnit = useMemo(() => {
    const groups = new Map<string, ItemView[]>();
    if (data.status === "ready") {
      for (const item of data.data.items)
        groups.set(item.locationId, [...(groups.get(item.locationId) ?? []), item]);
    }
    return groups;
  }, [data]);

  const dataLoading = data.status === "loading";
  // A unit the GC has not handed over yet counts as loading only while units are actually loading.
  const unitPending = (unit: { readonly loaded: boolean }) =>
    dataLoading || (!unit.loaded && snapshot.loadingUnits);
  const selected = snapshot.units.find((u) => u.id === selectedId) ?? snapshot.units[0];
  const selectedItems = selected ? (byUnit.get(selected.id) ?? []) : [];
  const pickedItems = selectedItems.filter((item) => picked.has(itemRowKey(item)));
  const selectedValue = selectedItems.reduce((sum, item) => sum + (item.price ?? 0), 0);

  return (
    <>
      <PageHeader title={copy.title} description={copy.description}>
        <Button
          small
          aria-pressed={organising}
          disabled={snapshot.units.length === 0}
          onClick={() => setOrganising((on) => !on)}
        >
          <ListChecks size={12} />
          {organising ? copy.closeOrganiser : copy.organise}
        </Button>
        <Button
          small
          disabled={snapshot.loadingUnits}
          onClick={() => void callStorageApi(`${STORAGE_API.refresh}?${priceQuery}`)}
        >
          <RefreshCw
            size={12}
            className={snapshot.loadingUnits ? "motion-safe:animate-spin" : undefined}
          />
          {snapshot.loadingUnits ? copy.loadingUnits : copy.refreshUnits}
        </Button>
      </PageHeader>
      {snapshot.units.length === 0 ? (
        <p className="text-muted-foreground">{copy.noUnits}</p>
      ) : organising ? (
        <OrganiserPanel
          items={data.status === "ready" ? data.data.items : []}
          itemsReady={data.status === "ready"}
          units={snapshot.units}
          busy={snapshot.transfer.status === "running"}
        />
      ) : (
        <div className="flex min-h-0 flex-1 flex-col gap-4 md:flex-row">
          <div className="flex shrink-0 gap-2 overflow-x-auto md:w-72 md:flex-col md:overflow-y-auto md:overflow-x-visible">
            {snapshot.units.map((unit) => (
              <UnitCard
                key={unit.id}
                unit={unit}
                items={byUnit.get(unit.id) ?? []}
                currency={currency}
                selected={selected?.id === unit.id}
                loading={unitPending(unit)}
                onRename={(name) => postJson(STORAGE_API.renameUnit, { id: unit.id, name })}
                onSelect={() => {
                  setSelectedId(unit.id);
                  setPicked(new Set());
                }}
              />
            ))}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-3">
            {selected && (
              <div className="flex items-center justify-between gap-3">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">{selected.name}</span> ·{" "}
                  {formatInteger(selected.itemCount)} {copy.items} · {copy.value}{" "}
                  {unitPending(selected) ? (
                    <Skeleton className="inline-block h-4 w-14 align-middle" />
                  ) : (
                    <span className="tabular text-foreground">
                      {formatMoney(selectedValue, currency)}
                    </span>
                  )}
                </p>
                <ViewToggle value={view} onChange={setView} />
              </div>
            )}
            {pickedItems.length > 0 && (
              <TransferBar
                selected={pickedItems}
                units={snapshot.units}
                busy={snapshot.transfer.status === "running"}
                onClear={() => setPicked(new Set())}
              />
            )}
            {selectedItems.length > 0 ? (
              <ItemCollection
                view={view}
                items={selectedItems}
                currency={currency}
                showLocation={false}
                selected={picked}
                onSelectionChange={setPicked}
              />
            ) : selected && unitPending(selected) ? (
              <LoadingRegion className="flex min-h-0 flex-1 flex-col">
                <ItemTableSkeleton showLocation={false} selectable />
              </LoadingRegion>
            ) : (
              <p className="text-muted-foreground">
                {selected?.loaded ? copy.unitEmpty : copy.selectUnit}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
