import { SearchX } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { FILTERED_EMPTY } from "./filtered-empty.config";
import type { FilteredEmptyProps } from "./filtered-empty.types";

/** Filters hid every row: say so, and offer the one click that brings the rows back. */
export function FilteredEmpty({ title, body, actionLabel, onAction }: FilteredEmptyProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-2 rounded-lg border bg-card px-6 py-10 text-center"
    >
      <SearchX size={FILTERED_EMPTY.iconSize} className="text-muted-foreground" aria-hidden />
      <p className="font-medium">{title}</p>
      <p className="max-w-sm text-muted-foreground">{body}</p>
      <Button small className="mt-2" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}
