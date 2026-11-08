export const ACCOUNT_SWITCHER = {
  addIconSize: 16,
  selectWidth: "min-w-0 flex-1",
  /** Wide enough for a long persona name, its SteamID tail and its status line. */
  listMinWidth: 272,
  /** At least 36px square, so the add button is an easy touch target. */
  addButtonClass:
    "flex size-9 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
} as const;
