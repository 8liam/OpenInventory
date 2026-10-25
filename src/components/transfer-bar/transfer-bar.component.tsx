import { useMemo, useState } from "react";
import { Button } from "~/components/button/button.component";
import { Select } from "~/components/select/select.component";
import { INVENTORY_LOCATION_ID } from "~/lib/items/item.types";
import { postJson } from "~/lib/storage/storage.client";
import { STORAGE_API, STORAGE_LIMITS } from "~/lib/storage/storage.config";
import type { TransferRequest } from "~/lib/storage/storage.types";
import { TRANSFER_BAR } from "./transfer-bar.config";
import type { TransferBarProps } from "./transfer-bar.types";

const INVENTORY_LABEL = "Inventory";

export function TransferBar({ selected, units, busy, onClear }: TransferBarProps) {
  const [destination, setDestination] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string>();
  const [submitting, setSubmitting] = useState(false);

  const sources = useMemo(() => new Set(selected.map((item) => item.locationId)), [selected]);
  const from = sources.size === 1 ? [...sources][0] : undefined;
  const count = selected.length;

  const options = useMemo(() => {
    const list: { id: string; label: string; disabled: boolean }[] = [];
    if (from !== INVENTORY_LOCATION_ID)
      list.push({ id: INVENTORY_LOCATION_ID, label: INVENTORY_LABEL, disabled: false });
    for (const unit of units) {
      if (unit.id === from) continue;
      const full = unit.itemCount + count > STORAGE_LIMITS.unitCapacity;
      list.push({
        id: unit.id,
        label: `${unit.name} (${unit.itemCount}/${STORAGE_LIMITS.unitCapacity})${full ? ` · ${TRANSFER_BAR.unitFull}` : ""}`,
        disabled: full,
      });
    }
    return list;
  }, [units, from, count]);

  const nameOf = (id: string) =>
    options.find((o) => o.id === id)?.label.replace(/ \(\d+\/\d+\).*$/, "") ?? id;
  const fromName =
    from === INVENTORY_LOCATION_ID
      ? INVENTORY_LABEL
      : (units.find((u) => u.id === from)?.name ?? "");
  const unitToUnit =
    from !== undefined &&
    from !== INVENTORY_LOCATION_ID &&
    destination !== "" &&
    destination !== INVENTORY_LOCATION_ID;
  const blocker =
    from === undefined
      ? TRANSFER_BAR.mixed
      : count > STORAGE_LIMITS.maxItemsPerTransfer
        ? TRANSFER_BAR.tooMany(STORAGE_LIMITS.maxItemsPerTransfer)
        : busy
          ? TRANSFER_BAR.busy
          : undefined;
  const selectedOption = options.find((o) => o.id === destination);
  const validDestination = selectedOption !== undefined && !selectedOption.disabled;

  async function submit() {
    if (from === undefined || !validDestination) return;
    setSubmitting(true);
    setError(undefined);
    try {
      const request: TransferRequest = {
        from,
        to: destination,
        itemIds: selected.map((item) => item.id),
      };
      await postJson(STORAGE_API.transfer, request);
      setConfirming(false);
      setDestination("");
      onClear();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="flex shrink-0 flex-col gap-2 rounded-lg border bg-card px-4 py-3 shadow-sm"
      role="region"
      aria-label="Move items"
    >
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <span className="font-medium">{TRANSFER_BAR.selectedLabel(count)}</span>
        <button
          type="button"
          onClick={onClear}
          className="text-muted-foreground hover:text-foreground"
        >
          {TRANSFER_BAR.clear}
        </button>
        {!confirming && (
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-1 sm:flex-row sm:items-center sm:justify-end">
            <div className="flex items-center gap-2 text-muted-foreground sm:w-auto">
              <span className="hidden sm:inline">{TRANSFER_BAR.destination}</span>
              <Select
                value={destination}
                ariaLabel={TRANSFER_BAR.destination}
                disabled={blocker !== undefined}
                className="w-full sm:w-60"
                options={[
                  { id: "", label: TRANSFER_BAR.choose },
                  ...options.map((o) => ({ id: o.id, label: o.label, disabled: o.disabled })),
                ]}
                onChange={setDestination}
              />
            </div>
            <Button
              variant="primary"
              className="w-full sm:w-auto"
              disabled={blocker !== undefined || !validDestination}
              onClick={() => setConfirming(true)}
            >
              {TRANSFER_BAR.move}
            </Button>
          </div>
        )}
      </div>
      {blocker && <p className="text-xs text-muted-foreground">{blocker}</p>}
      {confirming && from !== undefined && (
        <div className="flex flex-col gap-2">
          <p>{TRANSFER_BAR.confirm(count, fromName, nameOf(destination))}</p>
          {unitToUnit && (
            <p className="text-xs text-muted-foreground">{TRANSFER_BAR.viaInventory}</p>
          )}
          <div className="flex gap-2">
            <Button variant="primary" disabled={submitting} onClick={() => void submit()}>
              {TRANSFER_BAR.confirmButton}
            </Button>
            <Button disabled={submitting} onClick={() => setConfirming(false)}>
              {TRANSFER_BAR.back}
            </Button>
          </div>
        </div>
      )}
      {error && (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
