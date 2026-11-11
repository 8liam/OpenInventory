import { Button } from "~/components/button/button.component";
import { COPY } from "~/lib/copy/copy.config";
import { ITEM_SEARCH } from "./item-search.config";
import type { ItemSearchProps } from "./item-search.types";
export function ItemSearch({ value, onChange }: ItemSearchProps) {
  return (
    <div className="mb-3 flex items-center gap-2">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={COPY.common.searchPlaceholder}
        aria-label={COPY.common.searchPlaceholder}
        className={ITEM_SEARCH.searchClass}
      />
      {value && (
        <Button small onClick={() => onChange("")}>
          {COPY.tradeup.clear}
        </Button>
      )}
    </div>
  );
}
