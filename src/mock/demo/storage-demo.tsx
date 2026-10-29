import { useMemo, useState } from 'react';
import { ItemTable } from '~/components/item-table/item-table.component';
import { PageHeader } from '~/components/page-header/page-header.component';
import { TransferBar } from '~/components/transfer-bar/transfer-bar.component';
import { UnitCard } from '~/components/unit-card/unit-card.component';
import { COPY } from '~/lib/copy/copy.config';
import { itemRowKey } from '~/lib/items/item-key';
import type { ItemView } from '~/lib/items/item.types';
import { MOCK_CURRENCY } from '~/data/mock.config';
import { formatInteger, formatMoney } from '~/utils/format';
import { DemoTransferStatus } from './demo-transfer-status';
import { useDemoInventory } from './use-demo-inventory';

/** The demo lists only the first items of a unit; the real app lists everything. */
const ROW_CAP = 12;

/** The real Storage units page body: unit cards with inline rename, the unit's table, and the move bar. */
export default function StorageDemo() {
  const { items, units, transfer, rename, dismiss } = useDemoInventory();
  const [selectedId, setSelectedId] = useState<string>();
  const [picked, setPicked] = useState<ReadonlySet<string>>(new Set());
  const copy = COPY.storage;

  const byUnit = useMemo(() => {
    const groups = new Map<string, ItemView[]>();
    for (const item of items) groups.set(item.locationId, [...(groups.get(item.locationId) ?? []), item]);
    return groups;
  }, [items]);

  const selected = units.find((u) => u.id === selectedId) ?? units[0];
  const selectedItems = selected ? (byUnit.get(selected.id) ?? []) : [];
  const pickedItems = selectedItems.filter((item) => picked.has(itemRowKey(item)));
  const selectedValue = selectedItems.reduce((sum, item) => sum + (item.price ?? 0), 0);

  return (
    <div className="oi-app flex h-[640px] flex-col gap-3 p-4">
      <PageHeader title={copy.title} description={copy.description} />
      <div className="flex min-h-0 flex-1 flex-col gap-3 md:flex-row">
        <div className="flex shrink-0 gap-2 overflow-hidden md:w-60 md:flex-col">
          {units.map((unit) => (
            <UnitCard
              key={unit.id}
              unit={unit}
              items={byUnit.get(unit.id) ?? []}
              currency={MOCK_CURRENCY}
              selected={selected?.id === unit.id}
              onRename={(name) => rename(unit.id, name)}
              onSelect={() => {
                setSelectedId(unit.id);
                setPicked(new Set());
              }}
            />
          ))}
        </div>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3">
          {selected && (
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">{selected.name}</span> · {formatInteger(selected.itemCount)} {copy.items} · {copy.value}{' '}
              <span className="tabular text-foreground">{formatMoney(selectedValue, MOCK_CURRENCY)}</span>
            </p>
          )}
          <DemoTransferStatus transfer={transfer} onDismiss={dismiss} />
          {pickedItems.length > 0 && (
            <TransferBar selected={pickedItems} units={units} busy={transfer.status === 'running'} onClear={() => setPicked(new Set())} />
          )}
          <ItemTable items={selectedItems.slice(0, ROW_CAP)} currency={MOCK_CURRENCY} showLocation={false} scrollable={false} selected={picked} onSelectionChange={setPicked} />
        </div>
      </div>
    </div>
  );
}
