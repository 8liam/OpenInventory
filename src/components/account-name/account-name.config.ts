export const ACCOUNT_NAME = {
  rootClass: "flex min-w-0 items-baseline gap-1",
  nameClass: "truncate",
  /**
   * The SteamID tail never shrinks, so same-named accounts stay apart however narrow the spot.
   * It takes the name's own colour (no fading), so it passes contrast wherever the name does.
   */
  suffixClass: "shrink-0 text-[11px] tabular",
} as const;
