export type Slice = {
  readonly label: string;
  readonly value: number;
  readonly count: number;
  readonly color?: string;
};

export type Holding = {
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly count: number;
  readonly unitPrice: number;
  readonly totalValue: number;
};

export type LocationSlice = Slice & { readonly id: string };

export type HistoryPoint = { readonly takenAt: number; readonly totalValue: number };

export type ValueChange = {
  readonly day: number | null;
  readonly week: number | null;
  readonly month: number | null;
};

export type FloatHighlight = {
  readonly id: string;
  readonly name: string;
  readonly wear: number;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly price: number | null;
};

export type DashboardInsights = {
  readonly lowestFloats: readonly FloatHighlight[];
  readonly highestFloats: readonly FloatHighlight[];
  /** Items you own several copies of, biggest first. */
  readonly stacks: readonly Holding[];
};

export type Dashboard = {
  readonly currency: string;
  readonly priceUpdatedAt: number | null;
  readonly totals: {
    readonly value: number;
    readonly itemCount: number;
    readonly inventoryValue: number;
    readonly storageValue: number;
    readonly unitsLoaded: number;
    readonly unitsTotal: number;
  };
  readonly change: ValueChange;
  readonly history: readonly HistoryPoint[];
  readonly byCategory: readonly Slice[];
  readonly byRarity: readonly Slice[];
  readonly byWear: readonly Slice[];
  readonly byLocation: readonly LocationSlice[];
  readonly topHoldings: readonly Holding[];
  readonly insights: DashboardInsights;
};
