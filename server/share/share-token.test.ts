/* oxlint-disable typescript/no-floating-promises -- node:test registers suites synchronously */
import assert from "node:assert/strict";
import { test } from "node:test";
import { createShareToken, hashShareToken, isWellFormedToken } from "./share-token.ts";
import { SHARE_LIMITS } from "./share.config.ts";

test("tokens are base64url of the configured length and never repeat", () => {
  const tokens = new Set<string>();
  for (let i = 0; i < 200; i++) {
    const token = createShareToken();
    assert.equal(token.length, SHARE_LIMITS.tokenLength);
    assert.equal(isWellFormedToken(token), true);
    tokens.add(token);
  }
  assert.equal(tokens.size, 200);
});

test("well-formed check rejects wrong length, bad characters and padding", () => {
  const good = createShareToken();
  for (const bad of [
    "",
    good.slice(1),
    `${good}A`,
    `${good.slice(1)}+`,
    `${good.slice(1)}/`,
    `${good.slice(1)}=`,
    `${good.slice(1)}%`,
    `${good.slice(1)}.`,
    `${good.slice(1)} `,
    "x".repeat(SHARE_LIMITS.tokenLength - 1),
  ]) {
    assert.equal(isWellFormedToken(bad), false, JSON.stringify(bad));
  }
});

test("hashes are deterministic, hex and differ from the token", () => {
  const token = createShareToken();
  const hash = hashShareToken(token);
  assert.match(hash, /^[0-9a-f]{64}$/);
  assert.equal(hashShareToken(token), hash);
  assert.notEqual(hashShareToken(createShareToken()), hash);
  assert.equal(hash.includes(token), false);
});
