/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, test } from "node:test";
import { openDatabase } from "../db/db.ts";
import type { Database } from "../db/db.types.ts";
import { UserFacingError } from "../steam/steam.types.ts";
import { createRateLimiter } from "./rate-limit.ts";
import { createShareToken, hashShareToken } from "./share-token.ts";
import { SHARE_API } from "../../src/lib/shares/share.config.ts";
import { OWNER_STEAM_ID, makeItem, makeLink, PRIVATE, UNIT } from "./share.fixtures.ts";
import {
  createOwnerShare,
  handlePublicShare,
  isUnauthenticatedShellPath,
  listOwnerShares,
  revokeOwnerShare,
  type PublicShareDeps,
} from "./share.routes.ts";
import type { StoredShareLink } from "./share.types.ts";
import { SHARE_LIMITS, SHARE_STATUS } from "./share.config.ts";

const DAY = 86_400_000;
const T0 = 1_700_000_000_000;
const LINK_ID = "3f2c1a4e-9b7d-4c8e-8a1f-0d2e3f4a5b6c";

const cleanups: (() => void)[] = [];
afterEach(() => {
  while (cleanups.length > 0) cleanups.pop()?.();
});

function tempDb(): { db: Database; dir: string } {
  const dir = mkdtempSync(join(tmpdir(), "openinventory-share-"));
  cleanups.push(() => rmSync(dir, { recursive: true, force: true }));
  const db = openDatabase(dir);
  cleanups.push(() => db.close());
  return { db, dir };
}

/** Deps backed by an in-memory set of links, with a controllable clock and account. */
function harness(links: readonly StoredShareLink[] = []) {
  let at = T0;
  const account: { ready: boolean; steamId: string | undefined } = {
    ready: true,
    steamId: OWNER_STEAM_ID,
  };
  let loads = 0;
  const deps: PublicShareDeps = {
    findLink: (hash) => links.find((l) => l.tokenHash === hash),
    now: () => at,
    limiter: createRateLimiter({ limit: 1000, windowMs: 60_000, now: () => at }),
    account: () => account,
    loadItems: async () => {
      loads += 1;
      return {
        items: [
          makeItem(),
          makeItem({ id: "7", name: "Other", locationId: "inv", locationName: "Inventory" }),
        ],
        units: [UNIT],
      };
    },
  };
  return {
    deps,
    account,
    loads: () => loads,
    advance: (ms: number) => (at += ms),
    setTime: (ms: number) => (at = ms),
  };
}

/** Creates a real link through the owner path and returns its plaintext token. */
function issue(db: Database, overrides: Partial<Parameters<typeof createOwnerShare>[0]> = {}) {
  const token = createShareToken();
  const created = createOwnerShare(
    {
      scope: { kind: "all" },
      hidePrices: false,
      expiry: "never",
      currency: "USD",
      marketplace: "buff163",
      ...overrides,
    },
    {
      steamId: OWNER_STEAM_ID,
      now: () => T0,
      newId: () => LINK_ID,
      newToken: () => token,
      insert: (link) => db.insertShareLink(link),
      knownItemIds: new Set([PRIVATE.assetId, "7"]),
      unitIds: new Set([UNIT.id]),
    },
  );
  return { token, created };
}

function publicGet(token: string, clientKey = "203.0.113.5") {
  return { method: "GET", token, clientKey };
}

test("a fresh link serves the owner's items, and the token never reaches the database", () => {
  const { db, dir } = tempDb();
  const { token, created } = issue(db);
  assert.equal(created.path, `/share/${token}`);
  assert.equal(JSON.stringify(created.link).includes(token), false);

  const dump = readdirSync(dir)
    .filter((f) => f.startsWith("openinventory.db"))
    .map((f) => readFileSync(join(dir, f)).toString("latin1"))
    .join("");
  assert.equal(dump.includes(token), false, "plaintext token written to disk");
});

test("a valid token returns the read-only view with no owner identifiers", async () => {
  const { db } = tempDb();
  const { token } = issue(db);
  const stored = db.findShareLinkByHash(hashShareToken(token));
  assert.ok(stored);
  const h = harness([stored]);
  const result = await handlePublicShare(publicGet(token), h.deps);
  assert.equal(result.status, SHARE_STATUS.ok);
  assert.equal(result.headers["cache-control"], "no-store");
  assert.equal(result.headers["x-robots-tag"], "noindex, nofollow");
  const json = JSON.stringify(result.body);
  for (const secret of [
    OWNER_STEAM_ID,
    PRIVATE.assetId,
    PRIVATE.unitId,
    PRIVATE.personaName,
    token,
  ]) {
    assert.equal(json.includes(secret), false, `leaked ${secret}`);
  }
  assert.equal(h.loads(), 1);
});

test("unknown, malformed and wrong-shaped tokens all get the same 404", async () => {
  const { db } = tempDb();
  issue(db);
  const h = harness(db.listShareLinks(OWNER_STEAM_ID));
  const responses = [];
  for (const token of [
    "",
    "short",
    "x".repeat(SHARE_LIMITS.tokenLength),
    createShareToken(),
    "a/b",
    "../../etc",
  ]) {
    responses.push(await handlePublicShare(publicGet(token), h.deps));
  }
  for (const response of responses) {
    assert.equal(response.status, SHARE_STATUS.notFound);
    assert.deepEqual(response.body, { error: "Not found" });
  }
});

test("revoking a link makes it fail exactly like an unknown token", async () => {
  const { db } = tempDb();
  const { token } = issue(db);
  const stored = db.findShareLinkByHash(hashShareToken(token));
  assert.ok(stored);
  const h = harness([stored]);
  assert.equal((await handlePublicShare(publicGet(token), h.deps)).status, SHARE_STATUS.ok);

  revokeOwnerShare(LINK_ID, OWNER_STEAM_ID, (steamId, id) => db.deleteShareLink(steamId, id));
  const after = await handlePublicShare(publicGet(token), {
    ...h.deps,
    findLink: (hash) => db.findShareLinkByHash(hash),
  });
  const unknown = await handlePublicShare(publicGet(createShareToken()), {
    ...h.deps,
    findLink: (hash) => db.findShareLinkByHash(hash),
  });
  assert.equal(after.status, SHARE_STATUS.notFound);
  assert.deepEqual(after, unknown);
  assert.deepEqual(listOwnerShares(db.listShareLinks(OWNER_STEAM_ID)).links, []);
});

test("revoking someone else's link, or a missing one, is a 404 and changes nothing", () => {
  const { db } = tempDb();
  issue(db);
  assert.throws(
    () => revokeOwnerShare(LINK_ID, "76561190000000001", (s, id) => db.deleteShareLink(s, id)),
    (error: unknown) => error instanceof UserFacingError && error.status === 404,
  );
  assert.equal(db.listShareLinks(OWNER_STEAM_ID).length, 1);
});

test("a link stops working at its expiry instant, and the owner's list shows the expiry", async () => {
  const { db } = tempDb();
  const { token, created } = issue(db, { expiry: "1d" });
  assert.equal(created.link.expiresAt, T0 + DAY);
  const stored = db.findShareLinkByHash(hashShareToken(token));
  assert.ok(stored);
  const h = harness([stored]);
  h.setTime(T0 + DAY - 1);
  assert.equal((await handlePublicShare(publicGet(token), h.deps)).status, SHARE_STATUS.ok);
  h.setTime(T0 + DAY);
  assert.equal((await handlePublicShare(publicGet(token), h.deps)).status, SHARE_STATUS.notFound);
});

test("a never-expiring link has no expiry", () => {
  const { db } = tempDb();
  const { created } = issue(db);
  assert.equal(created.link.expiresAt, null);
});

test("a link served to another account's session is not found", async () => {
  const { db } = tempDb();
  const { token } = issue(db);
  const stored = db.findShareLinkByHash(hashShareToken(token));
  assert.ok(stored);
  const h = harness([stored]);
  h.account.steamId = "76561190000000001";
  assert.equal((await handlePublicShare(publicGet(token), h.deps)).status, SHARE_STATUS.notFound);
});

test("while the owner is signed out the share is unavailable, not a sign-in prompt", async () => {
  const { db } = tempDb();
  const { token } = issue(db);
  const stored = db.findShareLinkByHash(hashShareToken(token));
  assert.ok(stored);
  const h = harness([stored]);
  h.account.ready = false;
  const result = await handlePublicShare(publicGet(token), h.deps);
  assert.equal(result.status, SHARE_STATUS.unavailable);
  assert.equal(h.loads(), 0);
});

test("a unit share whose unit has gone is not found", async () => {
  const token = createShareToken();
  const link = makeLink({
    scope: { kind: "unit", unitId: "gone" },
    tokenHash: hashShareToken(token),
  });
  const h = harness([link]);
  assert.equal((await handlePublicShare(publicGet(token), h.deps)).status, SHARE_STATUS.notFound);
});

test("the public route is GET or HEAD only and never touches the database", async () => {
  let looked = false;
  const h = harness();
  const deps = {
    ...h.deps,
    findLink: () => {
      looked = true;
      return undefined;
    },
  };
  for (const method of ["POST", "PUT", "DELETE", "PATCH"]) {
    const result = await handlePublicShare(
      { method, token: createShareToken(), clientKey: "a" },
      deps,
    );
    assert.equal(result.status, SHARE_STATUS.methodNotAllowed);
  }
  assert.equal(looked, false);
});

test("rate limiting applies to every public request, including bad tokens", async () => {
  const links: StoredShareLink[] = [];
  let at = T0;
  const deps: PublicShareDeps = {
    ...harness(links).deps,
    now: () => at,
    limiter: createRateLimiter({ limit: 2, windowMs: 60_000, now: () => at }),
  };
  await handlePublicShare(publicGet("x"), deps);
  await handlePublicShare(publicGet("y"), deps);
  const blocked = await handlePublicShare(publicGet("z"), deps);
  assert.equal(blocked.status, SHARE_STATUS.tooManyRequests);
  assert.equal(blocked.headers["retry-after"], "60");
  const otherClient = await handlePublicShare(publicGet("z", "198.51.100.9"), deps);
  assert.equal(otherClient.status, SHARE_STATUS.notFound);
});

test("the shell paths that skip the password are GET-only and exclude the API", () => {
  assert.equal(isUnauthenticatedShellPath("GET", "/share/abc"), true);
  assert.equal(isUnauthenticatedShellPath("HEAD", "/share/abc"), true);
  assert.equal(isUnauthenticatedShellPath("POST", "/share/abc"), false);
  assert.equal(isUnauthenticatedShellPath("GET", "/share/a/b"), false);
  assert.equal(isUnauthenticatedShellPath("GET", "/assets/index-1.js"), true);
  assert.equal(isUnauthenticatedShellPath("GET", "/logo.svg"), true);
  assert.equal(isUnauthenticatedShellPath("GET", "/api/shares"), false);
  assert.equal(isUnauthenticatedShellPath("GET", "/api/public/share/abc"), false);
  assert.equal(isUnauthenticatedShellPath("GET", "/settings"), false);
  assert.equal(isUnauthenticatedShellPath("GET", "/"), false);
});

test("owner routes only accept links that name existing items and units", () => {
  const { db } = tempDb();
  const base = {
    steamId: OWNER_STEAM_ID,
    now: () => T0,
    newId: () => LINK_ID,
    newToken: createShareToken,
    insert: (link: StoredShareLink) => db.insertShareLink(link),
    knownItemIds: new Set([PRIVATE.assetId]),
    unitIds: new Set([UNIT.id]),
  };
  const request = {
    hidePrices: false,
    expiry: "never" as const,
    currency: "USD",
    marketplace: "buff163" as const,
  };
  assert.throws(
    () => createOwnerShare({ ...request, scope: { kind: "unit", unitId: "1" } }, base),
    /doesn't exist/,
  );
  assert.throws(
    () =>
      createOwnerShare(
        { ...request, scope: { kind: "items", itemIds: [PRIVATE.assetId, "999"] } },
        base,
      ),
    /no longer in your inventory/,
  );
  const ok = createOwnerShare(
    { ...request, scope: { kind: "items", itemIds: [PRIVATE.assetId] } },
    base,
  );
  assert.equal(ok.link.scope.kind, "items");
});

test("the owner's list never includes a token, its hash or the steam id", () => {
  const { db } = tempDb();
  const { token } = issue(db, { hidePrices: true, expiry: "7d" });
  const listed = JSON.stringify(listOwnerShares(db.listShareLinks(OWNER_STEAM_ID)));
  assert.equal(listed.includes(token), false);
  assert.equal(listed.includes(hashShareToken(token)), false);
  assert.equal(listed.includes(OWNER_STEAM_ID), false);
  assert.match(listed, /"hidePrices":true/);
});

test("the API prefix is the one the public route matches", () => {
  assert.equal(SHARE_API.publicPrefix.endsWith("/"), true);
  assert.equal(SHARE_API.shares.startsWith(SHARE_API.publicPrefix), false);
});
