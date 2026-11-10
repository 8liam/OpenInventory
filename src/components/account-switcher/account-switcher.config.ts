export const ACCOUNT_SWITCHER = {
  addIconSize: 16,
  /** Not a real account: choosing it opens the add-account dialog instead of switching. */
  addOptionId: "__add-account__",
  nameClass: "flex min-w-0 items-center gap-2 font-semibold",
  hintClass: "mt-0.5 truncate pl-4 text-xs text-muted-foreground",
  /** Wide enough for a long persona name, its SteamID tail and its status line. */
  listMinWidth: 272,
  /** At least 36px square, so the add button is an easy touch target. */
  addButtonClass:
    "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;
