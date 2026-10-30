import { useCallback, useEffect, useRef, useState } from 'react';
import { INVENTORY_MOCK, UNITS_MOCK } from '~/data/inventory.mock';
import { setTransferHandler } from '~/data/transfer.mock';
import { INVENTORY_LOCATION_ID, type ItemView } from '~/lib/items/item.types';
import type { StorageUnit, TransferRequest } from '~/lib/storage/storage.types';

export const TRANSFER_STEP_MS = 180;

export type DemoTransfer =
  | { readonly status: 'idle' }
  | { readonly status: 'running'; readonly total: number; readonly done: number; readonly fromName: string; readonly toName: string }
  | { readonly status: 'finished'; readonly total: number; readonly fromName: string; readonly toName: string };

/** Local, in-browser inventory: a "move" really reassigns items, but nothing is ever sent anywhere. */
export function useDemoInventory() {
  const [items, setItems] = useState<readonly ItemView[]>(INVENTORY_MOCK);
  const [units, setUnits] = useState<readonly StorageUnit[]>(UNITS_MOCK);
  const [transfer, setTransfer] = useState<DemoTransfer>({ status: 'idle' });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const nameOf = useCallback(
    (id: string) => (id === INVENTORY_LOCATION_ID ? 'Inventory' : (units.find((u) => u.id === id)?.name ?? id)),
    [units],
  );

  useEffect(() => {
    setTransferHandler(async (request: TransferRequest) => {
      const ids = new Set(request.itemIds);
      const fromName = nameOf(request.from);
      const toName = nameOf(request.to);
      const total = ids.size;
      setTransfer({ status: 'running', total, done: 0, fromName, toName });
      await new Promise<void>((resolve) => {
        let done = 0;
        const step = () => {
          done = Math.min(total, done + Math.max(1, Math.ceil(total / 8)));
          setTransfer({ status: 'running', total, done, fromName, toName });
          if (done < total) timer.current = setTimeout(step, TRANSFER_STEP_MS);
          else resolve();
        };
        timer.current = setTimeout(step, TRANSFER_STEP_MS);
      });
      setItems((current) =>
        current.map((item) =>
          item.locationId === request.from && ids.has(item.id)
            ? { ...item, locationId: request.to, locationName: toName }
            : item,
        ),
      );
      setUnits((current) =>
        current.map((u) => ({
          ...u,
          itemCount: u.itemCount + (u.id === request.to ? total : 0) - (u.id === request.from ? total : 0),
        })),
      );
      setTransfer({ status: 'finished', total, fromName, toName });
    });
    return () => {
      setTransferHandler(undefined);
      clearTimeout(timer.current);
    };
  }, [nameOf]);

  const rename = useCallback(async (id: string, name: string) => {
    setUnits((current) => current.map((u) => (u.id === id ? { ...u, name } : u)));
    setItems((current) => current.map((i) => (i.locationId === id ? { ...i, locationName: name } : i)));
  }, []);

  return { items, units, transfer, rename, dismiss: () => setTransfer({ status: 'idle' }) };
}
