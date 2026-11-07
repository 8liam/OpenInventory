import { useEffect, useRef } from "react";
import { AccountStatus } from "~/components/account-status/account-status.component";
import { Button } from "~/components/button/button.component";
import { accountName, useAccountScope } from "~/lib/accounts/account-scope.hooks";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { ALL_ACCOUNTS_ROUTES, UNGATED_ROUTES } from "~/lib/accounts/accounts.config";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import type { AccountGateProps } from "./account-gate.types";

/**
 * Decides what a page sees: its account's data once connected, the account's progress or
 * error while not, or a prompt to pick an account on pages that act on exactly one.
 * Accounts connect lazily, so viewing one is what asks the server to connect it.
 */
export function AccountGate({ pathname, children }: AccountGateProps) {
  const { accounts, scoped, isAll } = useAccountScope();
  const select = useAccountSelection((state) => state.select);
  const asked = useRef(new Set<string>());
  const copy = COPY.accounts;

  useEffect(() => {
    for (const account of scoped) {
      if (account.snapshot.auth.status !== AUTH_STATUS.idle || asked.current.has(account.steamId))
        continue;
      asked.current.add(account.steamId);
      void postJson(STORAGE_API.accountConnect, { accountId: account.steamId }).catch(() => {
        asked.current.delete(account.steamId);
      });
    }
  }, [scoped]);

  if (UNGATED_ROUTES.includes(pathname)) return <>{children}</>;
  if (isAll && !ALL_ACCOUNTS_ROUTES.includes(pathname)) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <h2 className="text-[13px] font-medium">{copy.chooseOneTitle}</h2>
        <p className="mt-2 text-muted-foreground">{copy.chooseOneBody}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {accounts.map((account) => (
            <Button key={account.steamId} small onClick={() => select(account.steamId)}>
              {accountName(account)}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  const ready = scoped.filter((account) => account.snapshot.auth.status === AUTH_STATUS.ready);
  if (ready.length === 0) {
    return (
      <div className="flex flex-col gap-3">
        {scoped.map((account) => (
          <AccountStatus key={account.steamId} account={account} />
        ))}
      </div>
    );
  }
  const waiting = scoped.length - ready.length;
  return (
    <>
      {waiting > 0 && <p className="text-xs text-warning">{copy.partialNotice(waiting)}</p>}
      {children}
    </>
  );
}
