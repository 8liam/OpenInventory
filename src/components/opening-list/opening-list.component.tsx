import { ItemLabel } from "~/components/item-label/item-label.component";
import { formatDate } from "~/utils/format";
import { OPENING_LIST } from "./opening-list.config";
import type { OpeningListProps } from "./opening-list.types";

/** Pulled items with the case they came from and when. */
export function OpeningList({ openings, emptyText }: OpeningListProps) {
  if (openings.length === 0) return <p className="text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="flex flex-col gap-2.5">
      {openings.map((opening) => (
        <li
          key={`${opening.openedAt}-${opening.itemName}`}
          className="flex items-center justify-between gap-3"
        >
          <ItemLabel
            name={opening.itemName}
            imageUrl={opening.imageUrl}
            rarityColor={
              opening.isGold ? OPENING_LIST.goldColor : opening.color && `#${opening.color}`
            }
            size={OPENING_LIST.thumbSize}
          />
          <span className="tabular shrink-0 text-right text-xs text-muted-foreground">
            {opening.caseName && <span className="block">{opening.caseName}</span>}
            {formatDate(opening.openedAt)}
          </span>
        </li>
      ))}
    </ul>
  );
}
