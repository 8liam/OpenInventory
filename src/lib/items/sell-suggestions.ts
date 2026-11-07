import type { SellSuggestion, SuggestionReason } from "./sell-suggestions.types.ts";

/** Reasons keyed by item row key, so each item can show its own chips. */
export function reasonsByItemKey(
  suggestions: readonly SellSuggestion[],
): ReadonlyMap<string, readonly SuggestionReason[]> {
  const byKey = new Map<string, SuggestionReason[]>();
  for (const suggestion of suggestions) {
    for (const reason of suggestion.reasons) {
      for (const itemKey of reason.itemKeys) {
        const list = byKey.get(itemKey) ?? [];
        list.push(reason);
        byKey.set(itemKey, list);
      }
    }
  }
  return byKey;
}
