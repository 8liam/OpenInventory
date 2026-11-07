import type { Marketplace } from "../../src/lib/settings/settings.types.ts";
import type { ShareScope } from "../../src/lib/shares/share.types.ts";

/** A link as stored: the token itself is never kept, only its hash. */
export type StoredShareLink = {
  readonly id: string;
  readonly steamId: string;
  readonly tokenHash: string;
  readonly scope: ShareScope;
  readonly hidePrices: boolean;
  readonly currency: string;
  readonly marketplace: Marketplace;
  readonly createdAt: number;
  readonly expiresAt: number | null;
};
