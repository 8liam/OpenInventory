import { Button } from "~/components/button/button.component";
import { ItemCell } from "~/components/item-cell/item-cell.component";
import { ItemInspectButton } from "~/components/item-inspect/item-inspect.component";
import { Panel } from "~/components/panel/panel.component";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatMoney } from "~/utils/format";
import type { TradeUpInlineInputsProps } from "./tradeup-demo.types";

/** The cropped panel's inputs: name and price only, so every skin name reads in full. */
export function TradeUpInlineInputs({
  candidates,
  selectedIds,
  inputCount,
  currency,
  onToggle,
  onAutoFill,
  onClear,
}: TradeUpInlineInputsProps) {
  const copy = COPY.tradeup;
  const selected = candidates.filter((c) => selectedIds.has(c.id)).length;
  return (
    <Panel
      title={`${copy.inputs} · ${selected}/${inputCount}`}
      action={
        <div className="flex gap-2">
          <Button small onClick={onAutoFill}>
            {copy.autoFill}
          </Button>
          <Button small variant="ghost" onClick={onClear} disabled={selected === 0}>
            {copy.clear}
          </Button>
        </div>
      }
    >
      <ul className="flex flex-col">
        {candidates.map((item) => {
          const isSelected = selectedIds.has(item.id);
          const disabled = !isSelected && selected >= inputCount;
          return (
            <li
              key={item.id}
              className={cn(
                "flex items-center gap-x-3 border-b px-2 last:border-0 hover:bg-muted",
                isSelected && "bg-muted/60",
              )}
            >
              <label
                className={cn(
                  "grid min-w-0 flex-1 cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-x-3 py-2",
                  disabled && "cursor-not-allowed opacity-40",
                )}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  disabled={disabled}
                  onChange={() => onToggle(item.id)}
                />
                <ItemCell item={item} currency={currency} nameFit="wrap" />
                <span className="tabular shrink-0 text-right">
                  {item.price === null ? COPY.common.empty : formatMoney(item.price, currency)}
                </span>
              </label>
              <div className="flex w-6 shrink-0">
                <ItemInspectButton item={item} currency={currency} />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}
