import { useState } from "react";
import { Button } from "~/components/button/button.component";
import { callStorageApi, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";
import { TRANSFER_STATUS } from "./transfer-status.config";

/** Global banner for the running/last transfer; lives above every page. */
export function TransferStatus() {
  const { transfer } = useStorageSnapshot();
  const [cancelling, setCancelling] = useState(false);
  if (transfer.status === "idle") return null;

  if (transfer.status === "running") {
    const percent = transfer.total > 0 ? (transfer.done / transfer.total) * 100 : 0;
    return (
      <div className="shrink-0 rounded-lg border bg-card px-4 py-3" role="status">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="tabular">
            {TRANSFER_STATUS.running(
              transfer.done,
              transfer.total,
              transfer.fromName,
              transfer.toName,
            )}
          </p>
          <Button
            small
            disabled={cancelling}
            onClick={() => {
              setCancelling(true);
              void callStorageApi(STORAGE_API.transferCancel);
            }}
          >
            {cancelling ? TRANSFER_STATUS.cancelling : TRANSFER_STATUS.cancel}
          </Button>
        </div>
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>
    );
  }

  const failed = transfer.failures.length;
  return (
    <div className="shrink-0 rounded-lg border bg-card px-4 py-3" role="status">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="tabular">
          {TRANSFER_STATUS.finished(transfer.done, transfer.total, transfer.toName)}
          {transfer.cancelled && ` · ${TRANSFER_STATUS.cancelled}`}
        </p>
        <Button
          small
          onClick={() => {
            setCancelling(false);
            void callStorageApi(STORAGE_API.transferDismiss);
          }}
        >
          {TRANSFER_STATUS.dismiss}
        </Button>
      </div>
      {failed > 0 && (
        <ul className="mt-2 flex flex-col gap-1 text-xs text-destructive">
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
