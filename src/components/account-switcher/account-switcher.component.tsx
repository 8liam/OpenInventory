import { Plus } from "lucide-react";
import { useMemo } from "react";
import { Select } from "~/components/select/select.component";
import { useAccountScope, accountName } from "~/lib/accounts/account-scope.hooks";
import { useAccountSelection } from "~/lib/accounts/account-scope.store";
import { authDotClass } from "~/lib/accounts/account-status";
import { ALL_ACCOUNTS } from "~/lib/accounts/accounts.config";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { AUTH_STATUS } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { ACCOUNT_SWITCHER } from "./account-switcher.config";
import type { AccountSwitcherProps } from "./account-switcher.types";

/** Picks which account (or all of them) the app shows, and starts adding another. */
export function AccountSwitcher({ className }: AccountSwitcherProps) {
  const { accounts, scope, scoped } = useAccountScope();
  const select = useAccountSelection((state) => state.select);
  const setDialogOpen = useAddAccountDialog((state) => state.setOpen);
  const copy = COPY.accounts;

  const options = useMemo(
    () => [
      ...(accounts.length > 1 ? [{ id: ALL_ACCOUNTS, label: copy.all }] : []),
      ...accounts.map((account) => ({
        id: account.steamId,
        label: accountName(account),
        detail: account.label ? copy.labels[account.label] : undefined,
      })),
    ],
    [accounts, copy],
  );
  if (scope === undefined) return null;
  const allReady = scoped.every((account) => account.snapshot.auth.status === AUTH_STATUS.ready);
  const dot =
    scoped.length === 1 ? authDotClass(scoped[0]?.snapshot.auth ?? { status: "idle" }) : null;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          dot ?? (allReady ? "bg-success" : "bg-warning"),
        )}
        aria-hidden
      />
      <Select
        value={scope}
        ariaLabel={copy.switcherLabel}
        className={ACCOUNT_SWITCHER.selectWidth}
        options={options}
        onChange={select}
      />
      <button
        type="button"
        title={copy.add}
        aria-label={copy.add}
        onClick={() => setDialogOpen(true)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        <Plus size={ACCOUNT_SWITCHER.addIconSize} />
      </button>
    </div>
  );
}
