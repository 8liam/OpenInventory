export const SETTINGS_NAV = {
  iconSize: 15,
  /** A scrollable tab row while narrow; a sticky vertical rail once the container is wide. */
  navClass:
    "-mx-1 flex gap-1 overflow-x-auto px-1 pb-1 @2xl:sticky @2xl:top-0 @2xl:mx-0 @2xl:flex-col @2xl:self-start @2xl:overflow-visible @2xl:p-0",
  itemClass:
    "flex shrink-0 items-center gap-2 rounded-md border border-transparent px-2.5 py-1.5 text-left text-muted-foreground transition-colors hover:bg-muted hover:text-foreground max-sm:py-2.5",
  activeClass: "bg-muted font-medium text-foreground",
} as const;
