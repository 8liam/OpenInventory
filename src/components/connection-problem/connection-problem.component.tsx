import { RefreshCw, Unplug } from "lucide-react";
import { Button } from "~/components/button/button.component";
import { Logo } from "~/components/logo/logo.component";
import { retrySnapshotConnection } from "~/lib/storage/storage.client";
import { SNAPSHOT_CONNECTION } from "~/lib/storage/storage.config";
import { CONNECTION_PROBLEM } from "./connection-problem.config";
import type { ConnectionProblemProps } from "./connection-problem.types";

/** First load failed: say why instead of showing a skeleton forever, and offer the fix. */
export function ConnectionProblem({ reason }: ConnectionProblemProps) {
  const copy = CONNECTION_PROBLEM.copy[reason];
  const incompatible = reason === SNAPSHOT_CONNECTION.incompatible;
  return (
    <div className="flex h-dvh items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Logo className="mb-8 justify-center text-lg" />
        <div role="alert" className="rounded-lg border bg-card p-6">
          <div className="flex items-center gap-2">
            <Unplug size={CONNECTION_PROBLEM.iconSize} className="text-destructive" aria-hidden />
            <h1 className="text-[15px] font-semibold tracking-tight">{copy.title}</h1>
          </div>
          <p className="mt-1.5 text-muted-foreground">{copy.body}</p>
          <Button
            variant="primary"
            className="mt-5 w-full"
            onClick={() => (incompatible ? window.location.reload() : retrySnapshotConnection())}
          >
            <RefreshCw size={CONNECTION_PROBLEM.iconSize} aria-hidden />
            {incompatible ? CONNECTION_PROBLEM.reload : CONNECTION_PROBLEM.retry}
          </Button>
        </div>
      </div>
    </div>
  );
}
