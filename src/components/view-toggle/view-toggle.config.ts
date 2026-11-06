import type { ItemViewMode } from "~/lib/items/view-mode.types";

export const VIEW_TOGGLE = {
  groupLabel: "View",
  options: [
    { id: "list", label: "List" },
    { id: "grid", label: "Grid" },
  ] satisfies readonly { readonly id: ItemViewMode; readonly label: string }[],
  iconSize: 14,
} as const;
