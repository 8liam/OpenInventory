export const SEGMENTED_CONTROL = {
  groupClass: "inline-flex h-8 gap-0.5 rounded-md border border-control p-0.5 max-sm:h-10",
  buttonClass:
    "flex items-center justify-center rounded-sm border border-transparent px-2.5 text-xs whitespace-nowrap text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-sm:min-w-10",
  /** The selected segment is the control's only lime fill. */
  activeClass:
    "border-accent-edge bg-accent font-semibold text-accent-foreground hover:bg-accent hover:text-accent-foreground",
} as const;
