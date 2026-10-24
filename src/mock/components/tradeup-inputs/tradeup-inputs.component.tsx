import { Button } from "~/components/button/button.component";
import { ItemCell } from "~/components/item-cell/item-cell.component";
import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { Panel } from "~/components/panel/panel.component";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatFloat, formatMoney } from "~/utils/format";
import { TRADEUP_INPUTS } from "./tradeup-inputs.config";
import type { TradeUpInputsProps } from "./tradeup-inputs.types";

/** Input slots on top, then every skin you can add, cheapest first. */
export function TradeUpInputs({
  candidates,
  selectedIds,
  inputCount,
  currency,
  onToggle,
  onAutoFill,
  onClear,
}: TradeUpInputsProps) {
  const copy = COPY.tradeup;
  const selected = candidates.filter((c) => selectedIds.has(c.id));
  const full = selected.length >= inputCount;
  const lockedStatTrak = selected[0]?.isStatTrak;
  return (
    <Panel
      title={`${copy.inputs} · ${selected.length}/${inputCount}`}
      action={
        <div className="flex gap-2">
          <Button small onClick={onAutoFill} disabled={candidates.length === 0}>
            {copy.autoFill}
          </Button>
          <Button small variant="ghost" onClick={onClear} disabled={selected.length === 0}>
            {copy.clear}
          </Button>
        </div>
      }
    >
      <ul className="mb-3 flex flex-wrap gap-2">
        {Array.from({ length: inputCount }, (_, slot) => {
          const item = selected[slot];
          return (
            <li key={slot}>
              {item ? (
                <button
                  type="button"
                  title={`${item.name} · ${copy.remove}`}
                  onClick={() => onToggle(item.id)}
                >
                  <ItemThumb
                    imageUrl={item.imageUrl}
                    rarityColor={item.rarityColor}
                    size={TRADEUP_INPUTS.slotSize}
                  />
                </button>
              ) : (
                <span
                  className="block rounded-md border border-dashed"
                  style={{ width: TRADEUP_INPUTS.slotSize, height: TRADEUP_INPUTS.slotSize }}
                />
              )}
            </li>
          );
        })}
      </ul>
      {candidates.length === 0 ? (
        <p className="text-muted-foreground">{copy.noCandidates}</p>
      ) : (
        <ul className={cn("flex flex-col overflow-y-auto", TRADEUP_INPUTS.listMaxHeightClass)}>
          {candidates.map((item) => {
            const isSelected = selectedIds.has(item.id);
            const disabled =
              !isSelected &&
              (full || (lockedStatTrak !== undefined && item.isStatTrak !== lockedStatTrak));
            return (
              <li key={item.id}>
                <label
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-md px-2 py-1.5 hover:bg-muted/50",
                    isSelected && "bg-muted/60",
                    disabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    disabled={disabled}
                    onChange={() => onToggle(item.id)}
                  />
                  <div className="min-w-0 flex-1">
                    <ItemCell item={item} />
                  </div>
                  <span className="tabular w-16 shrink-0 text-right text-muted-foreground">
                    {item.wear === null ? COPY.common.empty : formatFloat(item.wear)}
                  </span>
                  <span className="w-28 shrink-0 truncate text-right text-xs text-muted-foreground">
                    {item.locationName}
                  </span>
                  <span className="tabular w-20 shrink-0 text-right">
                    {item.price === null ? COPY.common.empty : formatMoney(item.price, currency)}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}
