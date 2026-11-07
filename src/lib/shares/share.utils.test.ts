/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { COPY } from "../copy/copy.config.ts";
import { isExpired, scopeLabel } from "./share.utils.ts";
import type { ShareLinkSummary } from "./share.types.ts";

const UNIT = { id: "55", name: "Locker", itemCount: 3, loaded: true };
const LINK: ShareLinkSummary = {
  id: "3f2c1a4e-9b7d-4c8e-8a1f-0d2e3f4a5b6c",
  scope: { kind: "all" },
  hidePrices: false,
  currency: "USD",
  marketplace: "buff163",
  createdAt: 0,
  expiresAt: 1_000,
};

test("scope labels name the unit, count selected items, and survive a removed unit", () => {
  assert.equal(scopeLabel({ kind: "all" }, [UNIT]), COPY.shares.scopeAll);
  assert.equal(scopeLabel({ kind: "unit", unitId: "55" }, [UNIT]), "Locker");
  assert.equal(scopeLabel({ kind: "unit", unitId: "99" }, [UNIT]), COPY.shares.scopeGoneUnit);
  assert.equal(
    scopeLabel({ kind: "items", itemIds: ["1", "2"] }, []),
    COPY.shares.selectedCount(2),
  );
});

test("a link is expired from its expiry instant, and never when it has none", () => {
  assert.equal(isExpired(LINK, 999), false);
  assert.equal(isExpired(LINK, 1_000), true);
  assert.equal(isExpired({ ...LINK, expiresAt: null }, Number.MAX_SAFE_INTEGER), false);
});
