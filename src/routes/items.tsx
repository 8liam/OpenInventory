import { createFileRoute } from "@tanstack/react-router";
import { LoadError } from "~/components/load-error/load-error.component";
import { Gem } from "lucide-react";
import { useCallback, useDeferredValue, useMemo, useState } from "react";
import { ItemCollection } from "~/components/item-collection/item-collection.component";
import { ItemTableSkeleton } from "~/components/item-table/item-table.skeleton";
import { ExportItems } from "~/components/export-items/export-items.component";
import { LoadingRegion } from "~/components/loading-region/loading-region.component";
import { Reveal } from "~/components/reveal/reveal.component";
import { TransferBar } from "~/components/transfer-bar/transfer-bar.component";
import { ViewToggle } from "~/components/view-toggle/view-toggle.component";
import { Button } from "~/components/button/button.component";
import { FilteredEmpty } from "~/components/filtered-empty/filtered-empty.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { Select } from "~/components/select/select.component";
import {
  accountDisplayName,
  accountIdSuffix,
  accountNameWithId,
  accountText,
} from "~/lib/accounts/account-names";
import {
  useAccountScope,
  useScopedPath,
  useSingleAccountLabel,
} from "~/lib/accounts/account-scope.hooks";
import { ACCOUNT_LABELS } from "~/lib/accounts/accounts.config";
import { TiersHelp } from "~/components/tiers-help/tiers-help.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import { matchesItem } from "~/lib/items/item-search";
import { itemHighlights } from "~/lib/items/highlights";
import { ALL_FILTER, ITEMS_PAGE, LABEL_FILTER_PREFIX } from "~/lib/items/items-page.config";
import type { InventoryResponse, ItemView } from "~/lib/items/item.types";
import { useRestoreFocusOnRecovery } from "~/lib/storage/recovered-focus.hooks";
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

/** Location ids repeat across accounts (every inventory is "inventory"), so filters key on both. */
const locationKey = (item: { readonly accountId: string; readonly locationId: string }) =>
  `${item.accountId}:${item.locationId}`;

/** `value` while it is still one of `options`, else "no filter"; a stale pick never empties the page. */
function validFilter(value: string, options: readonly { readonly id: string }[]): string {
  return options.some((option) => option.id === value) ? value : ALL_FILTER;
}

function ItemsPage() {
  const { q: linkedQuery = "" } = Route.useSearch();
  const snapshot = useStorageSnapshot();
  const { mode: view, setMode: setView } = useItemViewMode();
  const priceQuery = usePriceQuery();
  const { accounts, scoped, isAll } = useAccountScope();
  const accountLabel = useSingleAccountLabel();
  const data = useRemoteData<InventoryResponse>(
    useScopedPath(`${STORAGE_API.items}?${priceQuery}`),
    snapshot.revision,
  );
  useRestoreFocusOnRecovery(data.status);
  const [query, setQuery] = useState(linkedQuery);
  // A new link (or back/forward) replaces what was typed; typing never rewrites the URL.
  const [appliedQuery, setAppliedQuery] = useState(linkedQuery);
  if (appliedQuery !== linkedQuery) {
    setAppliedQuery(linkedQuery);
    setQuery(linkedQuery);
  }
  // The page remounts when the sidebar account changes (see AccountGate), so these start fresh per scope.
  const [accountPick, setAccountFilter] = useState(ALL_FILTER);
  const [locationPick, setLocation] = useState(ALL_FILTER);
  const [typePick, setType] = useState(ALL_FILTER);
  const [highlightsOnly, setHighlightsOnly] = useState(false);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const deferred = useDeferredValue(query);
  const items = data.status === "ready" ? data.data.items : undefined;

  const accountByKey = useMemo(
    () => new Map(accounts.map((account) => [account.steamId, account])),
    [accounts],
  );
  const accountTextOf = useCallback(
    (id: string) => {
      const account = accountByKey.get(id);
      return account ? accountText(account) : undefined;
    },
    [accountByKey],
  );
  const accountNames = useMemo(
    () => (isAll ? new Map(accounts.map((a) => [a.steamId, accountDisplayName(a)])) : undefined),
    [accounts, isAll],
  );
  const accountOptions = useMemo(() => {
    const usedLabels = ACCOUNT_LABELS.filter((label) => scoped.some((a) => a.label === label));
    return [
      { id: ALL_FILTER, label: COPY.items.anyAccount },
      ...usedLabels.map((label) => ({
        id: `${LABEL_FILTER_PREFIX}${label}`,
        label: COPY.accounts.filterLabel(COPY.accounts.labels[label]),
      })),
      ...scoped.map((a) => {
        const { name, suffix } = accountDisplayName(a);
        return {
          id: a.steamId,
          label: name,
          detail: suffix ?? undefined,
          triggerDetail: suffix ?? undefined,
        };
      }),
    ];
  }, [scoped]);
  const accountFilter = isAll ? validFilter(accountPick, accountOptions) : ALL_FILTER;
  // Account and label filters narrow the rows first, so the location and type counts below match what is shown.
  const inAccount = useMemo(
    () =>
      items?.filter((i) => {
        if (accountFilter === ALL_FILTER) return true;
        if (accountFilter.startsWith(LABEL_FILTER_PREFIX))
          return (
            accountByKey.get(i.accountId)?.label === accountFilter.slice(LABEL_FILTER_PREFIX.length)
          );
        return i.accountId === accountFilter;
      }),
    [items, accountFilter, accountByKey],
  );

  const locationOptions = useMemo(() => {
    const counts = new Map<string, { item: ItemView; count: number }>();
    for (const item of inAccount ?? []) {
      // Location ids repeat across accounts ("inventory"), so each account's get their own row.
      const id = locationKey(item);
      const known = counts.get(id);
      if (known) known.count += 1;
      else counts.set(id, { item, count: 1 });
    }
    return [
      {
        id: ALL_FILTER,
        label: COPY.items.allLocations,
        detail: formatInteger(inAccount?.length ?? 0),
      },
      ...[...counts].map(([id, { item, count }]) => {
        // With every account in view, each location names its owner: the full name and SteamID tail
        // in the list, and the tail (which never truncates) beside the location in the trigger.
        const owner = accountByKey.get(item.accountId);
        return {
          id,
          label: item.locationName,
          detail: formatInteger(count),
          hint: isAll && owner ? accountNameWithId(owner) : undefined,
          triggerDetail: isAll ? accountIdSuffix(item.accountId) : undefined,
        };
      }),
    ];
  }, [inAccount, accountByKey, isAll]);
  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of inAccount ?? [])
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return [
      { id: ALL_FILTER, label: COPY.items.allTypes, detail: formatInteger(inAccount?.length ?? 0) },
      ...[...counts]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, count]) => ({ id, label: id, detail: formatInteger(count) })),
    ];
  }, [inAccount]);
  const location = validFilter(locationPick, locationOptions);
  const type = validFilter(typePick, typeOptions);
  const rows = useMemo(
    () =>
      inAccount?.filter(
        (i) =>
          (location === ALL_FILTER || locationKey(i) === location) &&
          (type === ALL_FILTER || i.category === type) &&
          (!highlightsOnly || itemHighlights(i).reasons.length > 0) &&
          matchesItem(i, deferred, accountTextOf(i.accountId)),
      ),
    [inAccount, location, type, highlightsOnly, deferred, accountTextOf],
  );

  // Only rows on screen count as selected: a filter that hides a row also drops it from the move.
  const selectedItems = useMemo(
    () => (rows ?? []).filter((i) => selected.has(itemRowKey(i))),
    [rows, selected],
  );
  const visibleSelected = useMemo(() => new Set(selectedItems.map(itemRowKey)), [selectedItems]);
  const filtered =
    deferred.trim() !== "" ||
    accountFilter !== ALL_FILTER ||
    location !== ALL_FILTER ||
    type !== ALL_FILTER ||
    highlightsOnly;
  function clearFilters() {
    setQuery("");
    setAccountFilter(ALL_FILTER);
    setLocation(ALL_FILTER);
    setType(ALL_FILTER);
    setHighlightsOnly(false);
  }

  // Moves act on one account: its own units are the destinations. Mixed selections are refused by the bar.
  const selectedBusy = selectedItems.some(
    (i) => accountByKey.get(i.accountId)?.snapshot.transfer.status === "running",
  );
  const selectedAccount = accountByKey.get(selectedItems[0]?.accountId ?? "");
  const transferUnits = selectedAccount?.snapshot.units ?? [];
  const selectedAccountName = selectedAccount ? accountNameWithId(selectedAccount) : undefined;

  return (
    <>
      <PageHeader
        title={COPY.items.title}
        description={COPY.items.description}
        account={accountLabel}
      >
        <div className={ITEMS_PAGE.controlsClass}>
          {rows && data.status === "ready" && (
            <ExportItems items={rows} currency={data.data.currency} />
          )}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={COPY.common.searchPlaceholder}
            aria-label={COPY.common.searchPlaceholder}
            className={ITEMS_PAGE.searchClass}
          />
          {isAll && (
            <Select
              value={accountFilter}
              ariaLabel={COPY.items.accountFilterLabel}
              className={ITEMS_PAGE.accountSelectClass}
              options={accountOptions}
              onChange={(id) => {
                setAccountFilter(id);
                setLocation(ALL_FILTER);
              }}
            />
          )}
          <Select
            value={location}
            ariaLabel={COPY.itemColumns.location}
            className={ITEMS_PAGE.selectClass}
            listMinWidth={isAll ? ITEMS_PAGE.locationListMinWidth : undefined}
            options={locationOptions}
            onChange={setLocation}
          />
          <Select
            value={type}
            ariaLabel={COPY.itemColumns.type}
            className={ITEMS_PAGE.selectClass}
            options={typeOptions}
            onChange={setType}
          />
          <div className={ITEMS_PAGE.togglesClass}>
            <Button
              aria-pressed={highlightsOnly}
              onClick={() => setHighlightsOnly((on) => !on)}
              className={ITEMS_PAGE.highlightsToggleClass}
            >
              <Gem
                size={ITEMS_PAGE.iconSize}
                aria-hidden
                className={highlightsOnly ? "text-accent-strong" : "text-muted-foreground"}
              />
              {COPY.items.highlightsOnly}
            </Button>
            <TiersHelp />
            <ViewToggle value={view} onChange={setView} />
          </div>
        </div>
      </PageHeader>
      {data.status === "loading" && (
        <LoadingRegion className="flex min-h-0 flex-1 flex-col">
          <ItemTableSkeleton selectable showAccount={isAll} />
        </LoadingRegion>
      )}
      {data.status === "error" && (
        <LoadError message={data.message} onRetry={data.retry} retrying={data.retrying} />
      )}
      <Reveal open={selectedItems.length > 0}>
        {selectedItems.length > 0 && (
          <TransferBar
            selected={selectedItems}
            units={transferUnits}
            accountName={accounts.length > 1 ? selectedAccountName : undefined}
            busy={selectedBusy}
            onClear={() => setSelected(new Set())}
          />
        )}
      </Reveal>
      {rows && data.status === "ready" && rows.length === 0 && filtered ? (
        <FilteredEmpty
          title={highlightsOnly ? COPY.items.noHighlightMatches : COPY.items.noMatches}
          body={COPY.items.noMatchesBody}
          actionLabel={COPY.items.clearFilters}
          onAction={clearFilters}
        />
      ) : rows && data.status === "ready" && rows.length === 0 ? (
        <p className="text-muted-foreground">{COPY.items.noItems}</p>
      ) : (
        rows &&
        data.status === "ready" && (
          <ItemCollection
            view={view}
            items={rows}
            currency={data.data.currency}
            accountNames={accountNames}
            selected={visibleSelected}
            onSelectionChange={setSelected}
          />
        )
      )}
    </>
  );
}
