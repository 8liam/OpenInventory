import type { Marketplace } from "../settings/settings.types.ts";
import type { ItemBase } from "../items/item.types.ts";
import type { SHARE_EXPIRY_OPTIONS, SHARE_SCOPE_KINDS } from "./share.config.ts";

export type ShareScopeKind = (typeof SHARE_SCOPE_KINDS)[number];

/** What a link exposes: everything, one storage unit, or an explicit list of item ids. */
export type ShareScope =
  | { readonly kind: "all" }
  | { readonly kind: "unit"; readonly unitId: string }
  | { readonly kind: "items"; readonly itemIds: readonly string[] };

export type ShareExpiry = (typeof SHARE_EXPIRY_OPTIONS)[number];

/** An owner's link as listed in Settings. Never carries the token or its hash. */
export type ShareLinkSummary = {
  readonly id: string;
  readonly scope: ShareScope;
  readonly hidePrices: boolean;
  readonly currency: string;
  readonly marketplace: Marketplace;
  readonly createdAt: number;
  /** Epoch ms after which the link stops working; null when it never expires. */
  readonly expiresAt: number | null;
};

export type ShareListResponse = {
  readonly links: readonly ShareLinkSummary[];
};

/** Returned once, on creation: the only time the plaintext token exists outside the recipient's URL. */
export type ShareCreatedResponse = {
  readonly link: ShareLinkSummary;
  /** Path under `SHARE_API.pagePrefix`; the page is built from the browser's origin. */
  readonly path: string;
};

export type CreateShareRequest = {
  readonly scope: ShareScope;
  readonly hidePrices: boolean;
  readonly expiry: ShareExpiry;
  readonly currency: string;
  readonly marketplace: Marketplace;
};

export type RevokeShareRequest = {
  readonly id: string;
};

/**
 * One item in a public share. This is a whitelist: nothing else from the owner's
 * inventory (asset ids, location ids, Terminal state, account data) is ever sent.
 * `price` is absent entirely when the owner hid prices.
 */
export type SharedItem = Pick<
  ItemBase,
  | "name"
  | "marketHashName"
  | "imageUrl"
  | "rarityColor"
  | "rarityName"
  | "category"
  | "customName"
  | "wear"
  | "wearName"
  | "isStatTrak"
  | "isSouvenir"
  | "stickers"
  | "charms"
> & {
  readonly locationName: string;
  readonly price?: number | null;
};

export type SharedInventory = {
  readonly title: string;
  readonly items: readonly SharedItem[];
  /** Null when prices are hidden. */
  readonly currency: string | null;
  /** Sum of priced items; null when prices are hidden or none are priced. */
  readonly totalValue: number | null;
  readonly expiresAt: number | null;
};
