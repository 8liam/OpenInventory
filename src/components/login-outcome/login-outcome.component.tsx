import { CircleCheck, TriangleAlert } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { accountNameWithId } from "~/lib/accounts/account-names";
import { useAccountScope } from "~/lib/accounts/account-scope.hooks";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { LOGIN_OUTCOME } from "./login-outcome.config";

/** Says how the last sign-in from the dialog went, with a shortcut to the account it signed in. */
export function LoginOutcome() {
  const outcome = useAddAccountDialog((state) => state.outcome);
  const dismiss = useAddAccountDialog((state) => state.dismissOutcome);
  const select = useAccountSelection((state) => state.select);
  const { accounts, scope } = useAccountScope();
  const copy = COPY.accounts.outcome;

  const account = accounts.find((a) => a.steamId === outcome?.steamId);
  const target = accounts.find((a) => a.steamId === outcome?.target);
  const name = account ? accountNameWithId(account) : "";
  const wrongAccount = account !== undefined && target !== undefined && target !== account;
  const message =
    !outcome || !account
      ? ""
      : wrongAccount
        ? copy.otherAccount(name, accountNameWithId(target))
        : outcome.added
          ? copy.added(name)
          : copy.reconnected(name);
  const Icon = wrongAccount ? TriangleAlert : CircleCheck;

  return (
    <>
      {/* Always mounted, so screen readers announce the message when it appears. */}
      <p role="status" className="sr-only">
        {message}
      </p>
      {account && message && (
        <div
          id={LOGIN_OUTCOME.bannerId}
          role="group"
          aria-label={message}
          tabIndex={-1}
          className={LOGIN_OUTCOME.bannerClass}
        >
          <p className={LOGIN_OUTCOME.messageClass} aria-hidden>
            <Icon
              size={LOGIN_OUTCOME.iconSize}
              className={
                wrongAccount ? LOGIN_OUTCOME.iconClass.warning : LOGIN_OUTCOME.iconClass.success
              }
              aria-hidden
            />
            {message}
          </p>
          <div className={LOGIN_OUTCOME.actionsClass}>
            {scope !== account.steamId && (
              <Button
                small
                onClick={() => {
                  select(account.steamId);
                  dismiss();
                }}
              >
                {copy.switchTo(name)}
              </Button>
            )}
            <Button small variant="ghost" onClick={dismiss}>
              {copy.dismiss}
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
