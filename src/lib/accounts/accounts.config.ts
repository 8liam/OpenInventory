/** Presets offered when tagging an account; `null` means untagged. */
export const ACCOUNT_LABELS = ["main", "trade", "alt"] as const;

/** Scope value that aggregates every account (only read-only views accept it). */
export const ALL_ACCOUNTS = "all";

/** A 64-bit SteamID as a decimal string. Also keeps ids safe to use in file names. */
export const STEAM_ID_PATTERN = /^\d{17}$/;
