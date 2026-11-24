import { ChevronDown, ChevronUp } from "lucide-react";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatSignedMoney } from "~/utils/format";
import { CHANGE_LINE } from "./change-line.config";
import type { ChangeLineProps } from "./change-line.types";

const { classes } = CHANGE_LINE;

/** Value movement over each known window: a sign, an icon and a period. Success green, never lime. */
export function ChangeLine({ change, currency }: ChangeLineProps) {
  const entries = [
    [COPY.dashboard.change.day, change.day],
    [COPY.dashboard.change.week, change.week],
    [COPY.dashboard.change.month, change.month],
  ] as const;
  const known = entries.filter(([, value]) => value !== null);
  if (known.length === 0) return null;
  return (
    <div className={classes.root}>
      {known.map(([label, value]) => {
        const up = (value ?? 0) >= 0;
        const Arrow = up ? ChevronUp : ChevronDown;
        return (
          <span key={label} className={cn(classes.entry, up ? classes.up : classes.down)}>
            <Arrow size={CHANGE_LINE.iconSize} strokeWidth={CHANGE_LINE.iconStroke} aria-hidden />
            {formatSignedMoney(value ?? 0, currency)}
            <span className={classes.label}>{label}</span>
          </span>
        );
      })}
    </div>
  );
}
