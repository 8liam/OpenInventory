export type FloatBarProps = {
  /** The item's exact float. */
  readonly value: number;
  /** The skin's own float bounds; the range is left unshaded when either is missing. */
  readonly minWear?: number | null;
  readonly maxWear?: number | null;
  /** Spoken name for the bar, e.g. the float and its wear. */
  readonly valueText: string;
  readonly className?: string;
};
