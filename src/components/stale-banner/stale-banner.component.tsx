import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { PAGE_HEADER } from "~/components/page-header/page-header.config";
import { Button } from "~/components/button/button.component";
import { useStaleData } from "~/lib/storage/stale-data.store";
import { retrySnapshotConnection } from "~/lib/storage/storage.client";
import type { StaleDataState } from "~/lib/storage/storage.types";
import { formatDateTime, formatRelativeTime } from "~/utils/format";
import { RELATIVE_TIME } from "~/utils/format.config";
import { restoreLostFocus } from "~/utils/restore-focus";
import { STALE_BANNER } from "./stale-banner.config";
import type { StaleBannerBodyProps, StaleSummary } from "./stale-banner.types";

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

/** The visible banner; mounted only while something is stale, so its clock starts fresh. */
function StaleBannerBody({ stale }: StaleBannerBodyProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), RELATIVE_TIME.refreshMs);
    return () => clearInterval(timer);
  }, []);

  const { message, since } = summarize(stale);
  const Icon = STALE_BANNER.icon;

  function retry() {
    if (stale.reconnecting) retrySnapshotConnection();
    for (const load of stale.staleLoads) load.refresh();
  }

  return (
    <div className={STALE_BANNER.rootClass}>
      <p className={STALE_BANNER.messageClass}>
        <Icon size={STALE_BANNER.iconSize} className={STALE_BANNER.iconClass} aria-hidden />
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
  );
}

/**
 * Says when the screen shows old data: the live stream dropped, or a refresh failed while the
 * last good data stays up. Retry reconnects and refetches at once without blanking anything.
 */
export function StaleBanner() {
  const stale = useStaleData();
  const visible = stale.reconnecting || stale.staleLoads.length > 0;
  // A successful Retry removes the banner and the focused button with it; focus goes to the
  // page heading, just below where the banner was, instead of falling to the page.
  const hadFocus = useRef(false);
  useEffect(() => {
    if (visible || !hadFocus.current) return;
    hadFocus.current = false;
    restoreLostFocus(document.getElementById(PAGE_HEADER.headingId));
  }, [visible]);
  return (
    <>
      {/* Always mounted, so losing the connection is announced politely. */}
      <p role="status" className="sr-only">
        {visible ? summarize(stale).message : ""}
      </p>
      {visible && (
        <div
          className={STALE_BANNER.wrapperClass}
          onFocus={() => {
            hadFocus.current = true;
          }}
          onBlur={(event) => {
            if (event.relatedTarget !== null) hadFocus.current = false;
          }}
        >
          <StaleBannerBody stale={stale} />
        </div>
      )}
    </>
  );
}
