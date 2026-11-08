import { AccountActions } from "~/components/account-actions/account-actions.component";
import { AccountStatusDot } from "~/components/account-status-dot/account-status-dot.component";
import { accountNameWithId } from "~/lib/accounts/account-names";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import { ACCOUNT_STATUS } from "./account-status.config";
import type { AccountStatusProps } from "./account-status.types";

/** Stands in for a page while its account isn't connected: progress, or what went wrong and what to do. */
export function AccountStatus({ account }: AccountStatusProps) {
  const copy = COPY.accounts;
  const { auth } = account.snapshot;

  return (
    <section
      className={ACCOUNT_STATUS.cardClass}
      aria-label={copy.notReadyTitle(accountNameWithId(account))}
    >
      <div className="flex items-center gap-2">
        <AccountStatusDot status={auth.status} />
        <h2 className="text-[13px] font-medium">
          {copy.notReadyTitle(accountNameWithId(account))}
        </h2>
      </div>
      {auth.status === AUTH_STATUS.error ? (
        <>
          <p role="alert" className="mt-2 text-destructive">
            {auth.message}
          </p>
          <AccountActions steamId={account.steamId} className="mt-3" />
        </>
      ) : (
        <p role="status" className="mt-2 text-muted-foreground">
          {auth.status === AUTH_STATUS.connecting ? auth.detail : copy.connecting}
        </p>
      )}
    </section>
  );
}
