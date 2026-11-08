import { useEffect, useRef } from "react";
import { PAGE_HEADER } from "~/components/page-header/page-header.config";
import { restoreLostFocus } from "~/utils/restore-focus";
import { REMOTE_STATUS } from "./storage.config";
import type { RemoteData } from "./storage.types";

/**
 * The error and its Retry button stay mounted (and focused) while a retry runs, and unmount only
 * when the load recovers, which would leave focus on `<body>`. Put focus on the page heading
 * then, so keyboard and screen-reader users carry on from the top of the page. Focus the user has already moved elsewhere is kept.
 */
export function useRestoreFocusOnRecovery(status: RemoteData<unknown>["status"]): void {
  const failed = useRef(false);
  useEffect(() => {
    if (status === REMOTE_STATUS.error) failed.current = true;
    else if (status === REMOTE_STATUS.ready && failed.current) {
      failed.current = false;
      restoreLostFocus(document.getElementById(PAGE_HEADER.headingId));
    }
  }, [status]);
}
