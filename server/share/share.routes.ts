import { SHARE_API, SHARE_EXPIRY_MS } from "../../src/lib/shares/share.config.ts";
import type { ItemView } from "../../src/lib/items/item.types.ts";
import type { StorageUnit } from "../../src/lib/storage/storage.types.ts";
import type {
  CreateShareRequest,
  ShareCreatedResponse,
  ShareLinkSummary,
  ShareListResponse,
  ShareScope,
  SharedInventory,
} from "../../src/lib/shares/share.types.ts";
import { UserFacingError } from "../steam/steam.types.ts";
import type { RateLimiter } from "./rate-limit.types.ts";
import { hashShareToken, isWellFormedToken } from "./share-token.ts";
import { SHARE_ERRORS, SHARE_HEADERS, SHARE_PUBLIC_PATHS, SHARE_STATUS } from "./share.config.ts";
import type { StoredShareLink } from "./share.types.ts";
import { buildSharedInventory, selectForScope } from "./share-view.ts";

export type ShareHttpResult = {
  readonly status: number;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
};

/** Every public response: never cached, so revocation takes effect at once, and never indexed. */
const PUBLIC_HEADERS: Readonly<Record<string, string>> = {
  "cache-control": SHARE_HEADERS.cacheControl,
  "x-robots-tag": SHARE_HEADERS.robots,
};

function publicResponse(
  status: number,
  body: unknown,
  extra: Readonly<Record<string, string>> = {},
): ShareHttpResult {
  return { status, headers: { ...PUBLIC_HEADERS, ...extra }, body };
}

const NOT_FOUND = publicResponse(SHARE_STATUS.notFound, { error: SHARE_ERRORS.notFound });

/** What the public route needs from the running server, injected so it can be tested. */
export type PublicShareDeps = {
  readonly findLink: (tokenHash: string) => StoredShareLink | undefined;
  readonly now: () => number;
  readonly limiter: RateLimiter;
  readonly account: () => { readonly ready: boolean; readonly steamId: string | undefined };
  /** Every item and unit the owner holds; prices are only loaded when the link shows them. */
  readonly loadItems: (
    link: StoredShareLink,
  ) => Promise<{ readonly items: readonly ItemView[]; readonly units: readonly StorageUnit[] }>;
};

export type PublicShareRequest = {
  readonly method: string;
  /** The path segment after the share prefix, exactly as received. */
  readonly token: string;
  /** The client address, the only key the rate limit uses. */
  readonly clientKey: string;
};

const READ_METHODS: ReadonlySet<string> = new Set(["GET", "HEAD"]);

function isExpired(link: StoredShareLink, at: number): boolean {
  return link.expiresAt !== null && at >= link.expiresAt;
}

/**
 * The unauthenticated, read-only share endpoint. Every way a link can be unusable
 * (unknown, malformed, revoked, expired, owned by another account, naming a unit
 * that is gone) gets the same 404, so a caller learns nothing about tokens.
 */
export async function handlePublicShare(
  request: PublicShareRequest,
  deps: PublicShareDeps,
): Promise<ShareHttpResult> {
  if (!READ_METHODS.has(request.method)) {
    return publicResponse(SHARE_STATUS.methodNotAllowed, {
      error: SHARE_ERRORS.methodNotAllowed,
    });
  }
  const decision = deps.limiter.hit(request.clientKey);
  if (!decision.allowed) {
    return publicResponse(
      SHARE_STATUS.tooManyRequests,
      { error: SHARE_ERRORS.rateLimited },
      { "retry-after": String(decision.retryAfterSeconds) },
    );
  }
  if (!isWellFormedToken(request.token)) return NOT_FOUND;
  const link = deps.findLink(hashShareToken(request.token));
  if (!link || isExpired(link, deps.now())) return NOT_FOUND;
  const account = deps.account();
  if (!account.ready) {
    return publicResponse(SHARE_STATUS.unavailable, { error: SHARE_ERRORS.unavailable });
  }
  if (account.steamId !== link.steamId) return NOT_FOUND;

  const { items, units } = await deps.loadItems(link);
  const selection = selectForScope(link.scope, items, units);
  if (!selection) return NOT_FOUND;
  const body: SharedInventory = buildSharedInventory({
    selection,
    hidePrices: link.hidePrices,
    currency: link.currency,
    expiresAt: link.expiresAt,
  });
  return publicResponse(SHARE_STATUS.ok, body);
}

/** The owner's view of a link: the token and its hash are left out. */
export function toSummary(link: StoredShareLink): ShareLinkSummary {
  return {
    id: link.id,
    scope: link.scope,
    hidePrices: link.hidePrices,
    currency: link.currency,
    marketplace: link.marketplace,
    createdAt: link.createdAt,
    expiresAt: link.expiresAt,
  };
}

export function listOwnerShares(links: readonly StoredShareLink[]): ShareListResponse {
  return { links: links.map(toSummary) };
}

/** What creating a link needs from the running server, injected for tests. */
export type CreateShareDeps = {
  readonly steamId: string;
  readonly now: () => number;
  readonly newId: () => string;
  readonly newToken: () => string;
  readonly insert: (link: StoredShareLink) => void;
  /** Ids of every item the owner holds right now; a selection must be drawn from these. */
  readonly knownItemIds: ReadonlySet<string>;
  readonly unitIds: ReadonlySet<string>;
};

function assertScopeExists(scope: ShareScope, deps: CreateShareDeps): void {
  if (scope.kind === "unit" && !deps.unitIds.has(scope.unitId)) {
    throw new UserFacingError("That storage unit doesn't exist", SHARE_STATUS.badRequest);
  }
  if (scope.kind === "items" && !scope.itemIds.every((id) => deps.knownItemIds.has(id))) {
    throw new UserFacingError(
      "Some of those items are no longer in your inventory",
      SHARE_STATUS.badRequest,
    );
  }
}

/**
 * Creates a link. The plaintext token is returned here and nowhere else: only its
 * hash is stored, so a lost link can't be shown again, only revoked and replaced.
 */
export function createOwnerShare(
  request: CreateShareRequest,
  deps: CreateShareDeps,
): ShareCreatedResponse {
  assertScopeExists(request.scope, deps);
  const token = deps.newToken();
  const createdAt = deps.now();
  const link: StoredShareLink = {
    id: deps.newId(),
    steamId: deps.steamId,
    tokenHash: hashShareToken(token),
    scope: request.scope,
    hidePrices: request.hidePrices,
    currency: request.currency,
    marketplace: request.marketplace,
    createdAt,
    expiresAt: request.expiry === "never" ? null : createdAt + SHARE_EXPIRY_MS[request.expiry],
  };
  deps.insert(link);
  return { link: toSummary(link), path: `${SHARE_API.pagePrefix}${token}` };
}

/** Revokes one of the owner's links by its id. Throws 404 when it isn't theirs or doesn't exist. */
export function revokeOwnerShare(
  id: string,
  steamId: string,
  remove: (steamId: string, id: string) => boolean,
): void {
  if (!remove(steamId, id)) {
    throw new UserFacingError(SHARE_ERRORS.notFound, SHARE_STATUS.notFound);
  }
}

/**
 * Paths served without the password: the share page (GET only), build assets and the
 * favicon. They hold no owner data, so a recipient's browser can load the share page.
 */
export function isUnauthenticatedShellPath(method: string, path: string): boolean {
  if (!READ_METHODS.has(method)) return false;
  return (
    SHARE_PUBLIC_PATHS.page.test(path) ||
    path.startsWith(SHARE_PUBLIC_PATHS.assetPrefix) ||
    path === SHARE_PUBLIC_PATHS.icon
  );
}
