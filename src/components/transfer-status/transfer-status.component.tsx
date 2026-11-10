import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { accountName } from "~/lib/accounts/account-names";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { TRANSFER_STATUS } from "./transfer-status.config";

const { classes } = TRANSFER_STATUS;
import type { TransferBannerProps } from "./transfer-status.types";

/** Banner for one account's running/last transfer. */
function TransferBanner({ account, named }: TransferBannerProps) {
  const { transfer } = account.snapshot;
  const accountId = { accountId: account.steamId };
  const owner = named ? <p className={classes.owner}>{accountName(account)}</p> : null;
  const [cancelling, setCancelling] = useState(false);
  if (transfer.status === "idle") return null;

  if (transfer.status === "running") {
    const percent = transfer.total > 0 ? (transfer.done / transfer.total) * 100 : 0;
    return (
      <div className={classes.banner}>
        {owner}
        <div className={classes.row}>
          <p className={classes.text}>
            {TRANSFER_STATUS.running(
              transfer.done,
              transfer.total,
              transfer.fromName,
              transfer.toName,
            )}
            {transfer.plan &&
              ` · ${TRANSFER_STATUS.planStep(transfer.plan.step, transfer.plan.steps)}`}
          </p>
          <Button
            small
            disabled={cancelling}
            onClick={() => {
              setCancelling(true);
              void postJson(STORAGE_API.transferCancel, accountId);
            }}
          >
            {cancelling ? TRANSFER_STATUS.cancelling : TRANSFER_STATUS.cancel}
          </Button>
        </div>
        <div className={classes.track}>
          <div className={classes.bar} style={{ width: `${percent}%` }} />
        </div>
      </div>
    );
  }

  const failed = transfer.failures.length;
  return (
    <div className={classes.banner}>
      {owner}
      <div className={classes.row}>
        <p className={classes.text}>
          {transfer.plan
            ? TRANSFER_STATUS.planFinished(transfer.done, transfer.total, transfer.plan.steps)
            : TRANSFER_STATUS.finished(transfer.done, transfer.total, transfer.toName)}
          {transfer.cancelled && ` · ${TRANSFER_STATUS.cancelled}`}
        </p>
        <Button
          small
          onClick={() => {
            setCancelling(false);
            void postJson(STORAGE_API.transferDismiss, accountId);
          }}
        >
          {TRANSFER_STATUS.dismiss}
        </Button>
      </div>
      {failed > 0 && (
        <ul className={classes.failures}>
          {transfer.failures.slice(0, TRANSFER_STATUS.maxFailuresShown).map((f) => (
            <li key={`${f.itemId}-${f.reason}`}>
              {f.name}: {f.reason}
            </li>
          ))}
          {failed > TRANSFER_STATUS.maxFailuresShown && (
            <li>{TRANSFER_STATUS.moreFailures(failed - TRANSFER_STATUS.maxFailuresShown)}</li>
          )}
        </ul>
      )}
    </div>
  );
}

/**
 * Global banners for running/finished transfers, one per account. They sit under the page, not
 * above its heading, so one appearing never pushes the page down. The wrapper is always mounted:
 * it is the live region that announces them and the target focus moves to when the control that
 * started a transfer goes away.
 */
export function TransferStatus() {
  const { accounts } = useAppSnapshot();
  return (
    <div
      id={TRANSFER_STATUS.regionId}
      role="status"
      aria-label={TRANSFER_STATUS.regionLabel}
      tabIndex={-1}
      className={classes.region}
    >
      {accounts.map((account) => (
        <TransferBanner key={account.steamId} account={account} named={accounts.length > 1} />
      ))}
    </div>
  );
}
