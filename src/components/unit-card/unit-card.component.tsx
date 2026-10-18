import { COPY } from "~/lib/copy/copy.config";
import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { UnitName } from "~/components/unit-name/unit-name.component";
import { cn } from "~/utils/cn";
import { formatInteger, formatMoney } from "~/utils/format";
import { UNIT_CARD } from "./unit-card.config";
import type { UnitCardProps } from "./unit-card.types";

export function UnitCard({ unit, items, currency, selected, onSelect, onRename }: UnitCardProps) {
  const value = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const preview = [...items]
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .filter((i) => i.imageUrl)
    .slice(0, UNIT_CARD.previewCount);
  return (
    <div
      className={cn(
        "relative w-60 shrink-0 rounded-lg border bg-card p-3.5 text-left transition-colors hover:bg-accent md:w-full",
        selected && "border-primary/60 bg-accent",
      )}
    >
      {/* The select target covers the card; the rename control sits above it. */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={unit.name}
        className="absolute inset-0 rounded-lg"
      />
      <div className="pointer-events-none relative flex items-start justify-between gap-3">
        <div className="min-w-0">
          <UnitName name={unit.name} onRename={onRename} />
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatInteger(unit.itemCount)} {COPY.storage.items}
          </p>
        </div>
        <p className="tabular shrink-0 font-medium">
          {unit.loaded ? formatMoney(value, currency) : COPY.common.empty}
        </p>
      </div>
      {preview.length > 0 && (
        <div className="pointer-events-none relative mt-3 flex gap-1.5">
          {preview.map((item) => (
            <ItemThumb
              key={item.id}
              imageUrl={item.imageUrl}
              rarityColor={item.rarityColor}
              size={40}
            />
          ))}
        </div>
      )}
    </div>
  );
}
