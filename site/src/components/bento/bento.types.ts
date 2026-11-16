export type BentoKind = "prices" | "local" | "signin" | "capacity" | "readonly" | "platforms";

export type BentoCard = {
  readonly kind: BentoKind;
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
};

export type BentoPlatform = {
  readonly name: string;
  readonly file: string;
};

/** One marketplace as the Settings select lists it, with the sample price it would show for the sample item. */
export type BentoMarketPrice = {
  readonly id: string;
  readonly label: string;
  readonly price: number;
};

/** One item as the mini UIs draw it: the real sample-account item, resolved from the mock inventory. */
export type BentoItem = {
  readonly name: string;
  /** Weapon / skin halves, as ItemLabel splits them. */
  readonly weapon: string | null;
  readonly skin: string;
  readonly imageUrl: string;
  readonly rarityColor: string | null;
  readonly price: number;
};

/** A storage unit card: what unit-card.component.tsx would render for the sample account. */
export type BentoUnit = {
  readonly id: string;
  readonly name: string;
  readonly itemCount: number;
  readonly value: number;
  /** The four most valuable items with an image, in the order the unit card shows them. */
  readonly preview: readonly BentoItem[];
};

/** Unit and item figures before and after the animated move, so both ends stay on the sample account's totals. */
export type BentoMove = {
  readonly item: BentoItem;
  readonly from: BentoUnit;
  readonly to: BentoUnit;
  /** The item that takes the vacated fourth slot of the source unit. */
  readonly backfill: BentoItem;
  readonly fromAfter: { readonly itemCount: number; readonly value: number };
  readonly toAfter: { readonly itemCount: number; readonly value: number };
};

export type BentoIconName =
  | "chevrons-up-down"
  | "check"
  | "pencil"
  | "lock"
  | "pointer"
  | "database"
  | "monitor"
  | "globe";
