import { Banknote, Database, Palette, Package, Users, type LucideIcon } from "lucide-react";
import type { SettingsTab } from "./settings-tabs.types.ts";

export const SETTINGS_PAGE = {
  /** The page scrolls under the header like every other page's content; the container drives the rail/tab layout. */
  scrollClass: "@container min-h-0 flex-1 overflow-y-auto pb-4",
  /** Tab row above the content while narrow; rail beside it once the container is wide. */
  layoutClass: "grid grid-cols-1 items-start gap-4 @2xl:grid-cols-[11rem_minmax(0,1fr)] @2xl:gap-6",
  contentClass: "flex min-w-0 flex-col gap-5",
  selectWidth: "w-44 max-sm:w-full",
  refreshIconSize: 14,
  spinningClass: "motion-safe:animate-spin",
  scopeClass: "mt-1 text-xs text-muted-foreground",
  skippedClass: "mt-1 text-xs text-muted-foreground",
  errorClass: "mt-1 text-xs text-destructive",
  accountsListClass: "divide-y px-4 py-3",
  tabIcons: {
    appearance: Palette,
    items: Package,
    pricing: Banknote,
    accounts: Users,
    data: Database,
  } satisfies Record<SettingsTab, LucideIcon>,
} as const;
