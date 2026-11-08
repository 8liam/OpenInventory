import { createFileRoute } from "@tanstack/react-router";
import { ListChecks, RefreshCw } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Button } from "~/components/button/button.component";
import { ItemCollection } from "~/components/item-collection/item-collection.component";
import { ItemTableSkeleton } from "~/components/item-table/item-table.skeleton";
import { LoadError } from "~/components/load-error/load-error.component";
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
  useScopedPath,
  useSingleAccountId,
  useSingleAccountLabel,
} from "~/lib/accounts/account-scope.hooks";
import { postJson, useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { STORAGE_PAGE } from "~/lib/storage/storage-page.config";
import { useItemViewMode } from "~/lib/items/view-mode.store";
import { usePriceQuery, useSettings } from "~/lib/settings/settings.store";
import { formatMoney } from "~/utils/format";
import { formatCount } from "~/utils/plural";

export const Route = createFileRoute("/storage")({ component: StoragePage });

function StoragePage() {
  const snapshot = useStorageSnapshot();
  const { mode: view, setMode: setView } = useItemViewMode();
  const currency = useSettings((s) => s.currency);
  const priceQuery = usePriceQuery();
  const accountId = useSingleAccountId();
  const accountLabel = useSingleAccountLabel();
  const data = useRemoteData<InventoryResponse>(
    useScopedPath(`${STORAGE_API.items}?${priceQuery}`),
    snapshot.revision,
  );
  const [selectedId, setSelectedId] = useState<string>();
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const [organising, setOrganising] = useState(false);
  const [reload, setReload] = useState<{ readonly pending: boolean; readonly error?: string }>({
    pending: false,
  });
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
  const reloading = reload.pending || snapshot.loadingUnits;
  const reloadRef = useRef<HTMLButtonElement>(null);
  const reloadErrorRef = useRef<HTMLDivElement>(null);

  // The button stays enabled (and focusable) while busy; a second press is ignored instead. The
  // error stays up through a retry, and if its Retry had focus, focus returns to the button.
  async function reloadUnits() {
    if (accountId === undefined || reloading) return;
    setReload((current) => ({ pending: true, error: current.error }));
    try {
      await postJson(`${STORAGE_API.refresh}?${priceQuery}`, { accountId });
      if (reloadErrorRef.current?.contains(document.activeElement)) reloadRef.current?.focus();
      setReload({ pending: false });
    } catch (error) {
      setReload({
        pending: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return (
    <>
      <PageHeader title={copy.title} description={copy.description} account={accountLabel}>
        <Button
          small
          aria-pressed={organising}
          disabled={snapshot.units.length === 0}
          onClick={() => setOrganising((on) => !on)}
        >
          <ListChecks size={STORAGE_PAGE.iconSize} aria-hidden />
          {organising ? copy.closeOrganiser : copy.organise}
        </Button>
        <Button ref={reloadRef} small aria-busy={reloading} onClick={() => void reloadUnits()}>
          <RefreshCw
            size={STORAGE_PAGE.iconSize}
            aria-hidden
            className={reloading ? "motion-safe:animate-spin" : undefined}
          />
          {reloading ? copy.loadingUnits : copy.refreshUnits}
        </Button>
      </PageHeader>
      {reload.error !== undefined && (
        <div ref={reloadErrorRef} className="contents">
          <LoadError
            title={copy.reloadFailed}
            message={reload.error}
            onRetry={() => void reloadUnits()}
          />
        </div>
      )}
      {data.status === "error" ? (
        <LoadError message={data.message} onRetry={data.retry} />
      ) : snapshot.units.length === 0 ? (
        <p className="text-muted-foreground">{copy.noUnits}</p>
      ) : organising ? (
        <OrganiserPanel
          items={data.status === "ready" ? data.data.items : []}
          itemsReady={data.status === "ready"}
          units={snapshot.units}
          accountId={accountId}
          accountName={accountLabel}
          busy={snapshot.transfer.status === "running"}
        />
      ) : (
        <div className={STORAGE_PAGE.containerClass}>
          <div className={STORAGE_PAGE.splitClass}>
            <div className={STORAGE_PAGE.unitsClass}>
              {snapshot.units.map((unit) => (
                <UnitCard
                  key={unit.id}
                  unit={unit}
                  items={byUnit.get(unit.id) ?? []}
                  currency={currency}
                  selected={selected?.id === unit.id}
                  loading={unitPending(unit)}
                  onRename={(name) =>
                    accountId === undefined
                      ? Promise.reject(new Error(COPY.accounts.chooseOneTitle))
                      : postJson(STORAGE_API.renameUnit, { accountId, id: unit.id, name })
                  }
                  onSelect={() => {
                    setSelectedId(unit.id);
                    setPicked(new Set());
                  }}
                />
              ))}
            </div>
            <div className={STORAGE_PAGE.contentsClass}>
              {selected && (
                <div className="flex items-center justify-between gap-3">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{selected.name}</span> ·{" "}
                    {formatCount(selected.itemCount, copy.items)} · {copy.value}{" "}
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
                  accountName={accountLabel}
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
        </div>
      )}
    </>
  );
}
