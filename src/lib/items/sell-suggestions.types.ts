/** Copies of an item a reason applies to, keyed like `itemRowKey` (`location:id`). */
type ReasonCopies = { readonly itemKeys: readonly string[] };

/**
 * Why an item is worth considering for sale. Read-only: the app only points at it.
 * `change` is a share: 0.38 means +38%.
 */
export type SuggestionReason = ReasonCopies &
  (
    | {
        readonly kind: "spike";
        /** Steam's 24h average against its 30-day average. */
        readonly change: number;
      }
    | {
        readonly kind: "decline";
        /** Steam's 24h average against its 90-day average; every window steps down. */
        readonly change: number;
      }
    | {
        readonly kind: "idle-stack";
        /** Price of one copy, in the response currency. */
        readonly unitPrice: number;
      }
  );

export type SellSuggestion = {
  /** The market hash name shared by every copy. */
  readonly key: string;
  readonly name: string;
  readonly imageUrl: string | null;
  readonly rarityColor: string | null;
  readonly reasons: readonly SuggestionReason[];
};

export type SellSuggestionsResponse = {
  readonly currency: string;
  /** False when Steam's trend averages couldn't be loaded; idle-stack reasons still apply. */
  readonly trendsAvailable: boolean;
  /** Largest first by the value of the copies they cover. */
  readonly suggestions: readonly SellSuggestion[];
};
