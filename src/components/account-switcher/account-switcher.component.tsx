import { ArrowLeftRight, Plus } from "lucide-react";
import { useId, useMemo } from "react";
import { AccountStatusDot } from "~/components/account-status-dot/account-status-dot.component";
import { Select } from "~/components/select/select.component";
import type { SelectOption } from "~/components/select/select.types";
import { accountName } from "~/lib/accounts/account-names";
import { useAccountScope } from "~/lib/accounts/account-scope.hooks";
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
  const statusId = useId();
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
        label: accountName(account),
        hint: copy.optionHint(
          account.label ? copy.labels[account.label] : undefined,
          authStatusText(account.snapshot.auth.status),
        ),
        leading: <AccountStatusDot status={account.snapshot.auth.status} decorative />,
      })),
      // With one account the switch button is just an add button, so the entry only shows beside others.
      ...(accounts.length > 1
        ? [
            {
              id: ACCOUNT_SWITCHER.addOptionId,
              label: copy.add,
              leading: <Plus size={ACCOUNT_SWITCHER.addIconSize} aria-hidden />,
            },
          ]
        : []),
    ];
  }, [accounts, copy]);
  if (scope === undefined) return null;
  // The trigger's dot is colour only; its option's name and status line are read instead.
  const current = options.find((option) => option.id === scope);
  const description = current ? [current.label, current.hint] : [];

  const addButton = (
    <button
      type="button"
      title={copy.add}
      aria-label={copy.add}
      onClick={openAdd}
      className={ACCOUNT_SWITCHER.addButtonClass}
    >
      <Plus size={ACCOUNT_SWITCHER.addIconSize} aria-hidden />
    </button>
  );

  return (
    <div className={cn("min-w-0", className)}>
      <div className="flex items-center justify-between gap-2">
        <div className={ACCOUNT_SWITCHER.nameClass}>
          {current?.leading}
          <span className="truncate">{current?.label}</span>
        </div>
        {accounts.length > 1 ? (
          <Select
            value={scope}
            ariaLabel={copy.switcherLabel}
            iconTrigger={ArrowLeftRight}
            listMinWidth={ACCOUNT_SWITCHER.listMinWidth}
            describedBy={statusId}
            options={options}
            onChange={(id) => (id === ACCOUNT_SWITCHER.addOptionId ? openAdd() : select(id))}
          />
        ) : (
          addButton
        )}
      </div>
      {current?.hint && <p className={ACCOUNT_SWITCHER.hintClass}>{current.hint}</p>}
      <span id={statusId} className="sr-only">
        {description.filter(Boolean).join(", ")}
      </span>
    </div>
  );
}
