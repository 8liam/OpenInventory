import { RefreshCw } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { LOAD_ERROR } from "./load-error.config";
import type { LoadErrorProps } from "./load-error.types";

const { classes } = LOAD_ERROR;

/** A failed load or action: what went wrong and a way to try again, in place of an endless skeleton. */
export function LoadError({
  title = LOAD_ERROR.title,
  message,
  onRetry,
  retrying = false,
}: LoadErrorProps) {
  return (
    <div role="alert" className={classes.root}>
      <div className={classes.body}>
        <p className={classes.title}>{title}</p>
        <p className={classes.message}>{message}</p>
      </div>
      {/* Stays focusable while retrying (a disabled button would drop focus to the page); a press is ignored. */}
      <Button
        small
        aria-disabled={retrying}
        className={retrying ? LOAD_ERROR.busyClass : undefined}
        onClick={retrying ? undefined : onRetry}
      >
        <RefreshCw
          size={LOAD_ERROR.iconSize}
          aria-hidden
          className={retrying ? LOAD_ERROR.spinClass : undefined}
        />
        {retrying ? LOAD_ERROR.retrying : LOAD_ERROR.retry}
      </Button>
    </div>
  );
}
