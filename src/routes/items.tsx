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
import { PageHeader } from "~/components/page-header/page-header.component";
import { Select } from "~/components/select/select.component";
import {
  accountName,
  accountText,
  useAccountScope,
  useScopedPath,
} from "~/lib/accounts/account-scope.hooks";
import { ACCOUNT_LABELS } from "~/lib/accounts/accounts.config";
import { TiersHelp } from "~/components/tiers-help/tiers-help.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import { matchesItem } from "~/lib/items/item-search";
import { itemHighlights } from "~/lib/items/highlights";
import type { InventoryResponse } from "~/lib/items/item.types";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { useItemViewMode } from "~/lib/items/view-mode.store";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { cn } from "~/utils/cn";
import { formatInteger } from "~/utils/format";

export const Route = createFileRoute("/items")({
  // `?q=` pre-fills the search, e.g. when a dashboard row links here.
  validateSearch: (search: Record<string, unknown>): { q?: string } =>
    typeof search.q === "string" && search.q !== "" ? { q: search.q } : {},
  component: ItemsPage,
});

const ALL = "all";
const LABEL_PREFIX = "label:";

/** Location ids repeat across accounts (every inventory is "inventory"), so filters key on both. */
const locationKey = (item: { readonly accountId: string; readonly locationId: string }) =>
  `${item.accountId}:${item.locationId}`;
const SELECT_WIDTH = "min-w-0 flex-1 sm:w-48 sm:flex-none";

function ItemsPage() {
  const { q: linkedQuery = "" } = Route.useSearch();
  const snapshot = useStorageSnapshot();
  const { mode: view, setMode: setView } = useItemViewMode();
  const priceQuery = usePriceQuery();
  const { accounts, scoped, isAll } = useAccountScope();
  const data = useRemoteData<InventoryResponse>(
    useScopedPath(`${STORAGE_API.items}?${priceQuery}`),
    snapshot.revision,
  );
  const [query, setQuery] = useState(linkedQuery);
  // A new link (or back/forward) replaces what was typed; typing never rewrites the URL.
  const [appliedQuery, setAppliedQuery] = useState(linkedQuery);
  if (appliedQuery !== linkedQuery) {
    setAppliedQuery(linkedQuery);
    setQuery(linkedQuery);
  }
  const [accountFilter, setAccountFilter] = useState(ALL);
  const [location, setLocation] = useState(ALL);
  const [type, setType] = useState(ALL);
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
    () => (isAll ? new Map(accounts.map((a) => [a.steamId, accountName(a)])) : undefined),
    [accounts, isAll],
  );
  const accountOptions = useMemo(() => {
    const usedLabels = ACCOUNT_LABELS.filter((label) => scoped.some((a) => a.label === label));
    return [
      { id: ALL, label: COPY.accounts.filterAll },
      ...usedLabels.map((label) => ({
        id: `${LABEL_PREFIX}${label}`,
        label: COPY.accounts.filterLabel(COPY.accounts.labels[label]),
      })),
      ...scoped.map((a) => ({ id: a.steamId, label: accountName(a) })),
    ];
  }, [scoped]);
  // Account and label filters narrow the rows first, so the location and type counts below match what is shown.
  const inAccount = useMemo(
    () =>
      items?.filter((i) => {
        if (accountFilter === ALL) return true;
        if (accountFilter.startsWith(LABEL_PREFIX))
          return accountByKey.get(i.accountId)?.label === accountFilter.slice(LABEL_PREFIX.length);
        return i.accountId === accountFilter;
      }),
    [items, accountFilter, accountByKey],
  );

  const locationOptions = useMemo(() => {
    const counts = new Map<string, { name: string; count: number }>();
    for (const item of inAccount ?? []) {
      // Location ids repeat across accounts ("inventory"), so each account's get their own row.
      const id = locationKey(item);
      const known = counts.get(id);
      if (known) known.count += 1;
      else
        counts.set(id, {
          name: accountNames
            ? `${accountNames.get(item.accountId)} · ${item.locationName}`
            : item.locationName,
          count: 1,
        });
    }
    return [
      { id: ALL, label: COPY.items.allLocations, detail: formatInteger(inAccount?.length ?? 0) },
      ...[...counts].map(([id, { name, count }]) => ({
        id,
        label: name,
        detail: formatInteger(count),
      })),
    ];
  }, [inAccount, accountNames]);
  const typeOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of inAccount ?? [])
      counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
    return [
      { id: ALL, label: COPY.items.allTypes, detail: formatInteger(inAccount?.length ?? 0) },
      ...[...counts]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([id, count]) => ({ id, label: id, detail: formatInteger(count) })),
    ];
  }, [inAccount]);
  const rows = useMemo(
    () =>
      inAccount?.filter(
        (i) =>
          (location === ALL || locationKey(i) === location) &&
          (type === ALL || i.category === type) &&
          (!highlightsOnly || itemHighlights(i).reasons.length > 0) &&
          matchesItem(i, deferred, accountTextOf(i.accountId)),
      ),
    [inAccount, location, type, highlightsOnly, deferred, accountTextOf],
  );

  const selectedItems = useMemo(
    () => (items ?? []).filter((i) => selected.has(itemRowKey(i))),
    [items, selected],
  );

  // Moves act on one account: its own units are the destinations. Mixed selections are refused by the bar.
  const selectedBusy = selectedItems.some(
    (i) => accountByKey.get(i.accountId)?.snapshot.transfer.status === "running",
  );
  const transferUnits = accountByKey.get(selectedItems[0]?.accountId ?? "")?.snapshot.units ?? [];

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
        {isAll && (
          <Select
            value={accountFilter}
            ariaLabel={COPY.accounts.column}
            className={SELECT_WIDTH}
            options={accountOptions}
            onChange={(id) => {
              setAccountFilter(id);
              setLocation(ALL);
            }}
          />
        )}
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
        <button
          type="button"
          aria-pressed={highlightsOnly}
          onClick={() => setHighlightsOnly((on) => !on)}
          className={cn(
            "flex h-8 shrink-0 items-center gap-1.5 rounded-md bg-muted px-2.5 text-xs text-muted-foreground transition-colors hover:text-foreground",
            highlightsOnly && "bg-card font-medium text-foreground shadow-sm",
          )}
        >
          <Gem size={14} aria-hidden className={highlightsOnly ? "text-accent" : undefined} />
          {COPY.items.highlightsOnly}
        </button>
        <TiersHelp />
        <ViewToggle value={view} onChange={setView} />
      </PageHeader>
      {data.status === "loading" && (
        <LoadingRegion className="flex min-h-0 flex-1 flex-col">
          <ItemTableSkeleton selectable />
        </LoadingRegion>
      )}
      {data.status === "error" && <LoadError message={data.message} onRetry={data.retry} />}
      <Reveal open={selectedItems.length > 0}>
        {selectedItems.length > 0 && (
          <TransferBar
            selected={selectedItems}
            units={transferUnits}
            accountName={
              accounts.length > 1 ? accountTextOf(selectedItems[0]?.accountId ?? "") : undefined
            }
            busy={selectedBusy}
            onClear={() => setSelected(new Set())}
          />
        )}
      </Reveal>
      {rows && data.status === "ready" && (
        <ItemCollection
          view={view}
          items={rows}
          currency={data.data.currency}
          accountNames={accountNames}
          selected={selected}
          onSelectionChange={setSelected}
        />
      )}
    </>
  );
}
