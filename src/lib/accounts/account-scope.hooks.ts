import { useMemo } from "react";
import { COPY } from "~/lib/copy/copy.config";
import { useAppSnapshot } from "~/lib/storage/storage.client";
import type { AccountState } from "~/lib/storage/storage.types";
import { resolveScope, scopeAccountIds } from "./account-scope";
import { useAccountSelection } from "./account-scope.store";
import { ALL_ACCOUNTS } from "./accounts.config";

/** What to call an account in the UI: its Steam persona name, or its SteamID's tail until Steam reports one. */
export function accountName(account: Pick<AccountState, "steamId" | "displayName">): string {
  return account.displayName ?? COPY.accounts.fallbackName(account.steamId);
}

/** Name plus label, e.g. `Alt account · trade`; what search matches against. */
export function accountText(account: AccountState): string {
  return account.label ? `${accountName(account)} · ${account.label}` : accountName(account);
}

/** The account(s) the UI is looking at, resolved against the live account list. */
export function useAccountScope() {
  const { accounts } = useAppSnapshot();
  const selected = useAccountSelection((state) => state.selected);
  return useMemo(() => {
    const ids = accounts.map((account) => account.steamId);
    const scope = resolveScope(selected, ids);
    const scoped = scopeAccountIds(scope, ids)
      .map((id) => accounts.find((account) => account.steamId === id))
      .filter((account): account is AccountState => account !== undefined);
    return {
      accounts,
      scope,
      isAll: scope === ALL_ACCOUNTS,
      /** The one account being viewed; undefined in the all-accounts view. */
      accountId: scope === ALL_ACCOUNTS ? undefined : scope,
      scoped,
    };
  }, [accounts, selected]);
}

/** `path` with the `account=` the API requires; undefined while there is no account to ask about. */
export function useScopedPath(path: string): string | undefined {
  const { scope } = useAccountScope();
  if (scope === undefined) return undefined;
  return `${path}${path.includes("?") ? "&" : "?"}account=${scope}`;
}

/** The single account of a one-account page, or undefined in the all-accounts view. */
export function useSingleAccountId(): string | undefined {
  return useAccountScope().accountId;
}
