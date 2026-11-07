/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { UserFacingError } from "../steam/steam.types.ts";
import { parseCreateShareRequest, parseRevokeShareRequest } from "./share.parse.ts";
import { SHARE_LIMITS } from "./share.config.ts";

const VALID = {
  scope: { kind: "all" },
  expiry: "never",
  currency: "USD",
  marketplace: "buff163",
  hidePrices: false,
};

function rejects(body: unknown): void {
  assert.throws(
    () => parseCreateShareRequest(body),
    (error: unknown) => error instanceof UserFacingError && error.status === 400,
  );
}

test("accepts a valid request in each scope", () => {
  assert.deepEqual(parseCreateShareRequest(VALID).scope, { kind: "all" });
  assert.deepEqual(
    parseCreateShareRequest({ ...VALID, scope: { kind: "unit", unitId: "55" } }).scope,
    {
      kind: "unit",
      unitId: "55",
    },
  );
  assert.deepEqual(
    parseCreateShareRequest({ ...VALID, scope: { kind: "items", itemIds: ["1", "2", "1"] } }).scope,
    { kind: "items", itemIds: ["1", "2"] },
  );
});

test("rejects unknown expiries, marketplaces, currencies and non-boolean hidePrices", () => {
  rejects({ ...VALID, expiry: "forever" });
  rejects({ ...VALID, marketplace: "nowhere" });
  rejects({ ...VALID, currency: "usd" });
  rejects({ ...VALID, currency: "US" });
  rejects({ ...VALID, hidePrices: "yes" });
  rejects(undefined);
  rejects("text");
});

test("rejects malformed scopes and item lists", () => {
  rejects({ ...VALID, scope: { kind: "everything" } });
  rejects({ ...VALID, scope: { kind: "unit" } });
  rejects({ ...VALID, scope: { kind: "unit", unitId: "../x" } });
  rejects({ ...VALID, scope: { kind: "items", itemIds: [] } });
  rejects({ ...VALID, scope: { kind: "items", itemIds: ["1", "two"] } });
  rejects({ ...VALID, scope: { kind: "items", itemIds: ["inventory"] } });
  rejects({
    ...VALID,
    scope: {
      kind: "items",
      itemIds: Array.from({ length: SHARE_LIMITS.maxSharedItems + 1 }, (_, i) => String(i)),
    },
  });
});

test("revoke accepts only a link id, never anything token-shaped", () => {
  assert.deepEqual(parseRevokeShareRequest({ id: "3f2c1a4e-9b7d-4c8e-8a1f-0d2e3f4a5b6c" }), {
    id: "3f2c1a4e-9b7d-4c8e-8a1f-0d2e3f4a5b6c",
  });
  assert.throws(() => parseRevokeShareRequest({ id: "not-a-uuid" }), UserFacingError);
  assert.throws(() => parseRevokeShareRequest({ token: "x".repeat(43) }), UserFacingError);
});
