import { Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { AccountRow } from "~/components/account-row/account-row.component";
import { Button } from "~/components/button/button.component";
import { Panel } from "~/components/panel/panel.component";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { useAppSnapshot } from "~/lib/storage/storage.client";
import { restoreLostFocus } from "~/utils/restore-focus";
import { ACCOUNTS_PANEL } from "./accounts-panel.config";

/** Settings: every tracked account with its label and a way to remove it, plus adding another. */
export function AccountsPanel() {
  const { accounts } = useAppSnapshot();
  const openAdd = useAddAccountDialog((state) => state.openAdd);
  const addButton = useRef<HTMLButtonElement>(null);
  // The removed account's row (and its dialog, which held focus) goes when both the POST has
  // finished and the snapshot without it has arrived, in either order; only then move focus.
  const [removedId, setRemovedId] = useState<string>();
  const removedRowGone =
    removedId !== undefined && !accounts.some((account) => account.steamId === removedId);
  const copy = COPY.accounts;

  useEffect(() => {
    if (!removedRowGone) return;
    // The removed row may disappear before the dialog's close event restores focus.
    // Wait until that close has finished so the browser cannot move focus back to <body>.
    const frame = requestAnimationFrame(() => restoreLostFocus(addButton.current));
    return () => cancelAnimationFrame(frame);
  }, [removedRowGone]);

  return (
    <Panel
      title={copy.settingsTitle}
      action={
        <Button small ref={addButton} onClick={openAdd}>
          <Plus size={ACCOUNTS_PANEL.addIconSize} aria-hidden />
          {copy.add}
        </Button>
      }
    >
      <p className="mb-3 text-muted-foreground">{copy.settingsBody}</p>
      <ul className="divide-y">
        {accounts.map((account) => (
          <AccountRow
            key={account.steamId}
            account={account}
            onRemoved={() => setRemovedId(account.steamId)}
          />
        ))}
      </ul>
    </Panel>
  );
}
