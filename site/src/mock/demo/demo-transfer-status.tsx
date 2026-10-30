import { X } from "lucide-react";
import { formatInteger } from "~/utils/format";
import type { DemoTransfer } from "./use-demo-inventory";

/** Shows the simulated move; mirrors the real app's status strip and says plainly that nothing was sent. */
export function DemoTransferStatus({
  transfer,
  onDismiss,
}: {
  readonly transfer: DemoTransfer;
  readonly onDismiss: () => void;
}) {
  if (transfer.status === "idle") return null;
  const running = transfer.status === "running";
  const done = running ? transfer.done : transfer.total;
  return (
    <div className="shrink-0 rounded-lg border bg-card px-4 py-3" role="status">
      <div className="flex items-center justify-between gap-3">
        <p className="font-medium">
          {running ? "Moving" : "Moved"} {formatInteger(done)} of {formatInteger(transfer.total)}{" "}
          items
          <span className="text-muted-foreground">
            {" "}
            · {transfer.fromName} to {transfer.toName}
          </span>
        </p>
        {!running && (
          <button
            type="button"
            aria-label="Dismiss"
            onClick={onDismiss}
            className="text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        )}
      </div>
      <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-200"
          style={{ width: `${(done / transfer.total) * 100}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Sample data. This demo moves rows in your browser and sends nothing to Steam.
      </p>
    </div>
  );
}
