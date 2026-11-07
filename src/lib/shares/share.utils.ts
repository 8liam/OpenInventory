import { COPY } from "../copy/copy.config.ts";
import type { StorageUnit } from "../storage/storage.types.ts";
import type { ShareLinkSummary, ShareScope } from "./share.types.ts";

/** What a link covers, as shown to the owner. */
export function scopeLabel(scope: ShareScope, units: readonly StorageUnit[]): string {
  switch (scope.kind) {
    case "all":
      return COPY.shares.scopeAll;
    case "unit":
      return units.find((u) => u.id === scope.unitId)?.name ?? COPY.shares.scopeGoneUnit;
    case "items":
      return COPY.shares.selectedCount(scope.itemIds.length);
  }
}

/** Whether a link has passed its expiry, judged by the browser's clock. */
export function isExpired(link: ShareLinkSummary, now: number): boolean {
  return link.expiresAt !== null && now >= link.expiresAt;
}
