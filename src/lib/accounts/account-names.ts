import { COPY } from "~/lib/copy/copy.config";
import type { AccountState } from "~/lib/storage/storage.types";
import type { AccountDisplayName } from "./accounts.types";

// Pure naming helpers, kept apart from the scope hooks so components that only need a name
// (and the marketing site's demo, which bundles them) don't pull in the account store.

type NamedAccount = Pick<AccountState, "steamId" | "displayName">;

/** The stable tail of an account's SteamID, e.g. `…0001`, to tell same-named accounts apart. */
export function accountIdSuffix(steamId: string): string {
  return COPY.accounts.idSuffix(steamId);
}

/**
 * An account's name and SteamID tail as separate parts, so a narrow spot can truncate the name
 * and keep the tail. An unnamed account's fallback already ends in the tail, so it has no suffix.
 */
export function accountDisplayName(account: NamedAccount): AccountDisplayName {
  return account.displayName === null
    ? { name: COPY.accounts.fallbackName(accountIdSuffix(account.steamId)), suffix: null }
    : { name: account.displayName, suffix: accountIdSuffix(account.steamId) };
}

/** What to call an account in the UI: its Steam persona name, or its SteamID's tail until Steam reports one. */
export function accountName(account: NamedAccount): string {
  return accountDisplayName(account).name;
}

/** Name that stays unambiguous when two accounts share a persona name, e.g. `bossman (…0001)`. */
export function accountNameWithId(account: NamedAccount): string {
  const { name, suffix } = accountDisplayName(account);
  return suffix === null ? name : COPY.accounts.nameWithId(name, suffix);
}

/** Name plus label, e.g. `bossman (…0001) · Trade`; what search matches against. */
export function accountText(account: AccountState): string {
  return account.label
    ? `${accountNameWithId(account)} · ${COPY.accounts.labels[account.label]}`
    : accountNameWithId(account);
}
