import { bandWidth, floatPosition, floatRangeSpan } from "~/lib/items/float-bar";
import { WEAR_BANDS } from "~/lib/items/float-bar.config";
import { cn } from "~/utils/cn";
import { FLOAT_BAR } from "./float-bar.config";
import type { FloatBarProps } from "./float-bar.types";

const { classes } = FLOAT_BAR;

/** A 0..1 wear scale split into the CS wear bands, with the skin's own range shaded and the float marked. */
export function FloatBar({ value, minWear, maxWear, valueText, className }: FloatBarProps) {
  const range = floatRangeSpan(minWear, maxWear);
  return (
    <div className={cn(classes.root, className)}>
      <div
        role="meter"
        aria-label={FLOAT_BAR.label}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={value}
        aria-valuetext={valueText}
        className={classes.track}
      >
        <div className={classes.clip}>
          {WEAR_BANDS.map((band) => (
            <span
              key={band.id}
              className={cn(classes.segment, FLOAT_BAR.bandClass[band.id])}
              style={{ width: `${bandWidth(band)}%` }}
            />
          ))}
          {range !== null && (
            <>
              <span className={classes.dim} style={{ left: 0, width: `${range.start}%` }} />
              <span className={classes.dim} style={{ right: 0, width: `${100 - range.end}%` }} />
            </>
          )}
        </div>
        {range !== null && (
          <span
            className={classes.range}
            style={{ left: `${range.start}%`, width: `${range.end - range.start}%` }}
          />
        )}
        <span className={classes.marker} style={{ left: `${floatPosition(value)}%` }} />
      </div>
      <div aria-hidden className={classes.labels}>
        {WEAR_BANDS.map((band) => (
          <span
            key={band.id}
            className={classes.labelCell}
            style={{ width: `${bandWidth(band)}%` }}
          >
            {band.short}
          </span>
        ))}
      </div>
    </div>
  );
}
