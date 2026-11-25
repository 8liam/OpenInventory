export const NAV_ITEMS = [
  { to: "/", key: "dashboard", icon: "dashboard" },
  { to: "/items", key: "items", icon: "items" },
  { to: "/storage", key: "storage", icon: "storage" },
  { to: "/cases", key: "cases", icon: "cases" },
  { to: "/terminals", key: "terminals", icon: "terminals" },
  { to: "/tradeup", key: "tradeup", icon: "tradeup" },
  { to: "/settings", key: "settings", icon: "settings" },
] as const;

export const APP_SHELL = {
  mainId: "main-content",
  skipLink: "Skip to content",
  skipLinkClass:
    "fixed left-2 top-2 z-[60] -translate-y-20 rounded-md border border-border-strong bg-card px-3 py-2 font-medium focus:translate-y-0",
  sidebarClass: "hidden w-56 shrink-0 flex-col border-r md:flex",
  sidebarNavClass: "flex flex-1 flex-col gap-0.5 px-2",
  /** Active page is a lime fill (ink edge on light). Inactive items get no transition, so the lime arrives alone. */
  sidebarLinkClass:
    "flex h-8 items-center gap-2.5 rounded-md border border-transparent px-2.5 text-muted-foreground transition-none data-[status=active]:border-accent-edge data-[status=active]:bg-accent data-[status=active]:font-semibold data-[status=active]:text-accent-foreground data-[status=active]:transition-colors data-[status=active]:duration-200 data-[status=active]:ease-out not-data-[status=active]:hover:bg-muted not-data-[status=active]:hover:text-foreground",
  tabBarClass: "flex shrink-0 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden",
  tabLinkClass:
    "group flex min-w-0 flex-1 flex-col items-center gap-0.5 py-1.5 text-[10px] text-muted-foreground data-[status=active]:font-semibold data-[status=active]:text-foreground max-[360px]:tracking-tight",
  /** The mobile tab's icon sits in a small lime pill when its page is open. */
  tabIconClass:
    "grid h-6 w-10 place-items-center rounded-md border border-transparent group-data-[status=active]:border-accent-edge group-data-[status=active]:bg-accent group-data-[status=active]:text-accent-foreground",
  /** Holds the page and, under it, transfer banners, so a banner never moves the heading. */
  contentClass: "flex min-h-0 min-w-0 flex-1 flex-col",
  mainClass:
    "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4 outline-none md:gap-5 md:p-6",
} as const;
