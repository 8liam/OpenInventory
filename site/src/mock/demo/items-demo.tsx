import { ChevronsUpDown } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ItemTable } from "~/components/item-table/item-table.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { TransferBar } from "~/components/transfer-bar/transfer-bar.component";
import { COPY } from "~/lib/copy/copy.config";
import { itemRowKey } from "~/lib/items/item-key";
import { MOCK_CURRENCY } from "@demo/data/mock.config";
import { DemoTransferStatus } from "./demo-transfer-status";
import { useDemoInventory } from "./use-demo-inventory";

const ALL = "all";
/** The demo shows only the first matches; the real app lists everything. */
const ROW_CAP = 12;
/**
 * Native selects dressed as the app's Select trigger. The app's own Select places its list with
 * `position: fixed`, which lands in the wrong spot inside the scaled demo panels.
 */
const SELECT_WRAP_CLASS = "relative min-w-0 flex-1 sm:w-48 sm:flex-none";
const SELECT_CLASS =
  "h-8 w-full appearance-none rounded-md border border-control bg-background pl-2.5 pr-7 text-foreground transition-colors hover:bg-muted";
const SELECT_ICON_CLASS =
  "pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground";
const SELECT_ICON_SIZE = 14;

/** The real Items page body: search, filters, sortable table and the move bar, on sample data. */
export default function ItemsDemo() {
  const { items, units, transfer, dismiss } = useDemoInventory();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState(ALL);
  const [type, setType] = useState(ALL);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const deferred = useDeferredValue(query.trim().toLowerCase());

  const locations = useMemo(
    () => [...new Map(items.map((i) => [i.locationId, i.locationName]))],
    [items],
  );
  const types = useMemo(() => [...new Set(items.map((i) => i.category))].sort(), [items]);
  const rows = useMemo(
    () =>
      items.filter(
        (i) =>
          (location === ALL || i.locationId === location) &&
          (type === ALL || i.category === type) &&
          (!deferred ||
            i.name.toLowerCase().includes(deferred) ||
            (i.customName?.toLowerCase().includes(deferred) ?? false)),
      ),
    [items, location, type, deferred],
  );
  const visible = useMemo(() => rows.slice(0, ROW_CAP), [rows]);
  const selectedItems = useMemo(
    () => items.filter((i) => selected.has(itemRowKey(i))),
    [items, selected],
  );

  return (
    <div className="oi-app flex h-[640px] flex-col gap-3 p-4">
      <PageHeader title={COPY.items.title} description={COPY.items.description}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={COPY.common.searchPlaceholder}
          aria-label={COPY.common.searchPlaceholder}
          className="h-8 w-full rounded-md border border-input bg-card px-2.5 outline-none placeholder:text-muted-foreground focus:border-primary sm:w-44"
        />
        <div className={SELECT_WRAP_CLASS}>
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
          <ChevronsUpDown size={SELECT_ICON_SIZE} className={SELECT_ICON_CLASS} aria-hidden />
        </div>
        <div className={SELECT_WRAP_CLASS}>
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
          <ChevronsUpDown size={SELECT_ICON_SIZE} className={SELECT_ICON_CLASS} aria-hidden />
        </div>
      </PageHeader>
      <DemoTransferStatus transfer={transfer} onDismiss={dismiss} />
      {selectedItems.length > 0 && (
        <TransferBar
          selected={selectedItems}
          units={units}
          busy={transfer.status === "running"}
          onClear={() => setSelected(new Set())}
        />
      )}
      <ItemTable
        items={visible}
        currency={MOCK_CURRENCY}
        selected={selected}
        onSelectionChange={setSelected}
      />
    </div>
  );
}
