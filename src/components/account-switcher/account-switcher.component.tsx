import { Plus } from "lucide-react";
import { useMemo } from "react";
import { AccountStatusDot } from "~/components/account-status-dot/account-status-dot.component";
import { Select } from "~/components/select/select.component";
import type { SelectOption } from "~/components/select/select.types";
import { accountIdSuffix, useAccountScope } from "~/lib/accounts/account-scope.hooks";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { authStatusText } from "~/lib/accounts/account-status";
import { ALL_ACCOUNTS } from "~/lib/accounts/accounts.config";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { ACCOUNT_SWITCHER } from "./account-switcher.config";
import type { AccountSwitcherProps } from "./account-switcher.types";

/** Picks which account (or all of them) the app shows, and starts adding another. */
export function AccountSwitcher({ className }: AccountSwitcherProps) {
  const { accounts, scope } = useAccountScope();
  const select = useAccountSelection((state) => state.select);
  const openAdd = useAddAccountDialog((state) => state.openAdd);
  const copy = COPY.accounts;

  const options = useMemo<readonly SelectOption[]>(() => {
    const attention = accounts.filter(
      (account) => account.snapshot.auth.status !== AUTH_STATUS.ready,
    ).length;
    const summary = copy.allSummary(accounts.length, attention);
    const all: SelectOption = {
      id: ALL_ACCOUNTS,
      label: copy.all,
      hint: summary,
      leading: (
        <AccountStatusDot
          status={attention === 0 ? AUTH_STATUS.ready : AUTH_STATUS.connecting}
          decorative
        />
      ),
    };
    return [
      ...(accounts.length > 1 ? [all] : []),
      ...accounts.map((account) => ({
        id: account.steamId,
        // The SteamID tail sits in `detail`, which never truncates, so same-named accounts stay distinct.
        label: account.displayName ?? copy.fallbackShortName,
        detail: accountIdSuffix(account.steamId),
        hint: copy.optionHint(
          account.label ? copy.labels[account.label] : undefined,
          authStatusText(account.snapshot.auth.status),
        ),
        leading: <AccountStatusDot status={account.snapshot.auth.status} decorative />,
      })),
    ];
  }, [accounts, copy]);
  if (scope === undefined) return null;

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      <Select
        value={scope}
        ariaLabel={copy.switcherLabel}
        className={ACCOUNT_SWITCHER.selectWidth}
        listMinWidth={ACCOUNT_SWITCHER.listMinWidth}
        showDetailInTrigger
        options={options}
        onChange={select}
      />
      <button
        type="button"
        title={copy.add}
        aria-label={copy.add}
        onClick={openAdd}
        className={ACCOUNT_SWITCHER.addButtonClass}
      >
        <Plus size={ACCOUNT_SWITCHER.addIconSize} aria-hidden />
      </button>
    </div>
  );
}
