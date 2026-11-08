import type { ItemViewMode } from "~/lib/items/view-mode.types";

export const VIEW_TOGGLE = {
  groupLabel: "View",
  options: [
    { id: "list", label: "List" },
    { id: "grid", label: "Grid" },
  ] satisfies readonly { readonly id: ItemViewMode; readonly label: string }[],
  iconSize: 14,
  /** Desktop keeps the compact 32px control; phones get 36px-tall, 40px-wide touch targets. */
  groupClass: "flex h-8 rounded-md bg-muted p-0.5 max-sm:h-10",
  buttonClass:
    "flex items-center justify-center rounded px-2 text-xs text-muted-foreground transition-colors hover:text-foreground max-sm:min-w-10",
  activeClass: "bg-card font-medium text-foreground shadow-sm",
} as const;
