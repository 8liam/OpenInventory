import { cn } from "~/utils/cn";
import { METRIC_TONE_CLASS } from "./metric.config";
import type { MetricProps } from "./metric.types";

export function Metric({ label, value, detail, tone = "neutral" }: MetricProps) {
  return (
    <div className="rounded-lg border bg-card px-4 py-3.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="tabular mt-1 text-[22px] font-semibold leading-none tracking-tight">{value}</p>
      {detail && <p className={cn("tabular mt-2 text-xs", METRIC_TONE_CLASS[tone])}>{detail}</p>}
    </div>
  );
}
