import { ItemLabel } from "~/components/item-label/item-label.component";
import { COPY } from "~/lib/copy/copy.config";
import { formatInteger } from "~/utils/format";
import { PULLED_LIST } from "./pulled-list.config";
import type { PulledListProps } from "./pulled-list.types";

/** Items (or cases) ranked by how often they show up. */
export function PulledList({ items }: PulledListProps) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((item) => (
        <li key={item.name} className="flex items-center justify-between gap-3">
          <ItemLabel
            name={item.name}
            imageUrl={item.imageUrl}
            rarityColor={item.color && `#${item.color}`}
            size={PULLED_LIST.thumbSize}
          />
          <span className="tabular shrink-0 text-muted-foreground">
            {COPY.cases.timesSuffix}
            {formatInteger(item.count)}
          </span>
        </li>
      ))}
    </ul>
  );
}
