/** A formatted money amount in display pieces; see `formatMoneyParts`. */
export type MoneyParts = {
  readonly sign: string;
  readonly whole: string;
  readonly fraction: string;
};
