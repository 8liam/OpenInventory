import { useMemo } from "react";
import { useAppSnapshot } from "~/lib/storage/storage.client";
import type { AccountState } from "~/lib/storage/storage.types";
import { resolveScope, scopeAccountIds } from "./account-scope";
import { useAccountSelection } from "./account-scope.store";
import { accountNameWithId } from "./account-names";
import { ALL_ACCOUNTS } from "./accounts.config";

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

/** The single account of a one-account page, or undefined in the all-accounts view. */
export function useSingleAccount(): AccountState | undefined {
  const { accountId, scoped } = useAccountScope();
  return accountId === undefined ? undefined : scoped[0];
}

/**
 * The name a one-account page shows in its header and confirmations, unambiguous between
 * same-named accounts; undefined when only one account is tracked, where it would be noise.
 */
export function useSingleAccountLabel(): string | undefined {
  const { accounts } = useAccountScope();
  const account = useSingleAccount();
  return account && accounts.length > 1 ? accountNameWithId(account) : undefined;
}
