export const SHARED_INVENTORY = {
  gridClass: "grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6",
  cardClass: "flex min-w-0 flex-col gap-1.5 rounded-lg border bg-card p-2.5",
  imageClass: "aspect-[4/3] w-full object-contain",
  nameClass: "truncate text-sm font-medium",
  metaClass: "truncate text-xs text-muted-foreground",
  headerClass: "flex flex-col gap-1",
  metaRowClass: "flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground",
  footerClass: "mt-2 text-xs text-muted-foreground",
  emptyClass: "text-muted-foreground",
  wrapperClass: "mx-auto flex w-full max-w-6xl flex-col gap-5",
} as const;
