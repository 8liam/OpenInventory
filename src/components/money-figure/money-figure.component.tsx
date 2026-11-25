import { cn } from "~/utils/cn";
import { formatMoney, formatMoneyParts } from "~/utils/format";
import { MONEY_FIGURE } from "./money-figure.config";
import type { MoneyFigureProps } from "./money-figure.types";

const { classes } = MONEY_FIGURE;

/** A large money amount set like a ledger: serif, lining, tabular, with sign and cents muted. */
export function MoneyFigure({ amount, currency, className }: MoneyFigureProps) {
  const parts = formatMoneyParts(amount, currency);
  return (
    <span className={cn(classes.root, className)}>
      <span className="sr-only">{formatMoney(amount, currency)}</span>
      <span aria-hidden>
        {parts.sign && <span className={classes.sign}>{parts.sign}</span>}
        <span className={classes.whole}>{parts.whole}</span>
        {parts.fraction && <span className={classes.fraction}>{parts.fraction}</span>}
      </span>
    </span>
  );
}
