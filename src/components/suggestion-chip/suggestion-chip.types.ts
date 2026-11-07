import type { SuggestionReason } from "~/lib/items/sell-suggestions.types";

export type SuggestionChipProps = {
  readonly reason: SuggestionReason;
  readonly currency: string;
};
