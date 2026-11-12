import { formatMoney } from "../../utils/format.ts";
import { CHARM_TOOLTIP } from "./charm-tooltip.config.ts";
import type { CharmView } from "./item.types.ts";

/** The line under a charm's name in its hover tooltip: pattern seed and market value, when known. */
export function charmTooltipDetail(
  charm: CharmView,
  currency: string | undefined,
): string | undefined {
  const parts = [
    charm.pattern === null ? null : `${CHARM_TOOLTIP.patternLabel} #${charm.pattern}`,
    charm.price === null || currency === undefined
      ? null
      : `${CHARM_TOOLTIP.valueLabel} ${formatMoney(charm.price, currency)}`,
  ].filter((part): part is string => part !== null);
  return parts.length > 0 ? parts.join(CHARM_TOOLTIP.separator) : undefined;
}
