/** One item thumbnail as the app's ItemThumb needs it: art plus the rarity colour for the corner wash. */
export type HowThumb = {
  readonly id: string;
  readonly name: string;
  readonly imageUrl: string;
  readonly rarityColor: string | null;
};

/** A storage unit card as the app's UnitCard shows it. */
export type HowUnit = {
  readonly id: string;
  readonly name: string;
  readonly countLabel: string;
  readonly valueLabel: string;
};

export type HowChartDot = {
  readonly x: number;
  readonly y: number;
  /** 0..1 position along the x axis; staggers when the dot arrives. */
  readonly progress: number;
};

/** The value-history chart, built at build time from the sample account's hourly snapshots. */
export type HowChart = {
  readonly line: string;
  readonly area: string;
  readonly dots: readonly HowChartDot[];
  readonly last: { readonly x: number; readonly y: number };
};

/** Animation state of one illustration: `rest` is the finished frame, `armed` the first frame. */
export type HowPlayState = 'rest' | 'armed' | 'play';
