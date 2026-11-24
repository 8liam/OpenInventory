import type { ItemViewMode } from "~/lib/items/view-mode.types";

export const VIEW_TOGGLE = {
  groupLabel: "View",
  options: [
    { id: "list", label: "List" },
    { id: "grid", label: "Grid" },
  ] satisfies readonly { readonly id: ItemViewMode; readonly label: string }[],
  iconSize: 14,
  /** Desktop keeps the compact 32px control; phones get 36px-tall, 40px-wide touch targets. */
  groupClass: "flex h-8 gap-0.5 rounded-md border border-control p-0.5 max-sm:h-10",
  buttonClass:
    "flex min-w-7 items-center justify-center rounded-sm border border-transparent px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-sm:min-w-10",
  activeClass:
    "border-accent-edge bg-accent font-semibold text-accent-foreground hover:bg-accent hover:text-accent-foreground",
} as const;
