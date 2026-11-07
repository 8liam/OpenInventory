import { MARKETPLACES } from "../../src/lib/settings/settings.config.ts";
import { SHARE_EXPIRY_OPTIONS, SHARE_SCOPE_KINDS } from "../../src/lib/shares/share.config.ts";
import type {
  CreateShareRequest,
  RevokeShareRequest,
  ShareScope,
} from "../../src/lib/shares/share.types.ts";
import { UserFacingError } from "../steam/steam.types.ts";
import {
  SHARE_CURRENCY_PATTERN,
  SHARE_ERRORS,
  SHARE_ID_PATTERN,
  SHARE_ITEM_ID_PATTERN,
  SHARE_LIMITS,
  SHARE_STATUS,
} from "./share.config.ts";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseItemIds(value: unknown): readonly string[] | undefined {
  if (!Array.isArray(value) || value.length === 0 || value.length > SHARE_LIMITS.maxSharedItems)
    return undefined;
  if (!value.every((id): id is string => typeof id === "string" && SHARE_ITEM_ID_PATTERN.test(id)))
    return undefined;
  return [...new Set(value)];
}

function parseScope(value: unknown): ShareScope | undefined {
  if (!isRecord(value)) return undefined;
  const kind = SHARE_SCOPE_KINDS.find((k) => k === value.kind);
  switch (kind) {
    case "all":
      return { kind };
    case "unit":
      return typeof value.unitId === "string" && SHARE_ITEM_ID_PATTERN.test(value.unitId)
        ? { kind, unitId: value.unitId }
        : undefined;
    case "items": {
      const itemIds = parseItemIds(value.itemIds);
      return itemIds ? { kind, itemIds } : undefined;
    }
    case undefined:
      return undefined;
  }
}

/** Validates a create request from the browser; anything malformed is a 400. */
export function parseCreateShareRequest(body: unknown): CreateShareRequest {
  const record = isRecord(body) ? body : {};
  const scope = parseScope(record.scope);
  const expiry = SHARE_EXPIRY_OPTIONS.find((e) => e === record.expiry);
  const marketplace = MARKETPLACES.find((m) => m === record.marketplace);
  const currency =
    typeof record.currency === "string" && SHARE_CURRENCY_PATTERN.test(record.currency)
      ? record.currency
      : undefined;
  if (!scope || !expiry || !marketplace || !currency || typeof record.hidePrices !== "boolean") {
    throw new UserFacingError(SHARE_ERRORS.invalidRequest, SHARE_STATUS.badRequest);
  }
  return { scope, expiry, marketplace, currency, hidePrices: record.hidePrices };
}

/** Validates a revoke request; the id is the link's public id, never its token. */
export function parseRevokeShareRequest(body: unknown): RevokeShareRequest {
  const id = isRecord(body) ? body.id : undefined;
  if (typeof id !== "string" || !SHARE_ID_PATTERN.test(id)) {
    throw new UserFacingError(SHARE_ERRORS.invalidRequest, SHARE_STATUS.badRequest);
  }
  return { id };
}
