export const EMPTY_STATE = {
  iconSize: 16,
  /** Says why and stays left-aligned under a strong rule; no box, no illustration. */
  rootClass: "flex shrink-0 items-start gap-3 border-t border-border-strong pt-4 pb-1",
  iconClass: "mt-0.5 shrink-0 text-muted-foreground",
  titleClass: "text-[15px] font-semibold",
  bodyClass: "mt-0.5 text-xs text-muted-foreground",
} as const;
