import { AlertTriangle, CircleX } from "lucide-react";
import { useId } from "react";
import { COPY } from "~/lib/copy/copy.config";
import { ItemThumb } from "~/components/item-thumb/item-thumb.component";
import { Skeleton } from "~/components/skeleton/skeleton.component";
import { UnitName } from "~/components/unit-name/unit-name.component";
import { cn } from "~/utils/cn";
import { formatInteger, formatMoney } from "~/utils/format";
import { formatCount } from "~/utils/plural";
import { UNIT_CARD } from "./unit-card.config";
import type { CrateDotsProps, UnitCardProps } from "./unit-card.types";

const { classes, crate, labels } = UNIT_CARD;

/** 1,000 slots as a dot grid, drawn with two patterns instead of a node per slot. */
function CrateDots({ count }: CrateDotsProps) {
  const id = useId();
  const rows = Math.ceil(crate.capacity / crate.columns);
  const used = Math.min(Math.max(count, 0), crate.capacity);
  const fullRows = Math.floor(used / crate.columns);
  const partial = used % crate.columns;
  const dot = (className: string, patternId: string) => (
    <pattern id={patternId} width={1} height={1} patternUnits="userSpaceOnUse">
      <circle cx={0.5} cy={0.5} r={crate.dotRadius} className={className} />
    </pattern>
  );
  return (
    <svg
      viewBox={`0 0 ${crate.columns} ${rows}`}
      className={classes.dots}
      role="img"
      aria-label={labels.slots(used, crate.capacity)}
    >
      <defs>
        {dot(classes.empty, `${id}e`)}
        {dot(classes.stored, `${id}s`)}
      </defs>
      <rect width={crate.columns} height={rows} fill={`url(#${id}e)`} />
      {fullRows > 0 && <rect width={crate.columns} height={fullRows} fill={`url(#${id}s)`} />}
      {partial > 0 && <rect y={fullRows} width={partial} height={1} fill={`url(#${id}s)`} />}
    </svg>
  );
}

export function UnitCard({
  unit,
  items,
  currency,
  selected,
  loading = false,
  onSelect,
  onRename,
}: UnitCardProps) {
  const value = items.reduce((sum, item) => sum + (item.price ?? 0), 0);
  const preview = [...items]
    .sort((a, b) => (b.price ?? 0) - (a.price ?? 0))
    .filter((i) => i.imageUrl)
    .slice(0, UNIT_CARD.previewCount);
  const full = unit.itemCount >= crate.capacity;
  const nearlyFull = !full && unit.itemCount >= crate.capacity * crate.warnRatio;
  return (
    <div className={cn(classes.root, UNIT_CARD.widthClass, selected && classes.selected)}>
      {/* The select target covers the card; the rename control sits above it. */}
      <button
        type="button"
        onClick={onSelect}
        aria-pressed={selected}
        aria-label={unit.name}
        className={classes.hit}
      />
      <div className={classes.header}>
        <div className="min-w-0">
          <UnitName name={unit.name} onRename={onRename} />
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatCount(unit.itemCount, COPY.storage.items)}
          </p>
        </div>
        {loading ? (
          <Skeleton className="h-lh w-16 shrink-0" />
        ) : (
          <p className={classes.value}>
            {unit.loaded ? formatMoney(value, currency) : COPY.common.empty}
          </p>
        )}
      </div>
      <CrateDots count={unit.itemCount} />
      <div className={classes.footer}>
        <span className={cn(classes.capacity, nearlyFull && classes.warn, full && classes.full)}>
          {full && <CircleX size={crate.iconSize} aria-hidden />}
          {nearlyFull && <AlertTriangle size={crate.iconSize} aria-hidden />}
          {labels.capacity(formatInteger(unit.itemCount), formatInteger(crate.capacity))}
          {full && <span className="font-sans">{labels.full}</span>}
          {nearlyFull && <span className="sr-only">{labels.nearlyFull}</span>}
        </span>
        {loading && unit.itemCount > 0 && (
          <span className={classes.thumbs}>
            {Array.from({ length: Math.min(unit.itemCount, UNIT_CARD.previewCount) }, (_, slot) => (
              <Skeleton
                key={slot}
                className="rounded-sm"
                style={{ width: UNIT_CARD.thumbSize, height: UNIT_CARD.thumbSize }}
              />
            ))}
          </span>
        )}
        {!loading && preview.length > 0 && (
          <span className={classes.thumbs}>
            {preview.map((item) => (
              <ItemThumb
                key={item.id}
                imageUrl={item.imageUrl}
                rarityColor={item.rarityColor}
                size={UNIT_CARD.thumbSize}
              />
            ))}
          </span>
        )}
      </div>
    </div>
  );
}
