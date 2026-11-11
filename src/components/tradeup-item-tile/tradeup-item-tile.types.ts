export type TradeUpItemTileProps = {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly price: number | null;
  readonly currency: string;
  readonly count?: number;
  readonly probability?: number;
  readonly inputCost?: number;
};
