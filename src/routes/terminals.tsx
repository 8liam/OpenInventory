import { createFileRoute } from "@tanstack/react-router";
import { LoadError } from "~/components/load-error/load-error.component";
import { PageHeader } from "~/components/page-header/page-header.component";
import { TerminalList } from "~/components/terminal-list/terminal-list.component";
import { COPY } from "~/lib/copy/copy.config";
import type { InventoryResponse } from "~/lib/items/item.types";
import { usePriceQuery } from "~/lib/settings/settings.store";
import { useScopedPath } from "~/lib/accounts/account-scope.hooks";
import { useRemoteData, useStorageSnapshot } from "~/lib/storage/storage.client";
import { STORAGE_API } from "~/lib/storage/storage.config";

export const Route = createFileRoute("/terminals")({ component: TerminalsPage });

function TerminalsPage() {
  const snapshot = useStorageSnapshot();
  const priceQuery = usePriceQuery();
  const data = useRemoteData<InventoryResponse>(
    useScopedPath(`${STORAGE_API.items}?${priceQuery}`),
    snapshot.revision,
  );
  const terminals =
    data.status === "ready" ? data.data.items.filter((item) => item.terminal !== null) : [];
  return (
    <>
      <PageHeader title={COPY.terminal.pageTitle} description={COPY.terminal.pageDescription} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        {data.status === "loading" && (
          <p className="text-sm text-muted-foreground">{COPY.common.loading}</p>
        )}
        {data.status === "error" && <LoadError message={data.message} onRetry={data.retry} />}
        {data.status === "ready" &&
          (terminals.length === 0 ? (
            <p className="text-sm text-muted-foreground">{COPY.terminal.noTerminals}</p>
          ) : (
            <TerminalList terminals={terminals} />
          ))}
      </div>
    </>
  );
}
