import type { SuggestionReason } from "~/lib/items/sell-suggestions.types";
import { formatInteger, formatMoney, formatPercent } from "~/utils/format";
import { SUGGESTION_CHIP } from "./suggestion-chip.config";

/** Short text for one reason, with the numbers behind it, e.g. "Spike +38% vs 30d avg". */
export function describeReason(reason: SuggestionReason, currency: string): string {
  const { labels, windows, idleSuffix } = SUGGESTION_CHIP;
  switch (reason.kind) {
    case "spike":
      return `${labels.spike} ${formatPercent(reason.change)} vs ${windows.spike}`;
    case "decline":
      return `${labels.decline} ${formatPercent(reason.change)} vs ${windows.decline}`;
    case "idle-stack":
      return `${labels.idleStack} ×${formatInteger(reason.itemKeys.length)} ${idleSuffix} · ${formatMoney(reason.unitPrice, currency)} each`;
  }
}
