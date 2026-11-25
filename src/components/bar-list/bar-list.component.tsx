import { cn } from "~/utils/cn";
import { formatInteger, formatMoney, formatPercentPlain } from "~/utils/format";
import { BAR_LIST } from "./bar-list.config";
import type { BarListProps } from "./bar-list.types";

const { classes } = BAR_LIST;

/** Ranked rows: label and value on one line, a thin share bar beneath. */
export function BarList({
  slices,
  currency,
  limit = BAR_LIST.defaultLimit,
  showValue = true,
  activeLabel,
  onActiveChange,
}: BarListProps) {
  const total = slices.reduce((sum, s) => sum + s.value, 0);
  const max = Math.max(...slices.map((s) => s.value), 0);
  return (
    <ul className={classes.list}>
      {slices.slice(0, limit).map((slice, index) => {
        const color = slice.color ?? BAR_LIST.fallbackColor;
        return (
          <li
            // Labels can repeat in raw data, so the position keeps keys unique.
            key={`${index}:${slice.label}`}
            className={cn(
              classes.item,
              onActiveChange && classes.itemInteractive,
              activeLabel !== undefined && activeLabel !== slice.label && classes.itemDimmed,
            )}
            tabIndex={onActiveChange ? 0 : undefined}
            onPointerEnter={onActiveChange && (() => onActiveChange(slice.label))}
            onPointerLeave={onActiveChange && (() => onActiveChange(undefined))}
            onFocus={onActiveChange && (() => onActiveChange(slice.label))}
            onBlur={onActiveChange && (() => onActiveChange(undefined))}
          >
            <div className={classes.row}>
              <span className={classes.labelGroup}>
                <span aria-hidden className={classes.tick} style={{ background: color }} />
                <span className={classes.label}>{slice.label}</span>
                {showValue && (
                  <>
                    <span className={classes.separator}>{BAR_LIST.separator}</span>
                    <span className={classes.count}>{formatInteger(slice.count)}</span>
                  </>
                )}
              </span>
              <span className={classes.figures}>
                {showValue ? formatMoney(slice.value, currency) : formatInteger(slice.count)}
                <span className={classes.separator}>{BAR_LIST.separator}</span>
                <span className={classes.share}>
                  {formatPercentPlain(total > 0 ? slice.value / total : 0)}
                </span>
              </span>
            </div>
            <div className={classes.track}>
              <div
                className={classes.bar}
                style={{
                  width: `${max > 0 ? (slice.value / max) * 100 : 0}%`,
                  background: color,
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
