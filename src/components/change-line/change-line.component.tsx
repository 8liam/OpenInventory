import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { COPY } from "~/lib/copy/copy.config";
import { cn } from "~/utils/cn";
import { formatSignedMoney } from "~/utils/format";
import type { ChangeLineProps } from "./change-line.types";

/** Value movement over each known window, as small up/down pills. */
export function ChangeLine({ change, currency }: ChangeLineProps) {
  const entries = [
    [COPY.dashboard.change.day, change.day],
    [COPY.dashboard.change.week, change.week],
    [COPY.dashboard.change.month, change.month],
  ] as const;
  const known = entries.filter(([, value]) => value !== null);
  if (known.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {known.map(([label, value]) => {
        const up = (value ?? 0) >= 0;
        const Arrow = up ? ArrowUpRight : ArrowDownRight;
        return (
          <span
            key={label}
            className={cn(
              "tabular inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
              up ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            <Arrow size={12} />
            {formatSignedMoney(value ?? 0, currency)}
            <span className="text-muted-foreground">{label}</span>
          </span>
        );
      })}
    </div>
  );
}
