import { useState } from "react";
import { COPY } from "~/lib/copy/copy.config";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { postJson } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { accountName } from "./account-names";
import { useAccountScope } from "./account-scope.hooks";
import type { RefreshAccounts } from "./refresh-accounts.types";

/** Re-reads prices and storage units for the account(s) in view, reporting each failure by account. */
export function useRefreshAccounts(): RefreshAccounts {
  const { scoped, isAll } = useAccountScope();
  const priceQuery = usePriceQuery();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string>();
  const ready = scoped.filter((account) => account.snapshot.auth.status === AUTH_STATUS.ready);
  const [only] = scoped;
  const scopeLabel = isAll || !only ? COPY.refresh.allAccounts : accountName(only);

  async function refresh() {
    setBusy(true);
    setError(undefined);
    const results = await Promise.allSettled(
      ready.map((account) =>
        postJson(`${STORAGE_API.refresh}?${priceQuery}`, { accountId: account.steamId }),
      ),
    );
    const failures = results.flatMap((result, index) => {
      const account = ready[index];
      if (result.status === "fulfilled" || !account) return [];
      const reason = result.reason instanceof Error ? result.reason.message : String(result.reason);
      return [COPY.accounts.bannerFor(accountName(account), reason)];
    });
    setError(failures.length > 0 ? COPY.refresh.failed(failures) : undefined);
    setBusy(false);
  }

  return {
    refresh,
    busy,
    error,
    canRefresh: ready.length > 0,
    scopeLabel,
    skipped: scoped.length - ready.length,
  };
}
