export type MoneyFigureProps = {
  readonly amount: number;
  readonly currency: string;
  /** Size and spacing utilities; the figure scales its sign and cents from the font size. */
  readonly className?: string;
};
