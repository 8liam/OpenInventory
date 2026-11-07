import { ItemLabel } from "~/components/item-label/item-label.component";
import { SuggestionChip } from "~/components/suggestion-chip/suggestion-chip.component";
import { SELL_SUGGESTIONS_CARD } from "./sell-suggestions.config";
import type { SellSuggestionsProps } from "./sell-suggestions.types";

/** Items worth considering for sale, each with the reasons behind it. */
export function SellSuggestions({ suggestions }: SellSuggestionsProps) {
  const { currency, trendsAvailable } = suggestions;
  const rows = suggestions.suggestions.slice(0, SELL_SUGGESTIONS_CARD.limit);
  return (
    <div className="flex flex-col gap-3">
      {!trendsAvailable && (
        <p className="text-xs text-warning">{SELL_SUGGESTIONS_CARD.trendsUnavailable}</p>
      )}
      {rows.length === 0 ? (
        <p className="text-muted-foreground">{SELL_SUGGESTIONS_CARD.empty}</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {rows.map((row) => (
            <li key={row.key} className="flex flex-col gap-1.5">
              <ItemLabel
                name={row.name}
                imageUrl={row.imageUrl}
                rarityColor={row.rarityColor}
                size={SELL_SUGGESTIONS_CARD.thumbSize}
              >
                <div className="mt-1 flex flex-wrap gap-1">
                  {row.reasons.map((reason) => (
                    <SuggestionChip key={reason.kind} reason={reason} currency={currency} />
                  ))}
                </div>
              </ItemLabel>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-muted-foreground">{SELL_SUGGESTIONS_CARD.note}</p>
    </div>
  );
}
