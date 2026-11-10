import { COPY } from "~/lib/copy/copy.config";
import type { AccountState } from "~/lib/storage/storage.types";

// Pure naming helpers, kept apart from the scope hooks so components that only need a name
// (and the marketing site's demo, which bundles them) don't pull in the account store.

type NamedAccount = Pick<AccountState, "steamId" | "displayName">;

/** What to call an account in the UI: its Steam persona name, or a generic name until Steam reports one. */
export function accountName(account: NamedAccount): string {
  return account.displayName ?? COPY.accounts.fallbackName;
}

/** Name plus label, e.g. `bossman · Trade`; what search matches against. */
export function accountText(account: AccountState): string {
  return account.label
    ? `${accountName(account)} · ${COPY.accounts.labels[account.label]}`
    : accountName(account);
}
