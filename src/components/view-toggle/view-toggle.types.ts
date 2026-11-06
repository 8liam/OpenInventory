import type { ItemViewMode } from "~/lib/items/view-mode.types";

export type ViewToggleProps = {
  readonly value: ItemViewMode;
  readonly onChange: (mode: ItemViewMode) => void;
};
