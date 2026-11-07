import { ALL_ACCOUNTS } from "./accounts.config.ts";

/**
 * Which account(s) the UI is looking at: a SteamID, `all`, or undefined when none exist.
 * A remembered choice that no longer exists (account removed) falls back to the first account.
 */
export function resolveScope(
  selected: string | undefined,
  accountIds: readonly string[],
): string | undefined {
  const [first] = accountIds;
  if (first === undefined) return undefined;
  if (selected === ALL_ACCOUNTS) return accountIds.length > 1 ? ALL_ACCOUNTS : first;
  return selected !== undefined && accountIds.includes(selected) ? selected : first;
}

/** The account ids a scope covers. */
export function scopeAccountIds(scope: string | undefined, accountIds: readonly string[]) {
  if (scope === undefined) return [];
  return scope === ALL_ACCOUNTS ? accountIds : [scope];
}
