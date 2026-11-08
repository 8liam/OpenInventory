import { Plus } from "lucide-react";
import { useEffect, useRef } from "react";
import { AccountRow } from "~/components/account-row/account-row.component";
import { Button } from "~/components/button/button.component";
import { Panel } from "~/components/panel/panel.component";
import { useAddAccountDialog } from "~/lib/accounts/add-account-dialog.store";
import { COPY } from "~/lib/copy/copy.config";
import { useAppSnapshot } from "~/lib/storage/storage.client";
import { ACCOUNTS_PANEL } from "./accounts-panel.config";

/** Settings: every tracked account with its label and a way to remove it, plus adding another. */
export function AccountsPanel() {
  const { accounts } = useAppSnapshot();
  const openAdd = useAddAccountDialog((state) => state.openAdd);
  const addButton = useRef<HTMLButtonElement>(null);
  // Set when a removal succeeds; the row (and the focus inside it) only vanishes on the next snapshot.
  const refocusAfterRemove = useRef(false);
  const copy = COPY.accounts;

  useEffect(() => {
    if (!refocusAfterRemove.current) return;
    const active = document.activeElement;
    if (active === null || active === document.body || !active.isConnected) {
      refocusAfterRemove.current = false;
      addButton.current?.focus();
    }
  }, [accounts]);

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
            onRemoved={() => {
              refocusAfterRemove.current = true;
            }}
          />
        ))}
      </ul>
    </Panel>
  );
}
