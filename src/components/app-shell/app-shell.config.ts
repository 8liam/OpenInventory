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
    "fixed left-2 top-2 z-[60] -translate-y-20 rounded-md border bg-card px-3 py-2 font-medium shadow-sm focus:translate-y-0",
  /** Holds the page and, under it, transfer banners, so a banner never moves the heading. */
  contentClass: "flex min-h-0 min-w-0 flex-1 flex-col",
  mainClass:
    "flex min-h-0 min-w-0 flex-1 flex-col gap-4 overflow-y-auto p-4 outline-none md:gap-5 md:p-6",
} as const;
