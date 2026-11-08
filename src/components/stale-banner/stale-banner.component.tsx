import { RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "~/components/button/button.component";
import { useStaleData } from "~/lib/storage/stale-data.store";
import { retrySnapshotConnection } from "~/lib/storage/storage.client";
import type { StaleDataState } from "~/lib/storage/storage.types";
import { formatDateTime, formatRelativeTime } from "~/utils/format";
import { RELATIVE_TIME } from "~/utils/format.config";
import { STALE_BANNER } from "./stale-banner.config";
import type { StaleSummary } from "./stale-banner.types";

function summarize({ reconnecting, lastSnapshotAt, staleLoads }: StaleDataState): StaleSummary {
  const times = [
    ...(reconnecting && lastSnapshotAt !== null ? [lastSnapshotAt] : []),
    ...staleLoads.map((load) => load.lastSuccessAt),
  ];
  return {
    message: reconnecting ? STALE_BANNER.reconnecting : STALE_BANNER.refreshFailed,
    since: times.length > 0 ? Math.min(...times) : null,
  };
}

/**
 * Says when the screen shows old data: the live stream dropped, or a refresh failed while the
 * last good data stays up. Retry reconnects and refetches at once without blanking anything.
 */
export function StaleBanner() {
  const stale = useStaleData();
  const [now, setNow] = useState(() => Date.now());
  const visible = stale.reconnecting || stale.staleLoads.length > 0;

  useEffect(() => {
    if (!visible) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), RELATIVE_TIME.refreshMs);
    return () => clearInterval(timer);
  }, [visible]);

  const { message, since } = summarize(stale);
  const Icon = STALE_BANNER.icon;

  function retry() {
    if (stale.reconnecting) retrySnapshotConnection();
    for (const load of stale.staleLoads) load.refresh();
  }

  return (
    <>
      {/* Always mounted, so losing the connection is announced politely. */}
      <p role="status" className="sr-only">
        {visible ? message : ""}
      </p>
      {visible && (
        <div className={STALE_BANNER.rootClass}>
          <p className="flex min-w-0 items-center gap-2">
            <Icon size={STALE_BANNER.iconSize} className="shrink-0 text-warning" aria-hidden />
            <span>
              {message}
              {since !== null &&
                ` ${STALE_BANNER.showingSince(formatDateTime(since), formatRelativeTime(since, now))}`}
            </span>
          </p>
          <Button small onClick={retry}>
            <RefreshCw size={STALE_BANNER.iconSize} aria-hidden />
            {STALE_BANNER.retry}
          </Button>
        </div>
      )}
    </>
  );
}
