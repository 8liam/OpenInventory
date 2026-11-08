import { Link } from "@tanstack/react-router";
import { TriangleAlert } from "lucide-react";
import { Fragment, useEffect, useId, useRef } from "react";
import { AccountActions } from "~/components/account-actions/account-actions.component";
import { AccountStatus } from "~/components/account-status/account-status.component";
import { AccountStatusDot } from "~/components/account-status-dot/account-status-dot.component";
import { Button } from "~/components/button/button.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { accountNameWithId } from "~/lib/accounts/account-names";
import { useAccountScope } from "~/lib/accounts/account-scope.hooks";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { ALL_ACCOUNTS_ROUTES, UNGATED_ROUTES } from "~/lib/accounts/accounts.config";
import { COPY } from "~/lib/copy/copy.config";
import { postJson } from "~/lib/storage/storage.client";
import { AUTH_STATUS, STORAGE_API } from "~/lib/storage/storage.config";
import { ACCOUNT_GATE } from "./account-gate.config";
import type { AccountGateProps } from "./account-gate.types";

/**
 * Decides what a page sees: its account's data once connected, the account's progress or
 * error while not, or a prompt to pick an account on pages that act on exactly one.
 * Accounts connect lazily, so viewing one is what asks the server to connect it.
 * Pages remount when the account changes, so filters, selections and drafts never carry over.
 */
export function AccountGate({ pathname, children }: AccountGateProps) {
  const { accounts, scope, scoped, isAll } = useAccountScope();
  const select = useAccountSelection((state) => state.select);
  const asked = useRef(new Set<string>());
  const chooseTitleId = useId();
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

  const page = <Fragment key={scope}>{children}</Fragment>;
  if (UNGATED_ROUTES.includes(pathname)) return page;
  if (isAll && !ALL_ACCOUNTS_ROUTES.includes(pathname)) {
    const pageTitle = ACCOUNT_GATE.pageTitles[pathname];
    return (
      <>
        {pageTitle && <PageHeader title={pageTitle} />}
        <section className={ACCOUNT_GATE.cardClass} aria-labelledby={chooseTitleId}>
          <h2 id={chooseTitleId} className="text-[13px] font-medium">
            {copy.chooseOneTitle}
          </h2>
          <p className="mt-2 text-muted-foreground">
            {copy.chooseOneBody[pathname] ?? copy.chooseOneFallback}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {accounts.map((account) => (
              <Button key={account.steamId} onClick={() => select(account.steamId)}>
                <AccountStatusDot status={account.snapshot.auth.status} />
                {accountNameWithId(account)}
              </Button>
            ))}
          </div>
        </section>
      </>
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
  const waiting = scoped.filter((account) => account.snapshot.auth.status !== AUTH_STATUS.ready);
  // One broken account can be fixed right here; otherwise every row in settings has its own actions.
  const [fixable] =
    waiting.length === 1 && waiting[0]?.snapshot.auth.status === AUTH_STATUS.error ? waiting : [];
  const notice = waiting.length > 0 ? copy.partialNotice(waiting.map(accountNameWithId)) : "";
  return (
    <>
      {/* Always mounted, so a newly dropped account is announced politely. */}
      <p role="status" className="sr-only">
        {notice}
      </p>
      {notice && (
        <div className={ACCOUNT_GATE.bannerClass}>
          <p className="flex min-w-0 items-center gap-2" aria-hidden>
            <TriangleAlert size={ACCOUNT_GATE.bannerIconSize} className="shrink-0 text-warning" />
            <span>{notice}</span>
          </p>
          <span className="flex flex-wrap items-start gap-2">
            {fixable && <AccountActions steamId={fixable.steamId} />}
            <Link to="/settings" className={ACCOUNT_GATE.settingsLinkClass}>
              {copy.partialSettings}
            </Link>
          </span>
        </div>
      )}
      {page}
    </>
  );
}
