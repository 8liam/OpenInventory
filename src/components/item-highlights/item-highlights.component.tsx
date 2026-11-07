import { scoreItemRarity } from "~/lib/items/rarity-scoring";
import type { ItemView } from "~/lib/items/item.types";
import { formatMoney } from "~/utils/format";
import { COPY } from "~/lib/copy/copy.config";

export function ItemRarity({ item }: { readonly item: ItemView }) {
  const rarity = scoreItemRarity(item);
  if (rarity.badges.length === 0) return null;
  return (
    <div
      className="mt-0.5 flex flex-wrap items-center gap-1"
      title="Rarity score uses configured float, pattern and attachment signals"
    >
      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
        {COPY.items.rarityScore} {rarity.score}
      </span>
      {rarity.badges.map((badge) => (
        <span
          key={`${badge.kind}-${badge.label}`}
          className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
        >
          {badge.label}
        </span>
      ))}
      {rarity.estimatedPremiumUsd !== null && (
        <span className="text-[10px] text-muted-foreground">
          {COPY.items.estimatedPremium} {formatMoney(rarity.estimatedPremiumUsd, "USD")}
        </span>
      )}
    </div>
  );
}
