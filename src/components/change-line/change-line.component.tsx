import { COPY } from "~/lib/copy/copy.config";
import { formatSignedMoney } from "~/utils/format";
import type { ChangeLineProps } from "./change-line.types";

export function ChangeLine({ change, currency }: ChangeLineProps) {
  const entries = [
    [COPY.dashboard.change.day, change.day],
    [COPY.dashboard.change.week, change.week],
    [COPY.dashboard.change.month, change.month],
  ] as const;
  const known = entries.filter(([, value]) => value !== null);
  if (known.length === 0) return null;
  return (
    <span className="flex gap-3">
      {known.map(([label, value]) => (
        <span key={label} className={(value ?? 0) >= 0 ? "text-success" : "text-destructive"}>
          {label} {formatSignedMoney(value ?? 0, currency)}
        </span>
      ))}
    </span>
  );
}
