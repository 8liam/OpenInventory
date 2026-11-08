export const ACCOUNT_NAME = {
  rootClass: "flex min-w-0 items-baseline gap-1",
  nameClass: "truncate",
  /** The SteamID tail never shrinks, so same-named accounts stay apart however narrow the spot. */
  suffixClass: "shrink-0 text-[11px] tabular opacity-80",
} as const;
