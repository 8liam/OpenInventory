import { COPY } from "~/lib/copy/copy.config";
import type { AccountState } from "~/lib/storage/storage.types";

// Pure naming helpers, kept apart from the scope hooks so components that only need a name
// (and the marketing site's demo, which bundles them) don't pull in the account store.

/** What to call an account in the UI: its Steam persona name, or its SteamID's tail until Steam reports one. */
export function accountName(account: Pick<AccountState, "steamId" | "displayName">): string {
  return account.displayName ?? COPY.accounts.fallbackName(account.steamId);
}

/** The stable tail of an account's SteamID, e.g. `…0001`, to tell same-named accounts apart. */
export function accountIdSuffix(steamId: string): string {
  return COPY.accounts.idSuffix(steamId);
}

/** Name that stays unambiguous when two accounts share a persona name, e.g. `bossman (…0001)`. */
export function accountNameWithId(account: Pick<AccountState, "steamId" | "displayName">): string {
  return account.displayName === null
    ? accountName(account)
    : COPY.accounts.nameWithId(account.displayName, accountIdSuffix(account.steamId));
}

/** Name plus label, e.g. `Alt account · Trade`; what search matches against. */
export function accountText(account: AccountState): string {
  return account.label
    ? `${accountName(account)} · ${COPY.accounts.labels[account.label]}`
    : accountName(account);
}
