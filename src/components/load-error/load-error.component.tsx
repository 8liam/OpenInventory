import { RefreshCw } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { LOAD_ERROR } from "./load-error.config";
import type { LoadErrorProps } from "./load-error.types";

/** A failed load or action: what went wrong and a way to try again, in place of an endless skeleton. */
export function LoadError({ title = LOAD_ERROR.title, message, onRetry }: LoadErrorProps) {
  return (
    <div
      role="alert"
      className="flex shrink-0 flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/40 bg-card px-4 py-3"
    >
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        <p className="mt-0.5 text-destructive">{message}</p>
      </div>
      <Button small onClick={onRetry}>
        <RefreshCw size={LOAD_ERROR.iconSize} aria-hidden />
        {LOAD_ERROR.retry}
      </Button>
    </div>
  );
}
