/** Presets offered when tagging an account; `null` means untagged. */
export const ACCOUNT_LABELS = ["main", "trade", "alt"] as const;

/** Scope value that aggregates every account (only read-only views accept it). */
export const ALL_ACCOUNTS = "all";

/** A 64-bit SteamID as a decimal string. Also keeps ids safe to use in file names. */
export const STEAM_ID_PATTERN = /^\d{17}$/;

export const SELECTED_ACCOUNT_STORAGE_KEY = "openinventory:selected-account";

/** Routes that can show every account at once; the others act on a single, explicit account. */
export const ALL_ACCOUNTS_ROUTES: readonly string[] = ["/", "/items"];

/** Pages that work with no account in view, so a broken account can still be fixed from them. */
export const UNGATED_ROUTES: readonly string[] = ["/settings"];
