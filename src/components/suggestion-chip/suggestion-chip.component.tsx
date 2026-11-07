import { cn } from "~/utils/cn";
import { SUGGESTION_CHIP } from "./suggestion-chip.config";
import type { SuggestionChipProps } from "./suggestion-chip.types";
import { describeReason } from "./suggestion-chip.utils";

/** One sell-it-now reason as a small tag; read-only, it only points at the item. */
export function SuggestionChip({ reason, currency }: SuggestionChipProps) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center truncate rounded border px-1.5 py-0.5 text-[11px] leading-none",
        SUGGESTION_CHIP.classes[reason.kind === "idle-stack" ? "idleStack" : reason.kind],
      )}
    >
      {describeReason(reason, currency)}
    </span>
  );
}
