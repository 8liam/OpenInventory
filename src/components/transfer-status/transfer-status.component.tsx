import { Check, CircleX } from "lucide-react";
import { useId, useState } from "react";
import { Button } from "~/components/button/button.component";
import { accountName } from "~/lib/accounts/account-names";
import { postJson, useAppSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { cn } from "~/utils/cn";
import { formatInteger } from "~/utils/format";
import { TRANSFER_STATUS } from "./transfer-status.config";
import type { ConveyorProps, TransferBannerProps } from "./transfer-status.types";

const { classes } = TRANSFER_STATUS;

/** Two docks and a belt. The Game Coordinator confirms each move on its own, so one tile rides at a time. */
function Conveyor({ fromName, toName, remaining, moved, moving }: ConveyorProps) {
  const rollersId = useId();
  return (
    <div className={classes.conveyor} aria-hidden>
      <div className={classes.dock}>
        <span className={classes.dockName}>{fromName}</span>
        <span className={classes.dockCount}>{formatInteger(remaining)}</span>
      </div>
      <div className={classes.belt}>
        <svg className={classes.rollers} preserveAspectRatio="none">
          <defs>
            <pattern
              id={rollersId}
              width={TRANSFER_STATUS.rollerSpacing}
              height={4}
              patternUnits="userSpaceOnUse"
            >
              <circle cx={TRANSFER_STATUS.rollerSpacing / 2} cy={2} r={2} fill="currentColor" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill={`url(#${rollersId})`} />
        </svg>
        {moving && <span className={classes.tile} />}
      </div>
      <div className={cn(classes.dock, classes.dockRight)}>
        <span className={classes.dockName}>{toName}</span>
        <span className={classes.dockCount}>{formatInteger(moved)}</span>
      </div>
    </div>
  );
}

/** Banner for one account's running/last transfer. */
function TransferBanner({ account, named }: TransferBannerProps) {
  const { transfer } = account.snapshot;
  const accountId = { accountId: account.steamId };
  const owner = named ? <p className={classes.owner}>{accountName(account)}</p> : null;
  const [cancelling, setCancelling] = useState(false);
  if (transfer.status === "idle") return null;

  const percent = transfer.total > 0 ? (transfer.done / transfer.total) * 100 : 0;
  const progress = (live: boolean) => (
    <div
      className={classes.track}
      role="progressbar"
      aria-label={TRANSFER_STATUS.progressLabel}
      aria-valuemin={0}
      aria-valuemax={transfer.total}
      aria-valuenow={transfer.done}
    >
      <div className={live ? classes.bar : classes.barDone} style={{ width: `${percent}%` }} />
    </div>
  );

  if (transfer.status === "running") {
    return (
      <div className={classes.banner}>
        {owner}
        <div className={classes.row}>
          <p className={classes.text}>
            <span aria-hidden className="live-dot" />
            <span>
              {TRANSFER_STATUS.running(
                transfer.done,
                transfer.total,
                transfer.fromName,
                transfer.toName,
              )}
              {transfer.plan &&
                ` · ${TRANSFER_STATUS.planStep(transfer.plan.step, transfer.plan.steps)}`}
            </span>
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
        <Conveyor
          fromName={transfer.fromName}
          toName={transfer.toName}
          remaining={transfer.total - transfer.done}
          moved={transfer.done}
          moving
        />
        {progress(true)}
      </div>
    );
  }

  const failed = transfer.failures.length;
  const StatusIcon = failed > 0 ? CircleX : Check;
  return (
    <div className={classes.banner}>
      {owner}
      <div className={classes.row}>
        <p className={cn(classes.text, failed > 0 ? classes.failed : classes.done)}>
          <StatusIcon size={TRANSFER_STATUS.iconSize} className={classes.statusIcon} aria-hidden />
          <span>
            {transfer.plan
              ? TRANSFER_STATUS.planFinished(transfer.done, transfer.total, transfer.plan.steps)
              : TRANSFER_STATUS.finished(transfer.done, transfer.total, transfer.toName)}
            {transfer.cancelled && ` · ${TRANSFER_STATUS.cancelled}`}
          </span>
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
      {progress(false)}
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
